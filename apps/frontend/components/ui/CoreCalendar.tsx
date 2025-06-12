import React, { useRef, useEffect } from 'react';
import { createCalendar, destroyCalendar, DayGrid, TimeGrid, List, Calendar } from '@event-calendar/core';
import '@event-calendar/core/index.css';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Spinner } from './spinner';

// Define the type for backend event
interface BackendEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}

// Map backend event to calendar event format
function mapEvent(event: BackendEvent) {
  return {
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    color: event.color || '#1976D2',
  };
}

const CoreCalendar: React.FC = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<Calendar | null>(null);

  // Fetch events from backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.getEvents(),
  });

  // Convert backend events to calendar events
  const events = Array.isArray(data) ? data.map(mapEvent) : [];

  useEffect(() => {
    if (calendarRef.current && !isLoading && !error) {
      if (calendarInstance.current) {
        destroyCalendar(calendarInstance.current);
      }
      calendarInstance.current = createCalendar(
        calendarRef.current,
        [DayGrid, TimeGrid, List],
        {
          view: 'dayGridMonth',
          height: '600px',
          events,
          headerToolbar: {
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          },
          editable: true,
          selectable: true,
        }
      );
    }
    return () => {
      if (calendarInstance.current) {
        destroyCalendar(calendarInstance.current);
      }
    };
    // Only re-run when events change
  }, [isLoading, error, events]);

  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <div className="text-red-500">Failed to load events.</div>;
  }

  return (
    <div ref={calendarRef} style={{ width: '100%', minHeight: 600 }} />
  );
};

export default CoreCalendar; 