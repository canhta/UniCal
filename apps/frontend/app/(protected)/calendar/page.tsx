'use client'

import { IntegratedCalendar } from '@/components/Calendar/IntegratedCalendar';

export default function CalendarPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f8f9fa', padding: 0, margin: 0 }}>
      <IntegratedCalendar />
    </div>
  );
}
