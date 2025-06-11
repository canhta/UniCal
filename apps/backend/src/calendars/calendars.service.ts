import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { GoogleCalendarService } from './services/google-calendar.service';
import { MicrosoftCalendarService } from './services/microsoft-calendar.service';
import { CalendarResponseDto } from './dto';
import {
  PlatformCalendarDto,
  PlatformEventDto,
  CreatePlatformEventDto,
  UpdatePlatformEventDto,
  FetchPlatformEventsQueryDto,
  FetchPlatformEventsResponseDto,
  PlatformTokenResponseDto,
  ICalendarPlatformService,
} from './interfaces/calendar-platform.interface';
import { Calendar } from '@prisma/client';

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
}
