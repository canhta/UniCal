/**
 * Common external/platform event related types
 */

export interface ExternalEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
}

export interface ExternalEventReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface ExternalEventRecurrence {
  rule?: string; // RRULE format
  exceptions?: string[]; // Exception dates
}

export interface ExternalEventConferenceData {
  type: 'hangoutsMeet' | 'addOn' | 'custom';
  uri?: string;
  conferenceId?: string;
  signature?: string;
  notes?: string;
}

/**
 * Common external event interface for platform-agnostic operations
 */
export interface ExternalEvent {
  // Core fields
  id: string;
  calendarId: string;

  // Event details
  title: string;
  description?: string;
  location?: string;

  // Timing
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isAllDay?: boolean;
  timeZone?: string;

  // Status and visibility
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private' | 'confidential';

  // Relationships
  attendees?: ExternalEventAttendee[];
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };

  // Features
  reminders?: ExternalEventReminder[];
  recurrence?: ExternalEventRecurrence;
  conferenceData?: ExternalEventConferenceData;

  // URLs and links
  htmlLink?: string;
  meetingUrl?: string;

  // Metadata
  created?: string;
  updated?: string;
  etag?: string;
  sequence?: number;

  // Source information
  source?: {
    title?: string;
    url?: string;
  };

  // Additional platform-specific data
  metadata?: Record<string, any>;
}

/**
 * Query parameters for fetching external events
 */
export interface ExternalEventQuery {
  timeMin?: string;
  timeMax?: string;
  syncToken?: string;
  pageToken?: string;
  maxResults?: number;
  showDeleted?: boolean;
}

/**
 * Response for external event queries
 */
export interface ExternalEventQueryResponse {
  events: ExternalEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}
