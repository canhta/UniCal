import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import {
  RetryUtil,
  ICalendarPlatformService,
  PlatformCalendarDto,
  PlatformEventDto,
  CreatePlatformEventDto,
  UpdatePlatformEventDto,
  FetchPlatformEventsQueryDto,
  FetchPlatformEventsResponseDto,
  PlatformWebhookSubscriptionDto,
  PlatformTokenResponseDto,
} from '@unical/core';

@Injectable()
export class GoogleCalendarService implements ICalendarPlatformService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET')!;
  }

  getAuthorizationUrl(redirectUri: string): string {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      redirectUri,
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<PlatformTokenResponseDto> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        redirectUri,
      );

      const { tokens } = await oauth2Client.getToken(code);

      // Get user info to extract email and user ID
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiresInSeconds: tokens.expiry_date
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
          : undefined,
        scope: tokens.scope || undefined,
        idToken: tokens.id_token || undefined,
        platformUserId: userInfo.data.id || undefined,
        email: userInfo.data.email || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new HttpException(
        'Failed to exchange authorization code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getOAuth2Client(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
  }

  async getCalendars(accessToken: string): Promise<PlatformCalendarDto[]> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.calendarList.list();
        const calendars = response.data.items || [];

        return calendars.map(
          (cal): PlatformCalendarDto => ({
            id: cal.id!,
            name: cal.summary!,
            description: cal.description || undefined,
            primary: cal.primary || undefined,
            accessRole: cal.accessRole || undefined,
            backgroundColor: cal.backgroundColor || undefined,
            foregroundColor: cal.foregroundColor || undefined,
            timeZone: cal.timeZone || undefined,
          }),
        );
      } catch (error: unknown) {
        this.handleApiError(error, 'Failed to get Google calendars');
      }
    });
  }

  async getEvents(
    accessToken: string,
    query: FetchPlatformEventsQueryDto,
  ): Promise<FetchPlatformEventsResponseDto> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Get events from primary calendar or all calendars
        const calendarId = 'primary'; // TODO: Support multiple calendars

        const response = await calendar.events.list({
          calendarId,
          timeMin: query.timeMin,
          timeMax: query.timeMax,
          maxResults: query.maxResults || 250,
          singleEvents: true,
          orderBy: 'startTime',
          syncToken: query.syncToken,
          pageToken: query.pageToken,
          showDeleted: query.showDeleted,
        });

        const events = (response.data.items || []).map(
          this.mapGoogleEventToPlatform,
        );

        return {
          events,
          nextPageToken: response.data.nextPageToken || undefined,
          nextSyncToken: response.data.nextSyncToken || undefined,
        };
      } catch (error: unknown) {
        this.handleApiError(error, 'Failed to get Google events');
      }
    });
  }

  async getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<PlatformEventDto> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.get({
          calendarId,
          eventId,
        });

        return this.mapGoogleEventToPlatform(response.data);
      } catch (error: unknown) {
        this.handleApiError(error, `Failed to get Google event ${eventId}`);
      }
    });
  }

  async createEvent(
    accessToken: string,
    eventData: CreatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const googleEvent: calendar_v3.Schema$Event = {
          summary: eventData.title,
          description: eventData.description,
          location: eventData.location,
          status: eventData.status as 'confirmed' | 'tentative' | 'cancelled',
          visibility: eventData.visibility === 'private' ? 'private' : 'public',
          start: eventData.isAllDay
            ? { date: eventData.startTime.split('T')[0] }
            : {
                dateTime: eventData.startTime,
                timeZone: eventData.timeZone,
              },
          end: eventData.isAllDay
            ? { date: eventData.endTime.split('T')[0] }
            : {
                dateTime: eventData.endTime,
                timeZone: eventData.timeZone,
              },
          attendees: eventData.attendees?.map((attendee) => ({
            email: attendee.email,
            displayName: attendee.displayName,
          })),
          reminders: eventData.reminders
            ? {
                useDefault: false,
                overrides: eventData.reminders.map((reminder) => ({
                  method: reminder.method,
                  minutes: reminder.minutes,
                })),
              }
            : undefined,
        };

        const response = await calendar.events.insert({
          calendarId: eventData.calendarId,
          requestBody: googleEvent,
        });

        return this.mapGoogleEventToPlatform(response.data);
      } catch (error: unknown) {
        this.handleApiError(error, 'Failed to create Google event');
      }
    });
  }

  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    eventData: UpdatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const updateData: Partial<calendar_v3.Schema$Event> = {};

        if (eventData.title !== undefined) updateData.summary = eventData.title;
        if (eventData.description !== undefined)
          updateData.description = eventData.description;
        if (eventData.location !== undefined)
          updateData.location = eventData.location;
        if (eventData.status !== undefined)
          updateData.status = eventData.status as
            | 'confirmed'
            | 'tentative'
            | 'cancelled';
        if (eventData.visibility !== undefined)
          updateData.visibility =
            eventData.visibility === 'private' ? 'private' : 'public';

        if (
          eventData.startTime ||
          eventData.endTime ||
          eventData.isAllDay !== undefined
        ) {
          if (eventData.isAllDay) {
            if (eventData.startTime) {
              updateData.start = { date: eventData.startTime.split('T')[0] };
            }
            if (eventData.endTime) {
              updateData.end = { date: eventData.endTime.split('T')[0] };
            }
          } else {
            if (eventData.startTime) {
              updateData.start = { dateTime: eventData.startTime };
            }
            if (eventData.endTime) {
              updateData.end = { dateTime: eventData.endTime };
            }
          }
        }

        const response = await calendar.events.patch({
          calendarId,
          eventId,
          requestBody: updateData,
        });

        return this.mapGoogleEventToPlatform(response.data);
      } catch (error: unknown) {
        this.handleApiError(error, `Failed to update Google event ${eventId}`);
      }
    });
  }

  async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    return RetryUtil.withRetry(async () => {
      try {
        const oauth2Client = this.getOAuth2Client(accessToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
          calendarId,
          eventId,
        });
      } catch (error: unknown) {
        this.handleApiError(error, `Failed to delete Google event ${eventId}`);
      }
    });
  }

  async createWebhookSubscription(
    accessToken: string,
    calendarId: string,
    webhookUrl: string,
  ): Promise<PlatformWebhookSubscriptionDto> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.watch({
        calendarId,
        requestBody: {
          id: `unical-${Date.now()}`,
          type: 'web_hook',
          address: webhookUrl,
        },
      });

      return {
        id: response.data.id!,
        expirationTimestamp: response.data.expiration
          ? parseInt(response.data.expiration)
          : undefined,
        resourceUri: response.data.resourceUri || undefined,
        token: response.data.token || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to create Google webhook subscription', error);
      throw new HttpException(
        'Failed to create webhook subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteWebhookSubscription(
    accessToken: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.channels.stop({
        requestBody: {
          id: subscriptionId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete Google webhook subscription ${subscriptionId}`,
        error,
      );
      throw new HttpException(
        'Failed to delete webhook subscription',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
  }> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || undefined,
        expiresAt: new Date(credentials.expiry_date!),
      };
    } catch (error) {
      this.logger.error('Failed to refresh Google access token', error);
      throw new HttpException(
        'Failed to refresh access token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private mapGoogleEventToPlatform = (
    googleEvent: calendar_v3.Schema$Event,
  ): PlatformEventDto => {
    const isAllDay = !!googleEvent.start?.date;

    return {
      id: googleEvent.id!,
      calendarId: 'primary', // TODO: Get actual calendar ID
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || undefined,
      startTime: isAllDay
        ? googleEvent.start!.date! + 'T00:00:00.000Z'
        : googleEvent.start!.dateTime!,
      endTime: isAllDay
        ? googleEvent.end!.date! + 'T23:59:59.999Z'
        : googleEvent.end!.dateTime!,
      isAllDay,
      timeZone: googleEvent.start?.timeZone || undefined,
      location: googleEvent.location || undefined,
      privacy: googleEvent.visibility === 'private' ? 'private' : 'public',
      status: googleEvent.status as 'confirmed' | 'tentative' | 'cancelled',
      attendees: googleEvent.attendees?.map((attendee) => ({
        email: attendee.email!,
        displayName: attendee.displayName || undefined,
        responseStatus: attendee.responseStatus as
          | 'accepted'
          | 'declined'
          | 'tentative'
          | 'needsAction',
      })),
      recurrence: googleEvent.recurrence || undefined,
      recurringEventId: googleEvent.recurringEventId || undefined,
      originalStartTime: googleEvent.originalStartTime?.dateTime || undefined,
      reminders: googleEvent.reminders?.overrides?.map((override) => ({
        method: override.method as 'email' | 'popup',
        minutes: override.minutes!,
      })),
      created: googleEvent.created || undefined,
      updated: googleEvent.updated || undefined,
      htmlLink: googleEvent.htmlLink || undefined,
    };
  };

  private handleApiError(error: unknown, context: string): never {
    this.logger.error(context, error);

    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as { code: number; message?: string };

      switch (apiError.code) {
        case 401:
          throw new HttpException(
            'Google Calendar access token is invalid or expired',
            HttpStatus.UNAUTHORIZED,
          );
        case 403:
          throw new HttpException(
            'Insufficient permissions for Google Calendar access',
            HttpStatus.FORBIDDEN,
          );
        case 404:
          throw new HttpException(
            'Google Calendar resource not found',
            HttpStatus.NOT_FOUND,
          );
        case 429:
          throw new HttpException(
            'Google Calendar API rate limit exceeded',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        default:
          if (apiError.code >= 500) {
            throw new HttpException(
              'Google Calendar service temporarily unavailable',
              HttpStatus.BAD_GATEWAY,
            );
          }
      }
    }

    throw new HttpException(
      `Google Calendar API error: ${context}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
