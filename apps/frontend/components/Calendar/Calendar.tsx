'use client';

import { useEffect, useRef, useState } from 'react';
import {
    createCalendar,
    destroyCalendar,
    TimeGrid,
    DayGrid,
    List,
    Interaction,
    Calendar as EventCalendar
} from '@event-calendar/core';
import '@event-calendar/core/index.css';

interface CalendarProps {
    events?: EventCalendar.EventInput[];
    onEventClick?: (info: EventCalendar.EventClickInfo) => void;
    onDateClick?: (info: EventCalendar.DateClickInfo) => void;
    onEventDrop?: (info: EventCalendar.EventDropInfo) => void;
    onEventResize?: (info: EventCalendar.EventResizeInfo) => void;
    onDateSelect?: (info: EventCalendar.DatesSetInfo) => void;
    initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
    height?: string;
    editable?: boolean;
    selectable?: boolean;
    nowIndicator?: boolean;
    weekends?: boolean;
    businessHours?: boolean;
    slotDuration?: string;
    slotMinTime?: string;
    slotMaxTime?: string;
    headerToolbar?: { start: string; center: string; end: string; }
}

export const Calendar = ({
    events = [],
    onEventClick,
    onDateClick,
    onEventDrop,
    onEventResize,
    onDateSelect,
    initialView = 'timeGridWeek',
    height = '100%',
    editable = true,
    selectable = true,
    nowIndicator = true,
    weekends = true,
    businessHours = true,
    slotDuration = '00:30:00',
    slotMinTime = '00:00:00',
    slotMaxTime = '24:00:00',
    headerToolbar = {
        start: 'prev,next today',
        center: 'title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    }
}: CalendarProps) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendar, setCalendar] = useState<EventCalendar | null>(null);

    useEffect(() => {
        if (calendarRef.current) {
            const options: EventCalendar.Options = {
                view: initialView,
                height,
                editable,
                selectable,
                nowIndicator,
                slotDuration,
                slotMinTime,
                slotMaxTime,
                headerToolbar,
                events,
                eventClick: onEventClick,
                dateClick: onDateClick,
                eventDrop: onEventDrop,
                eventResize: onEventResize,
                select: onDateSelect,
                allDaySlot: true,
                slotEventOverlap: true,
                dayMaxEvents: true,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: 'numeric',
                    minute: '2-digit',
                },
                theme: {
                    '--ec-primary-color': '#1a73e8',
                    '--ec-border-color': '#e0e0e0',
                    '--ec-today-bg-color': '#f8f9fa',
                    '--ec-event-bg-color': '#1a73e8',
                    '--ec-event-border-color': '#1a73e8',
                    '--ec-event-text-color': '#ffffff',
                    '--ec-selected-bg-color': 'rgba(26, 115, 232, 0.1)',
                    '--ec-selected-border-color': '#1a73e8'
                }
            };
            const ec = createCalendar(
                calendarRef.current,
                [TimeGrid, DayGrid, List, Interaction],
                options
            );
            setCalendar(ec);
            return () => {
                destroyCalendar(ec);
            };
        }
    }, [businessHours, editable, events, headerToolbar, height, initialView, nowIndicator, onDateClick, onDateSelect, onEventClick, onEventDrop, onEventResize, selectable, slotDuration, slotMaxTime, slotMinTime, weekends]);

    useEffect(() => {
        if (calendar) {
            calendar.setOption('events', events);
        }
    }, [events, calendar]);

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-sm">
            <div ref={calendarRef} className="w-full h-full" />
        </div>
    );
}; 