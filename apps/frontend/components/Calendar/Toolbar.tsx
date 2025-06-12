"use client";

import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { ViewSwitcher } from './ViewSwitcher';
import { Calendar as EventCalendar } from '@event-calendar/core';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

interface CalendarToolbarProps {
  onCreate?: () => void;
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  calendar?: EventCalendar | null;
}

export const CalendarToolbar = ({ 
  onCreate, 
  currentView, 
  onViewChange,
  onPrev,
  onNext,
  onToday,
  calendar
}: CalendarToolbarProps) => {
  // Get current date/period title from calendar
  const getCurrentTitle = () => {
    if (!calendar) return 'Calendar';
    
    const view = calendar.getView();
    if (view?.title) {
      return view.title;
    }
    
    // Fallback formatting
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (currentView === 'dayGridMonth') {
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    } else if (currentView === 'timeGridWeek') {
      return `Week of ${monthNames[now.getMonth()]} ${now.getDate()}`;
    } else if (currentView === 'timeGridDay') {
      return `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
    
    return 'Calendar';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section: Hamburger, Title, and Navigation */}
        <div className="flex items-center gap-6">
          {/* Hamburger menu (mobile responsive) */}
          <button className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors md:hidden flex items-center justify-center">
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Current period title */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-normal text-gray-900 min-w-0">
              {getCurrentTitle()}
            </h1>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onPrev}
                className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors group flex items-center justify-center"
                title="Previous"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <button
                onClick={onNext}
                className="h-8 w-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors group flex items-center justify-center"
                title="Next"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <button
                onClick={onToday}
                className="h-9 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Right section: Create button and View switcher */}
        <div className="flex items-center gap-4">
          <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
          
          <button
            className="h-10 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium shadow-md"
            onClick={onCreate}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 