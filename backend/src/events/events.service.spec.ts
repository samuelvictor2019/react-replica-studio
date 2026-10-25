import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DashboardService } from '../dashboard/dashboard.service';
import { ResilientRedisService } from '../infrastructure/redis/resilient-redis-service';
import { Event, EventStatus } from './entities/event.entity';
import { EventType } from '../event-types/entities/event-type.entity';
import { EventsService } from './events.service';

describe('EventsService registration aliases', () => {
  const event = {
    id: 'f2f9dfae-1664-4ce7-9e16-4e901197c36a',
    title: 'Ethanim Conference',
    description: 'An event description',
    startDate: new Date('2027-06-06T07:00:00.000Z'),
    endDate: new Date('2027-06-08T08:00:00.000Z'),
    location: 'WGC',
    bannerImageUrl: null,
    status: EventStatus.PUBLISHED,
    slug: 'ethanim2026',
    eventType: { id: 'type-id', name: 'Conference', slug: 'conference' },
    participants: [{ email: 'private@example.com' }],
  } as unknown as Event;

  let eventRepository: jest.Mocked<Pick<Repository<Event>, 'findOne' | 'find' | 'create' | 'save' | 'softRemove' | 'increment' | 'decrement' | 'createQueryBuilder' | 'update'>>;
  let eventTypeRepository: jest.Mocked<Pick<Repository<EventType>, 'createQueryBuilder'>>;
  let redis: jest.Mocked<Pick<ResilientRedisService, 'get' | 'set' | 'deleteByPrefix'>>;
  let dashboard: jest.Mocked<Pick<DashboardService, 'incrementStat' | 'decrementStat'>>;
  let service: EventsService;

  beforeEach(() => {
    eventRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((value) => value as Event),
      save: jest.fn(),
      softRemove: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
    };
    eventTypeRepository = {
      createQueryBuilder: jest.fn(),
    };
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    dashboard = {
      incrementStat: jest.fn(),
      decrementStat: jest.fn(),
    };

    service = new EventsService(
      eventRepository as unknown as Repository<Event>,
      eventTypeRepository as unknown as Repository<EventType>,
      redis as unknown as ResilientRedisService,
      dashboard as unknown as DashboardService,
    );
  });

  it('normalizes a public alias and does not return participant records', async () => {
    eventRepository.findOne.mockResolvedValue(event);

    const result = await service.findRegistrationEvent('Ethanim2026');

    expect(eventRepository.findOne).toHaveBeenCalledWith({
      where: { slug: 'ethanim2026' },
      relations: { eventType: true },
    });
    expect(result).toMatchObject({ id: event.id, slug: 'ethanim2026' });
    expect(result).not.toHaveProperty('participants');
    expect(JSON.stringify(result)).not.toContain('private@example.com');
  });

  it('continues to resolve legacy UUID links', async () => {
    eventRepository.findOne.mockResolvedValue(event);

    await service.findRegistrationEvent(event.id);

    expect(eventRepository.findOne).toHaveBeenCalledWith({
      where: { id: event.id },
      relations: { eventType: true },
    });
  });

  it('does not resolve draft events for public registration', async () => {
    eventRepository.findOne.mockResolvedValue({ ...event, status: EventStatus.DRAFT });

    await expect(service.findRegistrationEvent('ethanim2026')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps the alias stable when the event title changes', async () => {
    eventRepository.findOne.mockResolvedValue(event);
    eventRepository.save.mockImplementation(async (updated) => updated as Event);

    const updated = await service.update(event.id, { title: 'Updated Ethanim Conference' });

    expect(updated.slug).toBe('ethanim2026');
  });

  it('allocates the next number atomically and resets the sequence for a new year', async () => {
    const queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [{ registrationSequence: '100' }] }),
    };
    eventTypeRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

    await expect(service.nextRegistrationSequence('type-id', 2026)).resolves.toBe(100);

    expect(queryBuilder.update).toHaveBeenCalledWith(EventType);
    expect(queryBuilder.set).toHaveBeenCalledWith({
      registrationSequenceYear: 2026,
      registrationSequence: expect.any(Function),
    });
    const sequenceExpression = queryBuilder.set.mock.calls[0][0].registrationSequence();
    expect(sequenceExpression).toContain('"registrationSequenceYear" = 2026');
    expect(sequenceExpression).toContain('THEN "registrationSequence" + 1 ELSE 1');
    expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 'type-id' });
    expect(queryBuilder.returning).toHaveBeenCalledWith('"registrationSequence"');
  });

  it('fails clearly when the event type sequence cannot be allocated', async () => {
    const queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [] }),
    };
    eventTypeRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);

    await expect(service.nextRegistrationSequence('missing-type', 2026)).rejects.toThrow(
      'Could not allocate a registration number for event type missing-type',
    );
  });
});
