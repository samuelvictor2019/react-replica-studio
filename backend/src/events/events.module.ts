import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity.js';
import { EventType } from '../event-types/entities/event-type.entity.js';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { EventLifecycleCronService } from './events-expiration.cron.js';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventType])],
  controllers: [EventsController],
  providers: [EventsService, EventLifecycleCronService],
  exports: [EventsService],
})
export class EventsModule {}
