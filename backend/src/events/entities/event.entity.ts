import { BaseEntity } from '../../common/entities/base.entities.js';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Participant } from '../../participant/entities/participant.entity.js';
import { EventType } from '../../event-types/entities/event-type.entity.js';

export type EventDailyScheduleItem = {
  day: string;
  session: string;
  time: string;
};

function parseDailySchedule(value: unknown): EventDailyScheduleItem[] {
  if (typeof value === 'string') {
    if (!value.trim()) return [];
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value.filter((item): item is EventDailyScheduleItem =>
    Boolean(
      item &&
        typeof item === 'object' &&
        typeof item.day === 'string' &&
        typeof item.session === 'string' &&
        typeof item.time === 'string',
    ),
  );
}

export const dailyScheduleTransformer = {
  to(value: unknown): string {
    return JSON.stringify(parseDailySchedule(value));
  },
  from(value: unknown): EventDailyScheduleItem[] {
    return parseDailySchedule(value);
  },
};

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ONGOING = 'ongoing',
}

@Entity('Events')
export class Event extends BaseEntity {
  @ManyToOne(() => EventType, (eventType) => eventType.events, {
    eager: true,
  })
  @JoinColumn({ name: 'typeId' })
  eventType: EventType;

  @Column({ nullable: true })
  typeId: string;
  @Column({ type: 'varchar', length: 500, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 500, unique: true, nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz', nullable: false })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endDate: Date;

  @Column({ type: 'text', nullable: true, transformer: dailyScheduleTransformer })
  dailySchedule: EventDailyScheduleItem[];

  @Column({ type: 'varchar', length: 500, nullable: false })
  location: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  bannerImageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  price: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @OneToMany(() => Participant, (participant) => participant.event)
  participants: Participant[];

  @Column({ type: 'int', default: 0 })
  registrationCount: number;
}
