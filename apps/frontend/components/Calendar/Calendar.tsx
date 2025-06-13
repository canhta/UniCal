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
import './google-calendar.css';
import { CalendarToolbar } from './Toolbar';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

interface CalendarEvent extends EventCalendar.EventInput {
    extendedProps?: {
        description?: string;
        location?: string;
    };
}

interface CalendarProps {
    events?: EventCalendar.EventInput[];
    onEventClick?: (info: EventCalendar.EventClickInfo) => void;
    onDateClick?: (info: EventCalendar.DateClickInfo) => void;
    onEventDrop?: (info: EventCalendar.EventDropInfo) => void;
    onEventResize?: (info: EventCalendar.EventResizeInfo) => void;
    onDateSelect?: (info: EventCalendar.DatesSetInfo) => void;
    initialView?: CalendarView;
    height?: string;
    editable?: boolean;
    selectable?: boolean;
    nowIndicator?: boolean;
    weekends?: boolean;
    businessHours?: boolean;
    slotDuration?: string;
    slotMinTime?: string;
    slotMaxTime?: string;
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
}: CalendarProps) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendar, setCalendar] = useState<EventCalendar | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentView, setCurrentView] = useState<CalendarView>(initialView);

    useEffect(() => {
        if (calendarRef.current) {
            const options: EventCalendar.Options = {
                view: currentView,
                height: '100%',
                editable,
                selectable,
                nowIndicator,
                slotDuration,
                slotMinTime,
                slotMaxTime,
                headerToolbar: { start: '', center: '', end: '' },
                events,
                eventClick: onEventClick,
                dateClick: onDateClick,
                eventDrop: onEventDrop,
                eventResize: onEventResize,
                select: onDateSelect,
                allDaySlot: true,
                slotEventOverlap: true,
                dayMaxEvents: false,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: 'numeric',
                    minute: '2-digit'
                },
                slotLabelFormat: {
                    hour: 'numeric',
                    minute: '2-digit'
                },
                dayHeaderFormat: {
                    weekday: 'short',
                    month: 'numeric',
                    day: 'numeric'
                },
                noEventsContent: 'No events to display',
                eventContent: (info: EventCalendar.EventContentInfo) => {
                    const isAllDay = info.event.allDay;
                    const title = info.event.title || 'Untitled Event';
                    const titleText = typeof title === 'string' ? title : ('html' in title ? title.html : 'Untitled Event');
                    
                    // Create the main container div
                    const containerDiv = document.createElement('div');
                    containerDiv.className = 'event-content';
                    containerDiv.style.cssText = 'padding: 4px 6px; height: 100%; overflow: hidden;';
                    
                    // Create the title div
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'event-title';
                    titleDiv.style.cssText = 'font-weight: 500; font-size: 12px; line-height: 1.2; color: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                    titleDiv.textContent = titleText;
                    containerDiv.appendChild(titleDiv);
                    
                    // Create the time div if not all day and time text exists
                    if (!isAllDay && info.timeText) {
                        const timeDiv = document.createElement('div');
                        timeDiv.className = 'event-time';
                        timeDiv.style.cssText = 'font-size: 11px; opacity: 0.8; margin-top: 2px; color: inherit;';
                        timeDiv.textContent = info.timeText;
                        containerDiv.appendChild(timeDiv);
                    }
                    
                    return {
                        domNodes: [containerDiv]
                    };
                },
                moreLinkContent: (arg) => `+${arg.num} more`,
                locale: 'en',
                firstDay: 0,
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
    }, [businessHours, editable, events, height, initialView, nowIndicator, onDateClick, onDateSelect, onEventClick, onEventDrop, onEventResize, selectable, slotDuration, slotMaxTime, slotMinTime, weekends, currentView]);

    useEffect(() => {
        if (calendar) {
            calendar.setOption('events', events);
        }
    }, [events, calendar]);

    const handleViewChange = (view: CalendarView) => {
        if (calendar) {
            calendar.setOption('view', view);
            setCurrentView(view);
        }
    };

    const handlePrev = () => {
        if (calendar) {
            calendar.prev();
        }
    };

    const handleNext = () => {
        if (calendar) {
            calendar.next();
        }
    };

    const handleToday = () => {
        if (calendar) {
            calendar.setOption('date', new Date());
        }
    };

    const handleEventClick = (info: EventCalendar.EventClickInfo) => {
        const eventData: CalendarEvent = {
            id: info.event.id,
            title: info.event.title,
            start: info.event.start,
            end: info.event.end,
            allDay: info.event.allDay,
            backgroundColor: info.event.backgroundColor,
            textColor: info.event.textColor,
            extendedProps: info.event.extendedProps as CalendarEvent['extendedProps'],
        };
        setSelectedEvent(eventData);
        setShowEventModal(true);
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden">
            <main className="flex-1 flex flex-col h-full min-w-0">
                <CalendarToolbar 
                    onCreate={() => setShowCreateModal(true)}
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onToday={handleToday}
                    calendar={calendar}
                />
                <div className="flex-1 w-full h-full bg-white overflow-hidden flex flex-col min-h-0 min-w-0">
                    <div ref={calendarRef} className="flex-1 w-full min-h-0 min-w-0" />
                </div>
                {/* Event Details Modal */}
                {showEventModal && selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl p-6 min-w-[400px] max-w-[500px] mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.title?.toString() }</h2>
                                <button 
                                    className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" 
                                    onClick={() => setShowEventModal(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Time</h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedEvent.allDay ? (
                                            'All day'
                                        ) : (
                                            `${new Date(selectedEvent.start as Date).toLocaleString()} - ${new Date(selectedEvent.end as Date).toLocaleString()}`
                                        )}
                                    </p>
                                </div>
                                {selectedEvent.extendedProps?.description && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                            {String(selectedEvent.extendedProps.description as string)}
                                        </p>
                                    </div>
                                )}
                                {selectedEvent.extendedProps?.location && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {String(selectedEvent.extendedProps.location as string)}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // TODO: Implement event editing
                                        console.log('Edit event:', selectedEvent);
                                        setShowEventModal(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Enhanced Create Event Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl p-6 min-w-[400px] max-w-[500px] mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Create Event</h2>
                                <button 
                                    className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" 
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const eventData = {
                                    title: formData.get('title') as string,
                                    start: new Date(formData.get('start') as string),
                                    end: new Date(formData.get('end') as string),
                                    allDay: formData.get('allDay') === 'true',
                                    description: formData.get('description') as string,
                                };
                                // TODO: Implement event creation
                                console.log('Creating event:', eventData);
                                setShowCreateModal(false);
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="start" className="block text-sm font-medium text-gray-700">Start</label>
                                            <input
                                                type="datetime-local"
                                                name="start"
                                                id="start"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="end" className="block text-sm font-medium text-gray-700">End</label>
                                            <input
                                                type="datetime-local"
                                                name="end"
                                                id="end"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="allDay"
                                                value="true"
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">All day event</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Create Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};