'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { CalendarResponseDto, PlatformCalendarDto, SyncCalendarDto, UpdateCalendarSettingsDto } from '@unical/core';

interface UseCalendarsResult {
  calendars: CalendarResponseDto[];
  loading: boolean;
  error: string | null;
  refreshCalendars: () => Promise<void>;
  updateCalendarSettings: (calendarId: string, settings: UpdateCalendarSettingsDto) => Promise<void>;
  unsyncCalendar: (calendarId: string) => Promise<void>;
}

export function useCalendars(includeHidden = false): UseCalendarsResult {
  const [calendars, setCalendars] = useState<CalendarResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUserCalendars(includeHidden);
      setCalendars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
    } finally {
      setLoading(false);
    }
  }, [includeHidden]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  const updateCalendarSettings = useCallback(async (calendarId: string, settings: UpdateCalendarSettingsDto) => {
    try {
      const updatedCalendar = await apiClient.updateCalendarSettings(calendarId, settings);
      setCalendars(prev => prev.map(cal => cal.id === calendarId ? updatedCalendar : cal));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update calendar settings');
      throw err;
    }
  }, []);

  const unsyncCalendar = useCallback(async (calendarId: string) => {
    try {
      await apiClient.unsyncCalendar(calendarId);
      setCalendars(prev => prev.filter(cal => cal.id !== calendarId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsync calendar');
      throw err;
    }
  }, []);

  return {
    calendars,
    loading,
    error,
    refreshCalendars: fetchCalendars,
    updateCalendarSettings,
    unsyncCalendar,
  };
}

interface UseExternalCalendarsResult {
  externalCalendars: PlatformCalendarDto[];
  loading: boolean;
  error: string | null;
  syncCalendar: (data: SyncCalendarDto) => Promise<void>;
}

export function useExternalCalendars(accountId: string | null): UseExternalCalendarsResult {
  const [externalCalendars, setExternalCalendars] = useState<PlatformCalendarDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    const fetchExternalCalendars = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getExternalCalendars(accountId);
        setExternalCalendars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch external calendars');
      } finally {
        setLoading(false);
      }
    };

    fetchExternalCalendars();
  }, [accountId]);

  const syncCalendar = useCallback(async (data: SyncCalendarDto) => {
    try {
      await apiClient.syncCalendar(data);
      // Optionally remove from external calendars if it's now synced
      setExternalCalendars(prev => prev.filter(cal => cal.id !== data.externalCalendarId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync calendar');
      throw err;
    }
  }, []);

  return {
    externalCalendars,
    loading,
    error,
    syncCalendar,
  };
}
