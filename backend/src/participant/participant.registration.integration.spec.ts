import { Repository } from 'typeorm';
import { DashboardService } from '../dashboard/dashboard.service';
import { Event, EventStatus } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { EventType } from '../event-types/entities/event-type.entity';
import { NotificationService } from '../notifications/notification.service';
import { ResilientRedisService } from '../infrastructure/redis/resilient-redis-service';
import { ActivitiesService } from '../activities/activities.service';
import { Participant } from './entities/participant.entity';
import { RegisterParticipantDto } from './dto/participant.dto';
import { ParticipantService } from './participant.service';

describe('participant registration ticket integration', () => {
  const eventId = 'f2f9dfae-1664-4ce7-9e16-4e901197c36a';
  const event = {
    id: eventId,
    status: EventStatus.PUBLISHED,
    title: 'Ethanim Gathering',
    description: 'A community gathering',
    startDate: new Date('2026-11-15T10:00:00.000Z'),
    endDate: new Date('2026-11-15T15:00:00.000Z'),
    location: 'Main Hall',
    bannerImageUrl: null,
    eventType: { id: 'event-type-id', slug: 'ethanim' },
  } as Event;
  const dto = {
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'jordan@example.com',
    consent: true,
    contactConsent: true,
    selectedDays: ['2026-11-15'],
  } as RegisterParticipantDto;

  it('allocates a ticket and passes it to the real registration notification flow', async () => {
    const participant = {
      id: 'participant-id',
      selectedDays: dto.selectedDays,
    };
    const participantRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue(participant),
    };
    const eventRepository = {
      findOne: jest.fn().mockResolvedValue(event),
      increment: jest.fn().mockResolvedValue(undefined),
    };
    const queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [{ registrationSequence: 1 }] }),
    };
    const eventTypeRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      deleteByPrefix: jest.fn().mockResolvedValue(undefined),
    };
    const dashboard = {
      incrementStat: jest.fn(),
      decrementStat: jest.fn(),
    };
    const notificationService = { send: jest.fn().mockResolvedValue(undefined) };
    const activitiesService = { logActivity: jest.fn().mockResolvedValue(undefined) };

    const eventsService = new EventsService(
      eventRepository as unknown as Repository<Event>,
      eventTypeRepository as unknown as Repository<EventType>,
      redis as unknown as ResilientRedisService,
      dashboard as unknown as DashboardService,
    );
    const participantService = new ParticipantService(
      participantRepository as unknown as Repository<Participant>,
      eventsService,
      notificationService as unknown as NotificationService,
      redis as unknown as ResilientRedisService,
      activitiesService as unknown as ActivitiesService,
    );

    await participantService.register(eventId, dto);

    const sequenceExpression = queryBuilder.set.mock.calls[0][0].registrationSequence();
    const year = new Date().getFullYear();
    expect(sequenceExpression).toContain(`"registrationSequenceYear" = ${year}`);
    expect(eventTypeRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(notificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: expect.objectContaining({ email: 'jordan@example.com' }),
        context: expect.objectContaining({
          ticketNumber: `ETHANIM${String(year).slice(-2)}01`,
        }),
      }),
    );
    expect(eventRepository.increment).toHaveBeenCalledWith(
      { id: eventId },
      'registrationCount',
      1,
    );
  });
});
