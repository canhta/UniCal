'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

interface ViewSwitcherProps {
    currentView: CalendarView;
    onViewChange: (view: CalendarView) => void;
}

export const ViewSwitcher = ({ currentView, onViewChange }: ViewSwitcherProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const views: { id: CalendarView; label: string; shortLabel: string }[] = [
        { id: 'dayGridMonth', label: 'Month', shortLabel: 'Month' },
        { id: 'timeGridWeek', label: 'Week', shortLabel: 'Week' },
        { id: 'timeGridDay', label: 'Day', shortLabel: 'Day' },
        { id: 'listWeek', label: 'Schedule', shortLabel: 'Schedule' },
    ];

    const currentViewLabel = views.find(view => view.id === currentView)?.label || 'Month';

    return (
        <div className="relative">
            {/* Desktop view - traditional button group */}
            <div className="hidden md:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                {views.map((view, index) => (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`h-9 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            currentView === view.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        } ${index !== 0 ? 'border-l border-gray-300' : ''}`}
                    >
                        {view.shortLabel}
                    </button>
                ))}
            </div>

            {/* Mobile view - dropdown */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-9 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {currentViewLabel}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsOpen(false)}
                        />
                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                            {views.map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => {
                                        onViewChange(view.id);
                                        setIsOpen(false);
                                    }}
                                    className={`h-9 block w-full px-4 py-2 text-left text-sm transition-colors ${
                                        currentView === view.id
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 