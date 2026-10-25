import { BadRequestException, ConflictException } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../events/entities/event.entity';
import { NotificationService } from '../notifications/notification.service';
import { ResilientRedisService } from '../infrastructure/redis/resilient-redis-service';
import { ActivitiesService } from '../activities/activities.service';
import { Participant } from './entities/participant.entity';
import { RegisterParticipantDto } from './dto/participant.dto';
import { ParticipantService } from './participant.service';

describe('ParticipantService registration tickets', () => {
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
  };
  const dto = {
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'JORDAN@example.com',
    consent: true,
    contactConsent: true,
    selectedDays: ['2026-11-15'],
  } as RegisterParticipantDto;

  let participantRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let eventsService: {
    findOne: jest.Mock;
    incrementRegistrationCount: jest.Mock;
    nextRegistrationSequence: jest.Mock;
  };
  let notificationService: { send: jest.Mock };
  let redis: { deleteByPrefix: jest.Mock };
  let activitiesService: { logActivity: jest.Mock };
  let service: ParticipantService;

  beforeEach(() => {
    participantRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockImplementation(async (value) => ({
        ...value,
        id: 'participant-id',
        selectedDays: value.selectedDays,
      })),
    };
    eventsService = {
      findOne: jest.fn().mockResolvedValue(event),
      incrementRegistrationCount: jest.fn().mockResolvedValue(undefined),
      nextRegistrationSequence: jest.fn().mockResolvedValue(1),
    };
    notificationService = { send: jest.fn().mockResolvedValue(undefined) };
    redis = { deleteByPrefix: jest.fn().mockResolvedValue(undefined) };
    activitiesService = { logActivity: jest.fn().mockResolvedValue(undefined) };

    service = new ParticipantService(
      participantRepository as never,
      eventsService as unknown as EventsService,
      notificationService as unknown as NotificationService,
      redis as unknown as ResilientRedisService,
      activitiesService as unknown as ActivitiesService,
    );
  });

  it('creates a registration and sends its type, year, and zero-padded ticket number', async () => {
    const result = await service.register(eventId, dto);
    const year = new Date().getFullYear();
    const email = notificationService.send.mock.calls[0][0];

    expect(result.id).toBe('participant-id');
    expect(participantRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jordan@example.com', eventId }),
    );
    expect(eventsService.nextRegistrationSequence).toHaveBeenCalledWith(
      'event-type-id',
      year,
    );
    expect(email.context.ticketNumber).toBe(`ETHANIM${String(year).slice(-2)}01`);
    expect(email.channels).toEqual(['email', 'sms']);
  });

  it('expands the ticket number without truncating counts beyond four digits', async () => {
    eventsService.nextRegistrationSequence.mockResolvedValue(10000);

    await service.register(eventId, dto);

    const year = String(new Date().getFullYear()).slice(-2);
    expect(notificationService.send.mock.calls[0][0].context.ticketNumber).toBe(
      `ETHANIM${year}10000`,
    );
  });

  it('rejects duplicate registrations before allocating a ticket number', async () => {
    participantRepository.findOne.mockResolvedValue({ id: 'existing-participant' });

    await expect(service.register(eventId, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(eventsService.nextRegistrationSequence).not.toHaveBeenCalled();
    expect(notificationService.send).not.toHaveBeenCalled();
  });

  it('rejects registrations for events that are not accepting registrations', async () => {
    eventsService.findOne.mockResolvedValue({ ...event, status: EventStatus.DRAFT });

    await expect(service.register(eventId, dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(participantRepository.save).not.toHaveBeenCalled();
  });
});
