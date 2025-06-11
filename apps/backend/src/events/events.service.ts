import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarsService } from '../calendars/calendars.service';
import { PlatformEventDto } from '../calendars/interfaces/calendar-platform.interface';
import {
  EventResponseDto,
  CreateEventRequestDto,
  UpdateEventRequestDto,
  GetEventsQueryDto,
} from './dto/events.dto';
import { Event, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private calendarsService: CalendarsService,
  ) {}

  async createEventForUser(
    userId: string,
    dto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    // Verify the calendar belongs to the user
    const calendar = await this.prisma.calendar.findFirst({
      where: {
        id: dto.calendarId,
        userId,
      },
      include: {
        connectedAccount: true,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    try {
      // Create event on external platform first
      let platformEvent: PlatformEventDto | null = null;
      if (calendar.connectedAccount) {
        platformEvent = await this.calendarsService.createPlatformEvent(
          calendar.connectedAccountId!,
          {
            calendarId: calendar.externalId,
            title: dto.title,
            description: dto.description,
            startTime: dto.startTime,
            endTime: dto.endTime,
            isAllDay: dto.isAllDay,
            location: dto.location,
          },
        );
      }

      // Create local event record
      const event = await this.prisma.event.create({
        data: {
          userId,
          calendarId: dto.calendarId,
          externalId: platformEvent?.id || undefined,
          title: dto.title,
          description: dto.description,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          isAllDay: dto.isAllDay || false,
          location: dto.location,
          url: dto.url || platformEvent?.htmlLink || undefined,
          status: dto.status || platformEvent?.status || undefined,
          visibility: dto.visibility || platformEvent?.privacy || undefined,
          lastSyncedAt: platformEvent ? new Date() : undefined,
          syncStatus: platformEvent ? 'synced' : 'local_only',
        },
      });

      return this.toResponseDto(event);
    } catch (_error) {
      // If platform creation fails, still create local event
      const event = await this.prisma.event.create({
        data: {
          userId,
          calendarId: dto.calendarId,
          title: dto.title,
          description: dto.description,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          isAllDay: dto.isAllDay || false,
          location: dto.location,
          url: dto.url,
          status: dto.status,
          visibility: dto.visibility,
          syncStatus: 'sync_failed',
        },
      });

      return this.toResponseDto(event);
    }
  }

  async getEventsForUser(
    userId: string,
    query: GetEventsQueryDto,
  ): Promise<EventResponseDto[]> {
    const where: Prisma.EventWhereInput = { userId };

    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) {
        where.startTime.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startTime.lte = new Date(query.endDate);
      }
    }

    if (query.calendarIds?.length) {
      where.calendarId = { in: query.calendarIds };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return events.map((event) => this.toResponseDto(event));
  }

  async getEventById(
    userId: string,
    eventId: string,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.toResponseDto(event);
  }

  async updateEvent(
    userId: string,
    eventId: string,
    dto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
      include: {
        calendar: {
          include: {
            connectedAccount: true,
          },
        },
      },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    try {
      // Update event on external platform if it exists
      let platformEvent: PlatformEventDto | null = null;
      if (existingEvent.externalId && existingEvent.calendar.connectedAccount) {
        platformEvent = await this.calendarsService.updatePlatformEvent(
          existingEvent.calendar.connectedAccountId!,
          existingEvent.calendar.externalId,
          existingEvent.externalId,
          {
            title: dto.title,
            description: dto.description,
            startTime: dto.startTime,
            endTime: dto.endTime,
            isAllDay: dto.isAllDay,
            location: dto.location,
            url: dto.url,
            status: dto.status,
            visibility: dto.visibility,
          },
        );
      }

      // Update local event record
      const event = await this.prisma.event.update({
        where: { id: eventId },
        data: {
          title: dto.title ?? existingEvent.title,
          description: dto.description ?? existingEvent.description,
          startTime: dto.startTime
            ? new Date(dto.startTime)
            : existingEvent.startTime,
          endTime: dto.endTime ? new Date(dto.endTime) : existingEvent.endTime,
          isAllDay: dto.isAllDay ?? existingEvent.isAllDay,
          location: dto.location ?? existingEvent.location,
          url: dto.url ?? platformEvent?.htmlLink ?? existingEvent.url,
          status: dto.status ?? platformEvent?.status ?? existingEvent.status,
          visibility:
            dto.visibility ??
            platformEvent?.privacy ??
            existingEvent.visibility,
          lastSyncedAt: platformEvent ? new Date() : existingEvent.lastSyncedAt,
          syncStatus: platformEvent
            ? 'synced'
            : existingEvent.externalId
              ? 'sync_failed'
              : 'local_only',
          updatedAt: new Date(),
        },
      });

      return this.toResponseDto(event);
    } catch (_error) {
      // If platform update fails, still update local event
      const event = await this.prisma.event.update({
        where: { id: eventId },
        data: {
          title: dto.title ?? existingEvent.title,
          description: dto.description ?? existingEvent.description,
          startTime: dto.startTime
            ? new Date(dto.startTime)
            : existingEvent.startTime,
          endTime: dto.endTime ? new Date(dto.endTime) : existingEvent.endTime,
          isAllDay: dto.isAllDay ?? existingEvent.isAllDay,
          location: dto.location ?? existingEvent.location,
          url: dto.url ?? existingEvent.url,
          status: dto.status ?? existingEvent.status,
          visibility: dto.visibility ?? existingEvent.visibility,
          syncStatus: existingEvent.externalId ? 'sync_failed' : 'local_only',
          updatedAt: new Date(),
        },
      });

      return this.toResponseDto(event);
    }
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
      include: {
        calendar: {
          include: {
            connectedAccount: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      // Delete event on external platform if it exists
      if (event.externalId && event.calendar.connectedAccount) {
        await this.calendarsService.deletePlatformEvent(
          event.calendar.connectedAccountId!,
          event.calendar.externalId,
          event.externalId,
        );
      }
    } catch (_error) {
      // Continue with local deletion even if platform deletion fails
      // Could log this error for monitoring
    }

    // Delete local event record
    await this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  private toResponseDto = (event: Event): EventResponseDto => {
    return {
      id: event.id,
      externalId: event.externalId || undefined,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      isAllDay: event.isAllDay || undefined,
      location: event.location || undefined,
      url: event.url || undefined,
      status: event.status || undefined,
      visibility: event.visibility || undefined,
      recurrenceRule: event.recurrenceRule || undefined,
      lastSyncedAt: event.lastSyncedAt?.toISOString(),
      syncStatus: event.syncStatus || undefined,
      calendarId: event.calendarId,
      userId: event.userId,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  };
}
