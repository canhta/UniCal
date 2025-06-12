import { useState } from 'react';
import { Calendar } from './Calendar';
import { Calendar as EventCalendar } from '@event-calendar/core';

export const CalendarExample = () => {
  const [events, setEvents] = useState<EventCalendar.EventInput[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(2024, 2, 20, 10, 0),
      end: new Date(2024, 2, 20, 11, 0),
      backgroundColor: '#1a73e8',
      textColor: '#ffffff'
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: new Date(2024, 2, 20, 12, 0),
      end: new Date(2024, 2, 20, 13, 0),
      backgroundColor: '#34a853',
      textColor: '#ffffff'
    }
  ]);

  const handleEventClick = (info: EventCalendar.EventClickInfo) => {
    console.log('Event clicked:', info.event);
  };

  const handleDateClick = (info: EventCalendar.DateClickInfo) => {
    console.log('Date clicked:', info.date);
  };

  const handleEventDrop = (info: EventCalendar.EventDropInfo) => {
    const updatedEvents = events.map(event => {
      if (event.id === info.event.id) {
        return {
          ...event,
          start: info.event.start,
          end: info.event.end
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleEventResize = (info: EventCalendar.EventResizeInfo) => {
    const updatedEvents = events.map(event => {
      if (event.id === info.event.id) {
        return {
          ...event,
          start: info.event.start,
          end: info.event.end
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleDateSelect = (info: EventCalendar.DatesSetInfo) => {
    const newEvent: EventCalendar.EventInput = {
      id: String(Date.now()),
      title: 'New Event',
      start: info.start,
      end: info.end,
      backgroundColor: '#1a73e8',
      textColor: '#ffffff',
      color: '#1a73e8'
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="calendar-example">
      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onDateSelect={handleDateSelect}
        initialView="timeGridWeek"
        height="800px"
        editable={true}
        selectable={true}
        nowIndicator={true}
        weekends={true}
        businessHours={true}
        slotDuration="00:30:00"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
      />
      <style jsx>{`
        .calendar-example {
          width: 100%;
          height: 100vh;
          padding: 20px;
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}; 