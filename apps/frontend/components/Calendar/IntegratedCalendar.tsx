'use client';

import { useState, useEffect } from 'react';
import { Calendar } from './Calendar';
import { useEvents } from '@/lib/hooks/useEvents';
import { useCalendars } from '@/lib/hooks/useCalendars';
import { useAuth } from '@/lib/hooks/useAuth';
import { convertEventsToCalendarEvents, createCalendarColorMap } from '@/lib/utils/eventUtils';
import { Calendar as EventCalendar } from '@event-calendar/core';
import { UpdateEventRequestDto } from '@unical/core';

export const IntegratedCalendar = () => {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  const authState = useAuth();

  // Fetch calendars and events - these hooks now check auth state internally
  const { calendars, loading: calendarsLoading, error: calendarsError } = useCalendars();
  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError, 
    updateEvent,
  } = useEvents({
    calendarIds: selectedCalendars.length > 0 ? selectedCalendars : undefined,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  });

  // Auto-select all visible calendars by default
  useEffect(() => {
    if (calendars.length > 0 && selectedCalendars.length === 0) {
      const visibleCalendarIds = calendars
        .filter(cal => cal.isVisible)
        .map(cal => cal.id);
      setSelectedCalendars(visibleCalendarIds);
    }
  }, [calendars, selectedCalendars.length]);

  // Show loading state if auth is not ready
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (!authState.hasUniCalTokens) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">Authentication required</p>
          <p className="text-gray-600">Please log in to view your calendar</p>
        </div>
      </div>
    );
  }

  // Create color map for calendars
  const colorMap = createCalendarColorMap(calendars.map(cal => cal.id));

  // Convert events to calendar format
  const calendarEvents = convertEventsToCalendarEvents(events, colorMap);

  const handleEventClick = (info: EventCalendar.EventClickInfo) => {
    console.log('Event clicked:', info.event);
    // TODO: Open event details modal
  };

  const handleDateClick = (info: EventCalendar.DateClickInfo) => {
    console.log('Date clicked:', info.date);
    // TODO: Open create event modal with selected date
  };

  const handleEventDrop = async (info: EventCalendar.EventDropInfo) => {
    try {
      const eventId = String(info.event.id);
      const updateData: UpdateEventRequestDto = {
        startTime: (info.event.start as Date).toISOString(),
        endTime: (info.event.end as Date).toISOString(),
      };
      
      await updateEvent(eventId, updateData);
      console.log('Event moved successfully');
    } catch (error) {
      console.error('Failed to move event:', error);
      // Revert the event position
      info.revert();
    }
  };

  const handleEventResize = async (info: EventCalendar.EventResizeInfo) => {
    try {
      const eventId = String(info.event.id);
      const updateData: UpdateEventRequestDto = {
        startTime: (info.event.start as Date).toISOString(),
        endTime: (info.event.end as Date).toISOString(),
      };
      
      await updateEvent(eventId, updateData);
      console.log('Event resized successfully');
    } catch (error) {
      console.error('Failed to resize event:', error);
      // Revert the event size
      info.revert();
    }
  };

  const handleDateSelect = (info: EventCalendar.DatesSetInfo) => {
    // Update date range when user navigates the calendar
    setDateRange({
      start: info.start,
      end: info.end,
    });
  };

  // Handle calendar visibility toggle
  const toggleCalendarVisibility = (calendarId: string) => {
    setSelectedCalendars(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  };

  if (calendarsLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  if (calendarsError || eventsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">
          Error: {calendarsError || eventsError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Calendar Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">My Calendars</h3>
        <div className="space-y-2">
          {calendars.map((calendar, index) => (
            <div key={calendar.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`calendar-${calendar.id}`}
                checked={selectedCalendars.includes(calendar.id)}
                onChange={() => toggleCalendarVisibility(calendar.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                }}
              />
              <label
                htmlFor={`calendar-${calendar.id}`}
                className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
              >
                {calendar.name}
              </label>
            </div>
          ))}
        </div>
        
        {calendars.length === 0 && (
          <div className="text-sm text-gray-500">
            No calendars found. Connect your calendar accounts to get started.
          </div>
        )}
      </div>

      {/* Main Calendar */}
      <div className="flex-1">
        <Calendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onDateSelect={handleDateSelect}
          height="100vh"
          editable={true}
          selectable={true}
          nowIndicator={true}
        />
      </div>
    </div>
  );
};
