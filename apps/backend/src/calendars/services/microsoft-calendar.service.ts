/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import {
  ICalendarPlatformService,
  PlatformTokenResponseDto,
  PlatformCalendarDto,
  PlatformEventDto,
  CreatePlatformEventDto,
  UpdatePlatformEventDto,
  FetchPlatformEventsQueryDto,
  FetchPlatformEventsResponseDto,
  PlatformWebhookSubscriptionDto,
} from '@unical/core';

// Microsoft Graph API response interfaces
interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface MicrosoftCalendar {
  id: string;
  name: string;
  owner?: {
    name?: string;
    address?: string;
  };
  isDefaultCalendar?: boolean;
  canEdit?: boolean;
  color?: string;
}

interface MicrosoftCalendarResponse {
  value: MicrosoftCalendar[];
  '@odata.nextLink'?: string;
}

interface MicrosoftEvent {
  id: string;
  subject: string;
  body: {
    content?: string;
    contentType?: string;
  };
  location?: {
    displayName?: string;
  };
  showAs?: string;
  sensitivity?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay?: boolean;
  attendees?: Array<{
    emailAddress: {
      address?: string;
      name?: string;
    };
    status?: {
      response?: string;
    };
  }>;
  recurrence?: any;
  createdDateTime: string;
  lastModifiedDateTime: string;
  webLink: string;
}

interface MicrosoftEventResponse {
  value: MicrosoftEvent[];
  '@odata.nextLink'?: string;
}

interface MicrosoftUserProfile {
  oid?: string;
  sub?: string;
}

// Custom authentication provider for Microsoft Graph
class TokenAuthProvider implements AuthenticationProvider {
  constructor(private accessToken: string) {}

  async getAccessToken(): Promise<string> {
    return Promise.resolve(this.accessToken);
  }
}

@Injectable()
export class MicrosoftCalendarService implements ICalendarPlatformService {
  private readonly logger = new Logger(MicrosoftCalendarService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tenantId: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>(
      'MICROSOFT_CLIENT_SECRET',
    )!;
    this.tenantId =
      this.configService.get<string>('MICROSOFT_TENANT_ID') || 'common';
  }

