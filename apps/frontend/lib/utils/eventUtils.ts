import { EventResponseDto } from '@unical/core';
import { Calendar as EventCalendar } from '@event-calendar/core';

// Colors for different calendars
const CALENDAR_COLORS = [
  '#1a73e8', // Google Blue
  '#0b8043', // Google Green
  '#d93025', // Google Red
  '#f9ab00', // Google Yellow
  '#9c27b0', // Purple
  '#ff5722', // Deep Orange
  '#795548', // Brown
  '#607d8b', // Blue Grey
];

/**
 * Convert backend EventResponseDto to EventCalendar.EventInput format
 */
export function convertEventToCalendarEvent(
  event: EventResponseDto,
  calendarColorIndex: number = 0
): EventCalendar.EventInput {
  const color = CALENDAR_COLORS[calendarColorIndex % CALENDAR_COLORS.length];
  
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    allDay: event.isAllDay || false,
    backgroundColor: color,
    textColor: '#ffffff',
    extendedProps: {
      description: event.description,
      location: event.location,
      url: event.url,
      status: event.status,
      visibility: event.visibility,
      calendarId: event.calendarId,
      externalId: event.externalId,
      syncStatus: event.syncStatus,
      lastSyncedAt: event.lastSyncedAt,
    },
  };
}

/**
 * Convert multiple events with calendar color mapping
 */
export function convertEventsToCalendarEvents(
  events: EventResponseDto[],
  calendarColorMap?: Map<string, number>
): EventCalendar.EventInput[] {
  return events.map(event => {
    const colorIndex = calendarColorMap?.get(event.calendarId) || 0;
    return convertEventToCalendarEvent(event, colorIndex);
  });
}

/**
 * Create a color map for calendars
 */
export function createCalendarColorMap(calendarIds: string[]): Map<string, number> {
  const colorMap = new Map<string, number>();
  calendarIds.forEach((id, index) => {
    colorMap.set(id, index);
  });
  return colorMap;
}

/**
 * Convert EventCalendar.EventInput back to CreateEventRequestDto or UpdateEventRequestDto
 */
export function convertCalendarEventToCreateDto(
  event: EventCalendar.EventInput,
  calendarId: string
): {
  calendarId: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
  status?: string;
  visibility?: string;
} {
  const title = typeof event.title === 'string' ? event.title : 'Untitled Event';
  
  return {
    calendarId,
    title,
    startTime: (event.start as Date).toISOString(),
    endTime: (event.end as Date).toISOString(),
    isAllDay: event.allDay,
    description: event.extendedProps?.description as string | undefined,
    location: event.extendedProps?.location as string | undefined,
    url: event.extendedProps?.url as string | undefined,
    status: event.extendedProps?.status as string | undefined,
    visibility: event.extendedProps?.visibility as string | undefined,
  };
}

/**
 * Format event time for display
 */
export function formatEventTime(startTime: string, endTime: string, isAllDay?: boolean): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isAllDay) {
    return start.toLocaleDateString();
  }

  const startStr = start.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const endStr = end.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // If same day, show only time for end
  if (start.toDateString() === end.toDateString()) {
    return `${startStr} - ${endStr}`;
  }

  // Different days, show full date for end
  const endFullStr = end.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${startStr} - ${endFullStr}`;
}
