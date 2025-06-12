/**
 * Platform-agnostic calendar service interfaces
 */

export interface PlatformTokenResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  scope?: string;
  idToken?: string;
  platformUserId?: string;
  email?: string;
}

export interface PlatformCalendarDto {
  id: string;
  name: string;
  description?: string;
  primary?: boolean;
  accessRole?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  timeZone?: string;
}

export interface PlatformEventDto {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAllDay: boolean;
  timeZone?: string;
  location?: string;
  privacy?: 'public' | 'private' | 'confidential';
  status?: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  recurrence?: string[]; // RRULE format
  recurringEventId?: string;
  originalStartTime?: string;
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
  created?: string;
  updated?: string;
  htmlLink?: string;
}

export interface CreatePlatformEventDto {
  calendarId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  timeZone?: string;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
}

export interface UpdatePlatformEventDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface FetchPlatformEventsQueryDto {
  timeMin?: string; // ISO DateTime
  timeMax?: string; // ISO DateTime
  syncToken?: string;
  pageToken?: string;
  maxResults?: number;
  showDeleted?: boolean;
}

export interface FetchPlatformEventsResponseDto {
  events: PlatformEventDto[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface PlatformWebhookSubscriptionDto {
  id: string;
  expirationTimestamp?: number; // Unix ms
  resourceUri?: string;
  token?: string;
}

/**
 * Platform service interface
 */
export interface ICalendarPlatformService {
  // Calendar management
  getCalendars(accessToken: string): Promise<PlatformCalendarDto[]>;

  // OAuth helpers
  getAuthorizationUrl(redirectUri: string): string;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<PlatformTokenResponseDto>;

  // Event management
  getEvents(
    accessToken: string,
    query: FetchPlatformEventsQueryDto,
  ): Promise<FetchPlatformEventsResponseDto>;

  getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<PlatformEventDto>;

  createEvent(
    accessToken: string,
    eventData: CreatePlatformEventDto,
  ): Promise<PlatformEventDto>;

  updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    eventData: UpdatePlatformEventDto,
  ): Promise<PlatformEventDto>;

  deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<void>;

  // Webhook/subscription management
  createWebhookSubscription(
    accessToken: string,
    calendarId: string,
    webhookUrl: string,
  ): Promise<PlatformWebhookSubscriptionDto>;

  deleteWebhookSubscription(
    accessToken: string,
    subscriptionId: string,
  ): Promise<void>;

  // OAuth helper
  refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
  }>;
}
