import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { GoogleCalendarService } from './services/google-calendar.service';
import { MicrosoftCalendarService } from './services/microsoft-calendar.service';
import {
  CalendarResponseDto,
  PlatformCalendarDto,
  PlatformEventDto,
  CreatePlatformEventDto,
  UpdatePlatformEventDto,
  FetchPlatformEventsQueryDto,
  FetchPlatformEventsResponseDto,
  PlatformTokenResponseDto,
  ICalendarPlatformService,
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from '@unical/core';
import { Calendar, Prisma } from '@prisma/client';

@Injectable()
export class CalendarsService {
  private readonly logger = new Logger(CalendarsService.name);
  private readonly platformServices: Map<string, ICalendarPlatformService>;

  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
    private googleCalendarService: GoogleCalendarService,
    private microsoftCalendarService: MicrosoftCalendarService,
    private configService: ConfigService,
  ) {
    this.platformServices = new Map();
    this.platformServices.set('google', this.googleCalendarService);
    this.platformServices.set('microsoft', this.microsoftCalendarService);
  }

  getAuthorizationUrl(provider: string): string {
    const platformService = this.getPlatformService(provider);
    return platformService.getAuthorizationUrl(this.getRedirectUri(provider));
  }

  async exchangeCodeForTokens(
    provider: string,
    code: string,
    redirectUri: string,
  ): Promise<PlatformTokenResponseDto> {
    const platformService = this.getPlatformService(provider);
    return platformService.exchangeCodeForTokens(code, redirectUri);
  }

  private getRedirectUri(provider: string): string {
    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
    return `${baseUrl}/api/accounts/connect/${provider}/callback`;
  }

  private getPlatformService(provider: string): ICalendarPlatformService {
    const service = this.platformServices.get(provider);
    if (!service) {
      throw new NotFoundException(
        `Platform service not found for provider: ${provider}`,
      );
    }
    return service;
  }

  async getCalendarsForAccount(
    userId: string,
    connectedAccountId: string,
  ): Promise<PlatformCalendarDto[]> {
    const account = await this.accountsService.getConnectedAccountById(
      userId,
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.getCalendars(accessToken);
  }

  async getEventsForAccount(
    userId: string,
    connectedAccountId: string,
    query: FetchPlatformEventsQueryDto,
  ): Promise<FetchPlatformEventsResponseDto> {
    const account = await this.accountsService.getConnectedAccountById(
      userId,
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.getEvents(accessToken, query);
  }

  async createPlatformEvent(
    connectedAccountId: string,
    eventData: CreatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    // Get account info to determine platform
    const account = await this.accountsService.getConnectedAccountById(
      'system', // TODO: Get actual user ID
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.createEvent(accessToken, eventData);
  }

  async updatePlatformEvent(
    connectedAccountId: string,
    calendarId: string,
    eventId: string,
    eventData: UpdatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    const account = await this.accountsService.getConnectedAccountById(
      'system', // TODO: Get actual user ID
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.updateEvent(
      accessToken,
      calendarId,
      eventId,
      eventData,
    );
  }

  async deletePlatformEvent(
    connectedAccountId: string,
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    const account = await this.accountsService.getConnectedAccountById(
      'system', // TODO: Get actual user ID
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.deleteEvent(accessToken, calendarId, eventId);
  }

  async refreshAccountTokens(connectedAccountId: string): Promise<void> {
    try {
      // Get current account info
      const account = await this.accountsService.getConnectedAccountById(
        'system', // TODO: Get actual user ID
        connectedAccountId,
      );

      const refreshToken =
        await this.accountsService.getDecryptedRefreshToken(connectedAccountId);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const platformService = this.getPlatformService(account.provider);
      const newTokens = await platformService.refreshAccessToken(refreshToken);

      // Update stored tokens
      await this.accountsService.updateConnectedAccountTokens(
        connectedAccountId,
        {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt,
        },
      );

      this.logger.log(`Refreshed tokens for account ${connectedAccountId}`);
    } catch (error) {
      this.logger.error(
        `Failed to refresh tokens for account ${connectedAccountId}`,
        error,
      );
      throw error;
    }
  }

  async getUserCalendars(
    userId: string,
    includeHidden: boolean = false,
  ): Promise<CalendarResponseDto[]> {
    const calendars = await this.prisma.calendar.findMany({
      where: {
        userId,
        ...(includeHidden ? {} : { isVisible: true }),
      },
      include: {
        connectedAccount: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
          },
        },
        settings: {
          where: { userId },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return calendars.map((calendar) => this.toCalendarResponseDto(calendar));
  }

  async syncCalendar(
    userId: string,
    dto: {
      connectedAccountId: string;
      externalCalendarId: string;
      name: string;
      description?: string;
      color?: string;
      timeZone?: string;
    },
  ): Promise<CalendarResponseDto> {
    // Verify the connected account belongs to the user
    const _connectedAccount =
      await this.accountsService.getConnectedAccountById(
        userId,
        dto.connectedAccountId,
      );

    // Check if calendar is already synced
    const existingCalendar = await this.prisma.calendar.findUnique({
      where: {
        externalId_connectedAccountId: {
          externalId: dto.externalCalendarId,
          connectedAccountId: dto.connectedAccountId,
        },
      },
    });

    if (existingCalendar) {
      throw new Error('Calendar is already being synced');
    }

    // Create calendar record
    const calendar = await this.prisma.calendar.create({
      data: {
        externalId: dto.externalCalendarId,
        name: dto.name,
        description: dto.description,
        color: dto.color,
        timeZone: dto.timeZone,
        isDefault: false,
        isVisible: true,
        connectedAccountId: dto.connectedAccountId,
        userId,
      },
      include: {
        connectedAccount: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    // Create default settings for the calendar
    await this.prisma.userCalendarSetting.create({
      data: {
        userId,
        calendarId: calendar.id,
        syncEnabled: true,
        conflictResolution: 'last_update_wins',
        notificationsEnabled: true,
        defaultEventDuration: 60, // 1 hour default
      },
    });

    this.logger.log(
      `Started syncing calendar ${dto.externalCalendarId} for user ${userId}`,
    );

    // TODO: Trigger initial sync of events
    // This would be implemented when we build the SyncModule

    return this.toCalendarResponseDto(calendar);
  }

  async updateCalendarSettings(
    userId: string,
    calendarId: string,
    dto: {
      isVisible?: boolean;
      color?: string;
      name?: string;
    },
  ): Promise<CalendarResponseDto> {
    // Verify calendar belongs to user
    const calendar = await this.prisma.calendar.findFirst({
      where: {
        id: calendarId,
        userId,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    // Update calendar
    const updatedCalendar = await this.prisma.calendar.update({
      where: { id: calendarId },
      data: {
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.name !== undefined && { name: dto.name }),
        updatedAt: new Date(),
      },
      include: {
        connectedAccount: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
          },
        },
        settings: {
          where: { userId },
        },
      },
    });

    return this.toCalendarResponseDto(updatedCalendar);
  }

  async unsyncCalendar(userId: string, calendarId: string): Promise<void> {
    // Verify calendar belongs to user
    const calendar = await this.prisma.calendar.findFirst({
      where: {
        id: calendarId,
        userId,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    // Delete calendar and related data (cascade will handle events and settings)
    await this.prisma.calendar.delete({
      where: { id: calendarId },
    });

    this.logger.log(`Unsynced calendar ${calendarId} for user ${userId}`);
  }

  // Helper method to convert Prisma calendar to DTO
  private toCalendarResponseDto(calendar: Calendar): CalendarResponseDto {
    return {
      id: calendar.id,
      externalId: calendar.externalId || undefined,
      name: calendar.name,
      description: calendar.description || undefined,
      color: calendar.color || undefined,
      timeZone: calendar.timeZone || undefined,
      isDefault: calendar.isDefault || false,
      isVisible: calendar.isVisible || true,
      connectedAccountId: calendar.connectedAccountId || undefined,
      userId: calendar.userId,
      createdAt: calendar.createdAt.toISOString(),
      updatedAt: calendar.updatedAt.toISOString(),
    };
  }

  // Webhook and Sync Token Management Methods

  async createWebhookSubscription(
    connectedAccountId: string,
    platformCalendarId: string,
  ): Promise<{ subscriptionId: string; expiresAt?: Date }> {
    const account = await this.accountsService.getConnectedAccountById(
      'system', // TODO: Get actual user ID
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    const webhookUrl = `${
      this.configService.get<string>('BASE_URL') || 'http://localhost:3001'
    }/api/calendars/webhooks/${account.provider}`;

    const subscription = await platformService.createWebhookSubscription(
      accessToken,
      platformCalendarId,
      webhookUrl,
    );

    // Save webhook subscription to database
    await this.prisma.webhookSubscription.create({
      data: {
        platformSubscriptionId: subscription.id,
        connectedAccountId,
        platformCalendarId,
        webhookUrl,
        expiresAt: subscription.expirationTimestamp
          ? new Date(subscription.expirationTimestamp)
          : null,
        active: true,
      },
    });

    return {
      subscriptionId: subscription.id,
      expiresAt: subscription.expirationTimestamp
        ? new Date(subscription.expirationTimestamp)
        : undefined,
    };
  }

  async stopWebhookSubscription(
    connectedAccountId: string,
    platformCalendarId: string,
  ): Promise<void> {
    const account = await this.accountsService.getConnectedAccountById(
      'system', // TODO: Get actual user ID
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    // Get the webhook subscription from database
    const webhookSub = await this.prisma.webhookSubscription.findUnique({
      where: {
        connectedAccountId_platformCalendarId: {
          connectedAccountId,
          platformCalendarId,
        },
      },
    });

    if (webhookSub) {
      const platformService = this.getPlatformService(account.provider);

      try {
        await platformService.deleteWebhookSubscription(
          accessToken,
          webhookSub.platformSubscriptionId,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to stop webhook on platform for ${webhookSub.platformSubscriptionId}:`,
          error,
        );
      }

      // Mark as inactive in database
      await this.prisma.webhookSubscription.update({
        where: { id: webhookSub.id },
        data: { active: false, updatedAt: new Date() },
      });
    }
  }

  async getLastSyncToken(
    connectedAccountId: string,
    platformCalendarId: string,
  ): Promise<string | null> {
    const syncState = await this.prisma.calendarSyncState.findUnique({
      where: {
        connectedAccountId_platformCalendarId: {
          connectedAccountId,
          platformCalendarId,
        },
      },
    });

    return syncState?.syncToken || null;
  }

  async saveSyncToken(
    connectedAccountId: string,
    platformCalendarId: string,
    syncToken: string,
  ): Promise<void> {
    await this.prisma.calendarSyncState.upsert({
      where: {
        connectedAccountId_platformCalendarId: {
          connectedAccountId,
          platformCalendarId,
        },
      },
      create: {
        connectedAccountId,
        platformCalendarId,
        syncToken,
        lastSyncedAt: new Date(),
      },
      update: {
        syncToken,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getEventsForCalendar(
    userId: string,
    connectedAccountId: string,
    platformCalendarId: string,
    query: FetchPlatformEventsQueryDto,
  ): Promise<FetchPlatformEventsResponseDto> {
    const account = await this.accountsService.getConnectedAccountById(
      userId,
      connectedAccountId,
    );
    const accessToken =
      await this.accountsService.getDecryptedAccessToken(connectedAccountId);

    const platformService = this.getPlatformService(account.provider);
    return platformService.getEvents(accessToken, query);
  }

  // User Event Management Methods

  async getUserEvents(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      calendarIds?: string[];
    } = {},
  ) {
    const { startDate, endDate, calendarIds } = options;

    const whereClause: Prisma.EventWhereInput = {
      userId,
      calendar: {
        isVisible: true,
      },
    };

    if (startDate || endDate) {
      whereClause.OR = [];
      if (startDate && endDate) {
        // Events that overlap with the date range
        whereClause.OR.push({
          startTime: {
            lte: endDate,
          },
          endTime: {
            gte: startDate,
          },
        });
      } else if (startDate) {
        whereClause.endTime = {
          gte: startDate,
        };
      } else if (endDate) {
        whereClause.startTime = {
          lte: endDate,
        };
      }
    }

    if (calendarIds && calendarIds.length > 0) {
      whereClause.calendarId = {
        in: calendarIds,
      };
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      include: {
        calendar: {
          select: {
            id: true,
            name: true,
            color: true,
            connectedAccount: {
              select: {
                provider: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return events.map((event) => ({
      id: event.id,
      externalId: event.externalId,
      title: event.title,
      description: event.description,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      isAllDay: event.isAllDay || false,
      location: event.location,
      url: event.url,
      status: event.status,
      visibility: event.visibility,
      calendarId: event.calendarId,
      calendar: {
        id: event.calendar.id,
        name: event.calendar.name,
        color: event.calendar.color,
        provider: event.calendar.connectedAccount?.provider,
      },
      lastSyncedAt: event.lastSyncedAt?.toISOString(),
      syncStatus: event.syncStatus,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));
  }

  async createUserEvent(userId: string, eventData: CreateEventRequestDto) {
    // Validate that the calendar belongs to the user
    const calendar = await this.prisma.calendar.findFirst({
      where: {
        id: eventData.calendarId,
        userId,
      },
      include: {
        connectedAccount: true,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found or not accessible');
    }

    // Create event locally first
    const localEvent = await this.prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        startTime: new Date(eventData.startTime),
        endTime: new Date(eventData.endTime),
        isAllDay: eventData.isAllDay || false,
        location: eventData.location,
        url: eventData.url,
        status: eventData.status || 'confirmed',
        visibility: eventData.visibility || 'public',
        calendarId: eventData.calendarId,
        userId,
        syncStatus: 'pending',
      },
      include: {
        calendar: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    // If calendar is connected to external provider, create event there too
    if (calendar.connectedAccount) {
      try {
        const platformEventData: CreatePlatformEventDto = {
          calendarId: eventData.calendarId,
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          isAllDay: eventData.isAllDay,
          location: eventData.location,
          url: eventData.url,
          status: eventData.status,
          visibility: eventData.visibility,
        };

        const platformEvent = await this.createPlatformEvent(
          calendar.connectedAccountId!,
          platformEventData,
        );

        // Update local event with external ID
        await this.prisma.event.update({
          where: { id: localEvent.id },
          data: {
            externalId: platformEvent.id,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to create event on external platform: ${error}`,
        );
        // Update sync status to failed but keep the local event
        await this.prisma.event.update({
          where: { id: localEvent.id },
          data: {
            syncStatus: 'failed',
          },
        });
      }
    }

    return {
      id: localEvent.id,
      externalId: localEvent.externalId,
      title: localEvent.title,
      description: localEvent.description,
      startTime: localEvent.startTime.toISOString(),
      endTime: localEvent.endTime.toISOString(),
      isAllDay: localEvent.isAllDay,
      location: localEvent.location,
      calendarId: localEvent.calendarId,
      calendar: localEvent.calendar,
      syncStatus: localEvent.syncStatus,
    };
  }

  async updateUserEvent(
    userId: string,
    eventId: string,
    eventData: UpdateEventRequestDto,
  ) {
    // Find the event and verify ownership
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
      throw new NotFoundException('Event not found or not accessible');
    }

    // Update local event
    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(eventData.title && { title: eventData.title }),
        ...(eventData.description !== undefined && {
          description: eventData.description,
        }),
        ...(eventData.startTime && {
          startTime: new Date(eventData.startTime),
        }),
        ...(eventData.endTime && { endTime: new Date(eventData.endTime) }),
        ...(eventData.isAllDay !== undefined && {
          isAllDay: eventData.isAllDay,
        }),
        ...(eventData.location !== undefined && {
          location: eventData.location,
        }),
        ...(eventData.url !== undefined && { url: eventData.url }),
        ...(eventData.status && { status: eventData.status }),
        ...(eventData.visibility && { visibility: eventData.visibility }),
        syncStatus: event.externalId ? 'pending' : 'local',
        updatedAt: new Date(),
      },
      include: {
        calendar: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    // If event exists on external platform, update it there too
    if (event.externalId && event.calendar.connectedAccount) {
      try {
        const platformEventData: UpdatePlatformEventDto = {
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          isAllDay: eventData.isAllDay,
          location: eventData.location,
          url: eventData.url,
          status: eventData.status,
          visibility: eventData.visibility,
        };

        await this.updatePlatformEvent(
          event.calendar.connectedAccountId!,
          event.calendarId,
          event.externalId,
          platformEventData,
        );

        // Update sync status
        await this.prisma.event.update({
          where: { id: eventId },
          data: {
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to update event on external platform: ${error}`,
        );
        // Mark as failed sync but keep local changes
        await this.prisma.event.update({
          where: { id: eventId },
          data: {
            syncStatus: 'failed',
          },
        });
      }
    }

    return {
      id: updatedEvent.id,
      externalId: updatedEvent.externalId,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startTime: updatedEvent.startTime.toISOString(),
      endTime: updatedEvent.endTime.toISOString(),
      isAllDay: updatedEvent.isAllDay,
      location: updatedEvent.location,
      calendarId: updatedEvent.calendarId,
      calendar: updatedEvent.calendar,
      syncStatus: updatedEvent.syncStatus,
    };
  }

  async deleteUserEvent(userId: string, eventId: string): Promise<void> {
    // Find the event and verify ownership
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
      throw new NotFoundException('Event not found or not accessible');
    }

    // If event exists on external platform, delete it there first
    if (event.externalId && event.calendar.connectedAccount) {
      try {
        await this.deletePlatformEvent(
          event.calendar.connectedAccountId!,
          event.calendarId,
          event.externalId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete event on external platform: ${error}`,
        );
        // Continue with local deletion even if external deletion fails
      }
    }

    // Delete local event
    await this.prisma.event.delete({
      where: { id: eventId },
    });

    this.logger.log(`Deleted event ${eventId} for user ${userId}`);
  }
}
