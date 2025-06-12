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
import { CalendarSidebar } from './Sidebar';
import { CalendarToolbar } from './Toolbar';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

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
                eventContent: (info) => {
                    const isAllDay = info.event.allDay;
                    const title = info.event.title || 'Untitled Event';
                    
                    return {
                        html: `
                            <div class="event-content" style="padding: 4px 6px; height: 100%; overflow: hidden;">
                                <div class="event-title" style="font-weight: 500; font-size: 12px; line-height: 1.2; color: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${title}
                                </div>
                                ${!isAllDay && info.timeText ? `
                                    <div class="event-time" style="font-size: 11px; opacity: 0.8; margin-top: 2px; color: inherit;">
                                        ${info.timeText}
                                    </div>
                                ` : ''}
                            </div>
                        `
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

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden">
            <CalendarSidebar />
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
                            <div className="text-gray-600 mb-6">
                                Event creation will be available soon. This feature is currently under development.
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    className="h-10 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" 
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};