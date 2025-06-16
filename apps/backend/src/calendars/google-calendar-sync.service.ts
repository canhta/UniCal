import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarsService } from './calendars.service';
import { AccountsService } from '../accounts/accounts.service';
import { PlatformEventDto, FetchPlatformEventsQueryDto } from '@unical/core';

export interface SyncResult {
  accountId: string;
  calendarId: string;
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);
  private readonly webhookUrl: string;

  constructor(
    private prisma: PrismaService,
    private calendarsService: CalendarsService,
    private accountsService: AccountsService,
    private configService: ConfigService,
  ) {
    const baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    this.webhookUrl = `${baseUrl}/api/calendars/webhooks/google`;
  }

  /**
   * Manual sync for a specific Google Calendar account
   */
  async syncAccountCalendars(
    userId: string,
    accountId: string,
  ): Promise<SyncResult[]> {
    this.logger.log(`Starting manual sync for account ${accountId}`);

    try {
      const account = await this.accountsService.getConnectedAccountById(
        userId,
        accountId,
      );

      if (account.provider !== 'google') {
        throw new Error('Account is not a Google Calendar account');
      }

      // Get all calendars for this account
      const calendars = await this.calendarsService.getCalendarsForAccount(
        userId,
        accountId,
      );

      const results: SyncResult[] = [];
      for (const calendar of calendars) {
        const result = await this.syncCalendar(userId, accountId, calendar.id);
        results.push(result);
      }

      this.logger.log(
        `Completed manual sync for account ${accountId}. Processed ${results.length} calendars`,
      );
      return results;
    } catch (error) {
      this.logger.error(`Failed to sync account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Sync a specific calendar
   */
  async syncCalendar(
    userId: string,
    accountId: string,
    calendarId: string,
  ): Promise<SyncResult> {
    this.logger.log(`Syncing calendar ${calendarId} for account ${accountId}`);

    // Ensure calendar exists in our database first
    const internalCalendarId = await this.ensureCalendarExists(
      userId,
      accountId,
      calendarId,
    );

    const result: SyncResult = {
      accountId,
      calendarId,
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: [],
    };

    try {
      // Get the last sync token for this calendar (simplified - not using DB for now)
      const lastSyncToken = await this.getLastSyncToken(accountId, calendarId);

      // Set up query parameters for incremental sync
      const query: FetchPlatformEventsQueryDto = {
        maxResults: 100,
        syncToken: lastSyncToken || undefined,
        showDeleted: true, // Include deleted events for proper sync
      };

      // If no sync token, do a full sync for the last 30 days and next 30 days
      if (!lastSyncToken) {
        const now = new Date();
        const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        query.timeMin = past.toISOString();
        query.timeMax = future.toISOString();
        delete query.syncToken;
      }

      this.logger.debug(
        `Fetching events for calendar ${calendarId} with query:`,
        {
          timeMin: query.timeMin,
          timeMax: query.timeMax,
          syncToken: query.syncToken,
        },
      );

      // Fetch events from Google Calendar
      const response = await this.calendarsService.getEventsForCalendar(
        userId,
        accountId,
        calendarId,
        query,
      );

      result.eventsProcessed = response.events.length;

      // Process each event
      for (const event of response.events) {
        try {
          await this.processEvent(userId, internalCalendarId, event);

          if (event.status === 'cancelled') {
            result.eventsDeleted++;
          } else {
            // For now, treat everything as created (in real implementation, check if exists)
            result.eventsCreated++;
          }
        } catch (error) {
          const errorMsg = `Failed to process event ${event.id}: ${(error as Error).message}`;
          result.errors.push(errorMsg);
          this.logger.warn(errorMsg);
        }
      }

      // Save the next sync token for incremental sync (simplified - not using DB for now)
      if (response.nextSyncToken) {
        await this.saveSyncToken(accountId, calendarId, response.nextSyncToken);
      }

      this.logger.log(
        `Synced calendar ${calendarId}: ${result.eventsProcessed} events processed`,
      );
      return result;
    } catch (error) {
      const errorMsg = `Failed to sync calendar ${calendarId}: ${(error as Error).message}`;
      result.errors.push(errorMsg);
      this.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Process a single event from Google Calendar
   */
  private async processEvent(
    userId: string,
    internalCalendarId: string,
    event: PlatformEventDto,
  ): Promise<void> {
    // Check if event already exists in our database
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        externalId: event.id,
        calendarId: internalCalendarId,
        userId,
      },
    });

    if (event.status === 'cancelled') {
      // Delete the event if it exists
      if (existingEvent) {
        await this.prisma.event.delete({
          where: { id: existingEvent.id },
        });
        this.logger.debug(`Deleted event ${event.id}`);
      }
      return;
    }

    const eventData = {
      externalId: event.id,
      title: event.title,
      description: event.description,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      isAllDay: event.isAllDay || false,
      location: event.location,
      url: event.htmlLink,
      status: event.status,
      visibility: event.privacy,
      recurrenceRule: event.recurrence?.join(','),
      recurrenceId: event.recurringEventId,
      lastSyncedAt: new Date(),
      syncStatus: 'synced',
      calendarId: internalCalendarId,
      userId,
    };

    if (existingEvent) {
      // Update existing event
      await this.prisma.event.update({
        where: { id: existingEvent.id },
        data: eventData,
      });
      this.logger.debug(`Updated event ${event.id}`);
    } else {
      // Create new event
      await this.prisma.event.create({
        data: eventData,
      });
      this.logger.debug(`Created event ${event.id}`);
    }
  }

  /**
   * Set up webhooks for Google Calendar account (simplified)
   */
  setupWebhookForAccount(userId: string, accountId: string): void {
    this.logger.log(`Setting up webhooks for account ${accountId}`);
    // For now, just log that we would set up webhooks
    // TODO: Implement webhook setup once database models are working
    this.logger.warn(
      'Webhook setup not implemented yet - waiting for database models to be available',
    );
  }

  /**
   * Handle incoming webhook notifications (simplified)
   */
  handleWebhookNotification(channelId: string, _resourceId?: string): void {
    this.logger.log(`Received webhook notification for channel ${channelId}`);
    // For now, just log that we received a notification
    // TODO: Implement notification handling once database models are working
    this.logger.warn(
      'Webhook handling not implemented yet - waiting for database models to be available',
    );
  }

  /**
   * Scheduled sync that runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledSync(): Promise<void> {
    this.logger.log('Starting scheduled sync for all Google Calendar accounts');

    try {
      // Get all Google Calendar accounts
      const googleAccounts = await this.prisma.connectedAccount.findMany({
        where: {
          provider: 'google',
        },
      });

      for (const account of googleAccounts) {
        try {
          await this.syncAccountCalendars(account.userId, account.id);
        } catch (error) {
          this.logger.error(
            `Failed to sync account ${account.id} during scheduled sync:`,
            error,
          );
        }
      }

      this.logger.log(
        `Completed scheduled sync for ${googleAccounts.length} accounts`,
      );
    } catch (error) {
      this.logger.error('Failed to run scheduled sync:', error);
    }
  }

  /**
   * Renew expiring webhooks (simplified)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  renewExpiringWebhooks(): void {
    this.logger.log('Checking for expiring webhooks to renew');
    // For now, just log that we would renew webhooks
    // TODO: Implement webhook renewal once database models are working
    this.logger.warn(
      'Webhook renewal not implemented yet - waiting for database models to be available',
    );
  }

  /**
   * Get the last sync token for a calendar
   */
  private async getLastSyncToken(
    accountId: string,
    calendarId: string,
  ): Promise<string | null> {
    try {
      const syncState = await this.prisma.calendarSyncState.findUnique({
        where: {
          connectedAccountId_platformCalendarId: {
            connectedAccountId: accountId,
            platformCalendarId: calendarId,
          },
        },
      });

      this.logger.debug(
        `Retrieved sync token for account ${accountId}, calendar ${calendarId}: ${syncState?.syncToken ? 'found' : 'not found'}`,
      );

      return syncState?.syncToken || null;
    } catch (error) {
      this.logger.error(
        `Failed to get sync token for account ${accountId}, calendar ${calendarId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Save sync token for a calendar
   */
  private async saveSyncToken(
    accountId: string,
    calendarId: string,
    syncToken: string,
  ): Promise<void> {
    try {
      await this.prisma.calendarSyncState.upsert({
        where: {
          connectedAccountId_platformCalendarId: {
            connectedAccountId: accountId,
            platformCalendarId: calendarId,
          },
        },
        update: {
          syncToken,
          lastSyncedAt: new Date(),
        },
        create: {
          connectedAccountId: accountId,
          platformCalendarId: calendarId,
          syncToken,
          lastSyncedAt: new Date(),
        },
      });

      this.logger.debug(
        `Saved sync token for account ${accountId}, calendar ${calendarId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save sync token for account ${accountId}, calendar ${calendarId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Ensure calendar exists in database, create if not found
   */
  private async ensureCalendarExists(
    userId: string,
    accountId: string,
    googleCalendarId: string,
    calendarData?: {
      name?: string;
      summary?: string;
      description?: string;
      timeZone?: string;
    },
  ): Promise<string> {
    // Check if calendar already exists
    const existingCalendar = await this.prisma.calendar.findFirst({
      where: {
        externalId: googleCalendarId,
        connectedAccountId: accountId,
      },
    });

    if (existingCalendar) {
      return existingCalendar.id;
    }

    // Get calendar details from Google Calendar API if not provided
    let name = googleCalendarId;
    let description: string | undefined;
    let timeZone: string | undefined;

    if (calendarData) {
      name = calendarData.name || calendarData.summary || googleCalendarId;
      description = calendarData.description;
      timeZone = calendarData.timeZone;
    } else {
      // Fetch calendar details from Google Calendar API
      try {
        const calendars = await this.calendarsService.getCalendarsForAccount(
          userId,
          accountId,
        );
        const foundCalendar = calendars.find(
          (cal) => cal.id === googleCalendarId,
        );
        if (foundCalendar) {
          name = foundCalendar.name;
          description = foundCalendar.description;
          timeZone = foundCalendar.timeZone;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch calendar details for ${googleCalendarId}:`,
          error,
        );
      }
    }

    // Create new calendar record
    const newCalendar = await this.prisma.calendar.create({
      data: {
        externalId: googleCalendarId,
        name,
        description,
        timeZone,
        isDefault:
          googleCalendarId === 'primary' ||
          googleCalendarId.includes('@gmail.com'),
        isVisible: true,
        connectedAccountId: accountId,
        userId,
      },
    });

    this.logger.log(
      `Created calendar record for ${googleCalendarId} with ID ${newCalendar.id}`,
    );
    return newCalendar.id;
  }
}
