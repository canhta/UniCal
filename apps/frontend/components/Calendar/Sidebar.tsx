"use client";

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface Calendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  type: 'google' | 'outlook' | 'other';
}

// Mock data - replace with real data from API
const mockCalendars: Calendar[] = [
  { id: '1', name: 'Personal', color: '#1a73e8', visible: true, type: 'google' },
  { id: '2', name: 'Work', color: '#ea4335', visible: true, type: 'google' },
  { id: '3', name: 'Family', color: '#34a853', visible: false, type: 'outlook' },
  { id: '4', name: 'Holidays', color: '#fbbc04', visible: true, type: 'other' },
];

export const CalendarSidebar = () => {
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [myCalendarsExpanded, setMyCalendarsExpanded] = useState(true);
  const [otherCalendarsExpanded, setOtherCalendarsExpanded] = useState(true);

  // Mini calendar component
  const MiniCalendar = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="text-center p-1"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today;
      days.push(
        <button
          key={day}
          className={`text-center p-1 text-sm hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
            isToday 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex gap-1">
            <button className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <ChevronDownIcon className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
            <button className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <ChevronDownIcon className="w-4 h-4 text-gray-600 -rotate-90" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const toggleCalendarVisibility = (id: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, visible: !cal.visible } : cal
    ));
  };

  const CalendarItem = ({ calendar }: { calendar: Calendar }) => (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
      <button
        onClick={() => toggleCalendarVisibility(calendar.id)}
        className="h-8 w-8 p-1.5 flex items-center justify-center flex-shrink-0"
      >
        {calendar.visible ? (
          <EyeIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        ) : (
          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: calendar.color }}
      />
      <span className={`text-sm flex-1 min-w-0 truncate ${
        calendar.visible ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {calendar.name}
      </span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="h-8 w-8 p-1.5 hover:bg-gray-200 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );

  const myCalendars = calendars.filter(cal => cal.type === 'google' || cal.type === 'outlook');
  const otherCalendars = calendars.filter(cal => cal.type === 'other');

  return (
    <aside className="hidden lg:flex flex-col w-80 bg-gray-50 border-r border-gray-200 overflow-hidden">
      <div className="p-6 overflow-y-auto flex-1">
        {/* Mini Calendar */}
        <MiniCalendar />
        
        {/* My Calendars Section */}
        <div className="mb-6">
          <button
            onClick={() => setMyCalendarsExpanded(!myCalendarsExpanded)}
            className="h-9 flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {myCalendarsExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
            <span className="font-medium text-gray-900 text-sm">My calendars</span>
          </button>
          
          {myCalendarsExpanded && (
            <div className="ml-2 mt-2 space-y-1">
              {myCalendars.map(calendar => (
                <CalendarItem key={calendar.id} calendar={calendar} />
              ))}
            </div>
          )}
        </div>

        {/* Other Calendars Section */}
        {otherCalendars.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setOtherCalendarsExpanded(!otherCalendarsExpanded)}
              className="h-9 flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {otherCalendarsExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
              <span className="font-medium text-gray-900 text-sm">Other calendars</span>
            </button>
            
            {otherCalendarsExpanded && (
              <div className="ml-2 mt-2 space-y-1">
                {otherCalendars.map(calendar => (
                  <CalendarItem key={calendar.id} calendar={calendar} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <button className="h-9 w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            + Add calendar
          </button>
          <button className="h-9 w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            Import & export
          </button>
          <button className="h-9 w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}; 