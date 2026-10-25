import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, SelectQueryBuilder, LessThan, In } from 'typeorm';
import { isUUID } from 'class-validator';
import { Event, EventStatus } from './entities/event.entity.js';
import { EventType } from '../event-types/entities/event-type.entity.js';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto.js';
import { ResilientRedisService } from '../infrastructure/redis/resilient-redis-service.js';
import { EVENT_CACHE } from '../common/redis/cache.constants.js';
import { DashboardService } from '../dashboard/dashboard.service.js';
import { createHash } from 'crypto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
    private readonly redis: ResilientRedisService,
    private readonly dashboardService: DashboardService,
  ) { }

  private hashQuery(params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {});

    return createHash('sha256')
      .update(JSON.stringify(sorted))
      .digest('hex')
      .slice(0, 16);
  }

  private async invalidateEventCache(): Promise<void> {
    await this.redis.deleteByPrefix(EVENT_CACHE.NAMESPACE);
  }

  private assertDateOrder(startDate: string | Date, endDate: string | Date): void {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException(
        'Start date must be earlier than end date',
      );
    }
  }

  async create(dto: CreateEventDto): Promise<Event> {
    this.assertDateOrder(dto.startDate, dto.endDate);

    const slug = dto.slug?.trim()
      ? this.normalizeSlug(dto.slug)
      : this.generateSlug(dto.title);

    const event = this.eventRepository.create({
      ...dto,
      slug,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      dailySchedule: dto.dailySchedule || [],
    });

    let saved: Event;
    try {
      saved = await this.eventRepository.save(event);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException('This registration alias is already in use');
      }
      throw error;
    }
    this.logger.log(`Event created: "${saved.title}" (${saved.slug})`);

    await this.invalidateEventCache();
    await this.dashboardService.incrementStat('events');

    return saved;
  }

  async findAll(query: EventQueryDto): Promise<{ data: Event[]; total: number }> {
    const cacheKey = `${EVENT_CACHE.LIST_PREFIX}${this.hashQuery(query as unknown as Record<string, unknown>)}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .loadRelationIdAndMap('event.participantCount', 'event.participants');

    this.applyFilters(qb, query);

    qb.orderBy('event.startDate', query.order || 'DESC')
      .skip(query.skip)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    const result = { data, total };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', EVENT_CACHE.TTL_SEC);

    return result;
  }

  async findUpcoming(limit = 10): Promise<Event[]> {
    const cacheKey = `${EVENT_CACHE.UPCOMING_PREFIX}${limit}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .loadRelationIdAndMap('event.participantCount', 'event.participants')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.endDate >= :now', { now: new Date() })
      .orderBy('event.startDate', 'ASC')
      .take(limit)
      .getMany();

    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', EVENT_CACHE.TTL_SEC);

    return data;
  }

  async findGroupedByStatus(limit = 10): Promise<{
    upcoming: Event[];
    ongoing: Event[];
    past: Event[];
  }> {
    const cacheKey = `events:grouped:${limit}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [upcoming, ongoing, past] = await Promise.all([
      this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.eventType', 'eventType')
        .where('event.status = :status', { status: EventStatus.PUBLISHED })
        .orderBy('event.startDate', 'ASC')
        .take(limit)
        .getMany(),

      this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.eventType', 'eventType')
        .where('event.status = :status', { status: EventStatus.ONGOING })
        .orderBy('event.startDate', 'ASC')
        .take(limit)
        .getMany(),

      this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.eventType', 'eventType')
        .where('event.status = :status', { status: EventStatus.COMPLETED })
        .orderBy('event.endDate', 'DESC')
        .take(limit)
        .getMany(),
    ]);

    const result = { upcoming, ongoing, past };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', EVENT_CACHE.TTL_SEC);

    return result;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug: this.normalizeSlug(slug) },
      relations: { eventType: true },
    });
    if (!event) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }

    return event;
  }

  async findRegistrationEvent(identifier: string) {
    const event = isUUID(identifier)
      ? await this.eventRepository.findOne({
          where: { id: identifier },
          relations: { eventType: true },
        })
      : await this.eventRepository.findOne({
          where: { slug: this.normalizeSlug(identifier) },
          relations: { eventType: true },
        });

    if (
      !event ||
      ![EventStatus.PUBLISHED, EventStatus.ONGOING].includes(event.status)
    ) {
      throw new NotFoundException('Registration event not found');
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      bannerImageUrl: event.bannerImageUrl,
      status: event.status,
      slug: event.slug,
      eventType: event.eventType
        ? {
            id: event.eventType.id,
            name: event.eventType.name,
            slug: event.eventType.slug,
          }
        : null,
    };
  }

  async findOne(id: string): Promise<Event> {
    const cacheKey = `${EVENT_CACHE.DETAIL_PREFIX}${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { eventType: true },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    await this.redis.set(cacheKey, JSON.stringify(event), 'EX', EVENT_CACHE.TTL_SEC);

    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (dto.startDate) {
      (dto as any).startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      (dto as any).endDate = new Date(dto.endDate);
    }

    const effectiveStart = dto.startDate ? new Date(dto.startDate) : event.startDate;
    const effectiveEnd = dto.endDate ? new Date(dto.endDate) : event.endDate;
    this.assertDateOrder(effectiveStart, effectiveEnd);

    Object.assign(event, dto);
    if (dto.slug !== undefined) {
      event.slug = this.normalizeSlug(dto.slug);
    }

    let updated: Event;
    try {
      updated = await this.eventRepository.save(event);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException('This registration alias is already in use');
      }
      throw error;
    }
    this.logger.log(`Event updated: "${updated.title}"`);

    await this.invalidateEventCache();

    return updated;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.softRemove(event);
    this.logger.log(`Event soft-deleted: ${id}`);

    await this.invalidateEventCache();
    await this.dashboardService.decrementStat('events');
  }

  async incrementRegistrationCount(eventId: string): Promise<void> {
    await this.eventRepository.increment({ id: eventId }, 'registrationCount', 1);
    await this.invalidateEventCache();
  }

  async nextRegistrationSequence(eventTypeId: string, year: number): Promise<number> {
    const result = await this.eventTypeRepository
      .createQueryBuilder()
      .update(EventType)
      .set({
        registrationSequenceYear: year,
        registrationSequence: () =>
          `CASE WHEN "registrationSequenceYear" = ${year} THEN "registrationSequence" + 1 ELSE 1 END`,
      })
      .where('id = :id', { id: eventTypeId })
      .returning('"registrationSequence"')
      .execute();

    const sequence = Number(result.raw[0]?.registrationSequence);
    if (!Number.isInteger(sequence)) {
      throw new Error(`Could not allocate a registration number for event type ${eventTypeId}`);
    }

    return sequence;
  }

  async decrementRegistrationCount(eventId: string): Promise<void> {
    await this.eventRepository.decrement({ id: eventId }, 'registrationCount', 1);
    await this.invalidateEventCache();
  }


  async markOngoingEvents(): Promise<number> {
    const now = new Date();

    const result = await this.eventRepository
      .createQueryBuilder()
      .update(Event)
      .set({ status: EventStatus.ONGOING })
      .where('status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('"startDate" <= :now', { now })
      .andWhere('"endDate" >= :now', { now })
      .execute();

    const affected = result.affected ?? 0;

    if (affected > 0) {
      this.logger.log(`Transitioned ${affected} event(s) to ongoing`);
      await this.invalidateEventCache();
    }

    return affected;
  }


  async markExpiredEventsAsCompleted(): Promise<number> {
    const result = await this.eventRepository.update(
      {
        status: In([EventStatus.PUBLISHED, EventStatus.ONGOING]),
        endDate: LessThan(new Date()),
      },
      { status: EventStatus.COMPLETED },
    );

    const affected = result.affected ?? 0;

    if (affected > 0) {
      this.logger.log(`Auto-completed ${affected} expired event(s)`);
      await this.invalidateEventCache();
    }

    return affected;
  }

  private applyFilters(qb: SelectQueryBuilder<Event>, query: EventQueryDto): void {
    const { typeId, status, search, fromDate, toDate } = query;

    if (fromDate) {
      qb.andWhere('DATE(event.endDate) >= DATE(:fromDate)', { fromDate });
    }

    if (toDate) {
      qb.andWhere('DATE(event.startDate) <= DATE(:toDate)', { toDate });
    }

    if (typeId) {
      qb.andWhere('event.typeId = :typeId', { typeId });
    }

    if (status) {
      qb.andWhere('event.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
  }

  private generateSlug(title: string): string {
    const baseSlug = this.normalizeSlug(title);

    const uniqueSuffix = Date.now().toString(36);
    return `${baseSlug}-${uniqueSuffix}`;
  }

  private normalizeSlug(value: string): string {
    const slug = value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestException('Registration alias must contain letters or numbers');
    }
    if (isUUID(slug)) {
      throw new BadRequestException('Registration alias cannot be a UUID');
    }

    return slug;
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    );
  }
}
