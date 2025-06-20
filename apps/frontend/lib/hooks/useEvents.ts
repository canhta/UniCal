'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './useAuth';
import { EventResponseDto, CreateEventRequestDto, UpdateEventRequestDto, GetEventsQueryDto } from '@unical/core';

interface UseEventsResult {
  events: EventResponseDto[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  createEvent: (data: CreateEventRequestDto) => Promise<EventResponseDto>;
  updateEvent: (eventId: string, data: UpdateEventRequestDto) => Promise<EventResponseDto>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export function useEvents(query?: GetEventsQueryDto): UseEventsResult {
  const [events, setEvents] = useState<EventResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authState = useAuth();
  const queryRef = useRef(query);
  queryRef.current = query;

  const fetchEvents = useCallback(async () => {
    // Don't fetch if auth is not ready or doesn't have tokens
    if (authState.isLoading || !authState.hasUniCalTokens) {
      console.log(`useEvents: Skipping fetch - loading: ${authState.isLoading}, hasTokens: ${authState.hasUniCalTokens}`);
      setLoading(false);
      return;
    }

    try {
      console.log('useEvents: Fetching events with query:', queryRef.current);
      setLoading(true);
      setError(null);
      const data = await apiClient.getEvents(queryRef.current);
      console.log(`useEvents: Fetched ${data.length} events`);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.warn('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [authState.isLoading, authState.hasUniCalTokens]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (data: CreateEventRequestDto): Promise<EventResponseDto> => {
    try {
      const newEvent = await apiClient.createEvent(data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, data: UpdateEventRequestDto): Promise<EventResponseDto> => {
    try {
      const updatedEvent = await apiClient.updateEvent(eventId, data);
      setEvents(prev => prev.map(event => event.id === eventId ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      await apiClient.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    refreshEvents: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

// Hook for a single event
interface UseEventResult {
  event: EventResponseDto | null;
  loading: boolean;
  error: string | null;
}

export function useEvent(eventId: string | null): UseEventResult {
  const [event, setEvent] = useState<EventResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
}