  getAuthorizationUrl(redirectUri: string): string {
    const scopes = [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/User.Read',
      'offline_access',
    ].join(' ');

    const authUrl = new URL(
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`,
    );
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_mode', 'query');

    return authUrl.toString();
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<PlatformTokenResponseDto> {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const data = (await response.json()) as MicrosoftTokenResponse;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresInSeconds: data.expires_in,
        scope: data.scope,
        idToken: data.id_token,
        platformUserId: data.id_token
          ? this.extractUserIdFromIdToken(data.id_token)
          : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new HttpException(
        'Failed to exchange authorization code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCalendars(accessToken: string): Promise<PlatformCalendarDto[]> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      const calendars = (await graphClient
        .api('/me/calendars')
        .select(
          'id,name,color,canEdit,canShare,canViewPrivateItems,isDefaultCalendar,owner',
        )
        .get()) as MicrosoftCalendarResponse;

      return calendars.value.map(
        (cal): PlatformCalendarDto => ({
          id: cal.id,
          name: cal.name,
          description: cal.owner?.name || undefined,
          primary: cal.isDefaultCalendar || false,
          accessRole: cal.canEdit ? 'owner' : 'reader',
          backgroundColor: this.convertMicrosoftColor(cal.color || ''),
          foregroundColor: '#ffffff',
          timeZone: undefined, // Microsoft doesn't provide timezone per calendar
        }),
      );
    } catch (error) {
      this.logger.error('Failed to get Microsoft calendars', error);
      throw new HttpException(
        'Failed to retrieve calendars from Microsoft',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEvents(
    accessToken: string,
    query: FetchPlatformEventsQueryDto,
  ): Promise<FetchPlatformEventsResponseDto> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      let apiRequest = graphClient
        .api('/me/events')
        .select(
          'id,subject,body,start,end,isAllDay,location,webLink,showAs,sensitivity,attendees,recurrence,createdDateTime,lastModifiedDateTime',
        )
        .orderby('start/dateTime');

      if (query.timeMin) {
        apiRequest = apiRequest.filter(`start/dateTime ge '${query.timeMin}'`);
      }
      if (query.timeMax) {
        apiRequest = apiRequest.filter(`end/dateTime le '${query.timeMax}'`);
      }
      if (query.maxResults) {
        apiRequest = apiRequest.top(query.maxResults);
      }

      const response = (await apiRequest.get()) as MicrosoftEventResponse;

      const events = response.value.map((event) =>
        this.mapMicrosoftEventToPlatform(event),
      );

      return {
        events,
        nextPageToken: response['@odata.nextLink'] ? 'nextPage' : undefined,
        nextSyncToken: undefined, // Microsoft Graph uses different sync mechanism
      };
    } catch (error) {
      this.logger.error('Failed to get Microsoft events', error);
      throw new HttpException(
        'Failed to retrieve events from Microsoft',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<PlatformEventDto> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      const event = await graphClient
        .api(`/me/calendars/${calendarId}/events/${eventId}`)
        .select(
          'id,subject,body,start,end,isAllDay,location,webLink,showAs,sensitivity,attendees,recurrence,createdDateTime,lastModifiedDateTime',
        )
        .get();

      return this.mapMicrosoftEventToPlatform(event);
    } catch (error) {
      this.logger.error(`Failed to get Microsoft event ${eventId}`, error);
      throw new HttpException(
        'Failed to retrieve event from Microsoft',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createEvent(
    accessToken: string,
    eventData: CreatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      const microsoftEvent = {
        subject: eventData.title,
        body: {
          contentType: 'text',
          content: eventData.description || '',
        },
        start: eventData.isAllDay
          ? {
              dateTime: eventData.startTime.split('T')[0],
              timeZone: eventData.timeZone || 'UTC',
            }
          : {
              dateTime: eventData.startTime,
              timeZone: eventData.timeZone || 'UTC',
            },
        end: eventData.isAllDay
          ? {
              dateTime: eventData.endTime.split('T')[0],
              timeZone: eventData.timeZone || 'UTC',
            }
          : {
              dateTime: eventData.endTime,
              timeZone: eventData.timeZone || 'UTC',
            },
        isAllDay: eventData.isAllDay,
        location: eventData.location
          ? {
              displayName: eventData.location,
            }
          : undefined,
        attendees: eventData.attendees?.map((attendee) => ({
          emailAddress: {
            address: attendee.email,
            name: attendee.displayName,
          },
        })),
        showAs: this.mapStatusToMicrosoft(eventData.status),
        sensitivity: this.mapVisibilityToMicrosoft(eventData.visibility),
      };

      const response = await graphClient
        .api(`/me/calendars/${eventData.calendarId}/events`)
        .post(microsoftEvent);

      return this.mapMicrosoftEventToPlatform(response);
    } catch (error) {
      this.logger.error('Failed to create Microsoft event', error);
      throw new HttpException(
        'Failed to create event in Microsoft Calendar',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    eventData: UpdatePlatformEventDto,
  ): Promise<PlatformEventDto> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      const updateData: any = {};

      if (eventData.title !== undefined) updateData.subject = eventData.title;
      if (eventData.description !== undefined) {
        updateData.body = {
          contentType: 'text',
          content: eventData.description,
        };
      }
      if (eventData.location !== undefined) {
        updateData.location = eventData.location
          ? {
              displayName: eventData.location,
            }
          : null;
      }
      if (eventData.status !== undefined) {
        updateData.showAs = this.mapStatusToMicrosoft(eventData.status);
      }
      if (eventData.visibility !== undefined) {
        updateData.sensitivity = this.mapVisibilityToMicrosoft(
          eventData.visibility,
        );
      }

      if (
        eventData.startTime ||
        eventData.endTime ||
        eventData.isAllDay !== undefined
      ) {
        if (eventData.isAllDay) {
          if (eventData.startTime) {
            updateData.start = {
              dateTime: eventData.startTime.split('T')[0],
              timeZone: 'UTC',
            };
          }
          if (eventData.endTime) {
            updateData.end = {
              dateTime: eventData.endTime.split('T')[0],
              timeZone: 'UTC',
            };
          }
        } else {
          if (eventData.startTime) {
            updateData.start = {
              dateTime: eventData.startTime,
              timeZone: 'UTC',
            };
          }
          if (eventData.endTime) {
            updateData.end = {
              dateTime: eventData.endTime,
              timeZone: 'UTC',
            };
          }
        }
        updateData.isAllDay = eventData.isAllDay;
      }

      const response = await graphClient
        .api(`/me/calendars/${calendarId}/events/${eventId}`)
        .patch(updateData);

      return this.mapMicrosoftEventToPlatform(response);
    } catch (error) {
      this.logger.error(`Failed to update Microsoft event ${eventId}`, error);
      throw new HttpException(
        'Failed to update event in Microsoft Calendar',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      await graphClient
        .api(`/me/calendars/${calendarId}/events/${eventId}`)
        .delete();
    } catch (error) {
      this.logger.error(`Failed to delete Microsoft event ${eventId}`, error);
      throw new HttpException(
        'Failed to delete event from Microsoft Calendar',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createWebhookSubscription(
    accessToken: string,
    calendarId: string,
    webhookUrl: string,
  ): Promise<PlatformWebhookSubscriptionDto> {
    try {
      const graphClient = this.getGraphClient(accessToken);

      const subscription = {
        changeType: 'created,updated,deleted',
        notificationUrl: webhookUrl,
        resource: `/me/calendars/${calendarId}/events`,
        expirationDateTime: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 3 days
        clientState: 'unical-webhook',
      };

      const response = await graphClient
        .api('/subscriptions')
        .post(subscription);

      return {
        id: response.id,
        expirationTimestamp: new Date(response.expirationDateTime).getTime(),
        resourceUri: response.resource,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create Microsoft webhook subscription',
        error,
      );
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
      const graphClient = this.getGraphClient(accessToken);

      await graphClient.api(`/subscriptions/${subscriptionId}`).delete();
    } catch (error) {
      this.logger.error(
        `Failed to delete Microsoft webhook subscription ${subscriptionId}`,
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
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token refresh failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch (error) {
      this.logger.error('Failed to refresh Microsoft access token', error);
      throw new HttpException(
        'Failed to refresh access token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private getGraphClient(accessToken: string): Client {
    const authProvider = new TokenAuthProvider(accessToken);
    return Client.initWithMiddleware({ authProvider });
  }

  private mapMicrosoftEventToPlatform = (
    microsoftEvent: MicrosoftEvent,
  ): PlatformEventDto => {
    const isAllDay = microsoftEvent.isAllDay;

    return {
      id: microsoftEvent.id,
      calendarId: 'primary', // Microsoft doesn't provide calendar ID in event response
      title: microsoftEvent.subject || 'Untitled Event',
      description: microsoftEvent.body?.content || undefined,
      startTime: isAllDay
        ? microsoftEvent.start.dateTime + 'T00:00:00.000Z'
        : microsoftEvent.start.dateTime,
      endTime: isAllDay
        ? microsoftEvent.end.dateTime + 'T23:59:59.999Z'
        : microsoftEvent.end.dateTime,
      isAllDay: isAllDay || false,
      timeZone: microsoftEvent.start?.timeZone || undefined,
      location: microsoftEvent.location?.displayName || undefined,
      privacy: this.mapMicrosoftSensitivityToPrivacy(
        microsoftEvent.sensitivity || 'normal',
      ),
      status: this.mapMicrosoftShowAsToStatus(microsoftEvent.showAs || 'busy'),
      attendees: microsoftEvent.attendees?.map((attendee) => ({
        email: attendee.emailAddress?.address || '',
        displayName: attendee.emailAddress?.name || undefined,
        responseStatus: this.mapMicrosoftResponseStatus(
          attendee.status?.response || 'needsAction',
        ),
      })),
      recurrence: microsoftEvent.recurrence
        ? this.mapMicrosoftRecurrence(microsoftEvent.recurrence)
        : undefined,
      recurringEventId: undefined, // Microsoft handles this differently
      originalStartTime: undefined,
      reminders: undefined, // Microsoft doesn't provide reminders in this format
      created: microsoftEvent.createdDateTime || undefined,
      updated: microsoftEvent.lastModifiedDateTime || undefined,
      htmlLink: microsoftEvent.webLink || undefined,
    };
  };

  private extractUserIdFromIdToken(idToken: string): string | undefined {
    try {
      const payload = JSON.parse(
        atob(idToken.split('.')[1]),
      ) as MicrosoftUserProfile;
      return payload.oid || payload.sub;
    } catch {
      return undefined;
    }
  }

  private convertMicrosoftColor(microsoftColor: string): string {
    const colorMap: Record<string, string> = {
      auto: '#0078d4',
      lightBlue: '#0078d4',
      lightGreen: '#107c10',
      lightOrange: '#ff8c00',
      lightGray: '#737373',
      lightYellow: '#fff100',
      lightTeal: '#008080',
      lightPink: '#e3008c',
      lightBrown: '#8e562e',
      lightRed: '#d13438',
      maxColor: '#b146c2',
    };
    return colorMap[microsoftColor] || '#0078d4';
  }

  private mapStatusToMicrosoft(status?: string): string {
    const statusMap: Record<string, string> = {
      confirmed: 'busy',
      tentative: 'tentative',
      cancelled: 'free',
    };
    return statusMap[status || 'confirmed'] || 'busy';
  }

  private mapVisibilityToMicrosoft(visibility?: string): string {
    const visibilityMap: Record<string, string> = {
      public: 'normal',
      private: 'private',
      confidential: 'confidential',
    };
    return visibilityMap[visibility || 'public'] || 'normal';
  }

  private mapMicrosoftSensitivityToPrivacy(
    sensitivity: string,
  ): 'public' | 'private' | 'confidential' {
    const sensitivityMap: Record<
      string,
      'public' | 'private' | 'confidential'
    > = {
      normal: 'public',
      personal: 'private',
      private: 'private',
      confidential: 'confidential',
    };
    return sensitivityMap[sensitivity] || 'public';
  }

  private mapMicrosoftShowAsToStatus(
    showAs: string,
  ): 'confirmed' | 'tentative' | 'cancelled' {
    const showAsMap: Record<string, 'confirmed' | 'tentative' | 'cancelled'> = {
      free: 'cancelled',
      tentative: 'tentative',
      busy: 'confirmed',
      oof: 'confirmed',
      workingElsewhere: 'confirmed',
    };
    return showAsMap[showAs] || 'confirmed';
  }

  private mapMicrosoftResponseStatus(
    response: string,
  ): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    const responseMap: Record<
      string,
      'accepted' | 'declined' | 'tentative' | 'needsAction'
    > = {
      none: 'needsAction',
      organizer: 'accepted',
      tentativelyAccepted: 'tentative',
      accepted: 'accepted',
      declined: 'declined',
      notResponded: 'needsAction',
    };
    return responseMap[response] || 'needsAction';
  }

  private mapMicrosoftRecurrence(recurrence: any): string[] {
    // This is a simplified mapping - Microsoft recurrence is complex
    // In a production system, you'd want to properly convert Microsoft's recurrence format
    if (recurrence.pattern?.type === 'daily') {
      return [`FREQ=DAILY;INTERVAL=${recurrence.pattern.interval || 1}`];
    }
    if (recurrence.pattern?.type === 'weekly') {
      return [`FREQ=WEEKLY;INTERVAL=${recurrence.pattern.interval || 1}`];
    }
    if (recurrence.pattern?.type === 'monthly') {
      return [`FREQ=MONTHLY;INTERVAL=${recurrence.pattern.interval || 1}`];
    }
    return [];
  }
}
