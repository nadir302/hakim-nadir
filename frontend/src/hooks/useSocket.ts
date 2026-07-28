import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseSocketReturn {
  subscribe: (channel: string, event: string, callback: (payload: any) => void) => () => void;
  joinTrip: (tripId: string) => void;
  leaveTrip: (tripId: string) => void;
}

export function useSocket(): UseSocketReturn {
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  const subscribe = useCallback((channelName: string, event: string, callback: (payload: any) => void) => {
    let channel = channelsRef.current.get(channelName);
    if (!channel) {
      channel = supabase.channel(channelName);
      channelsRef.current.set(channelName, channel);
      channel.subscribe();
    }

    channel.on('broadcast', { event }, (payload) => {
      callback(payload);
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
        channelsRef.current.delete(channelName);
      }
    };
  }, []);

  const joinTrip = useCallback((tripId: string) => {
    const name = `trip:${tripId}`;
    if (!channelsRef.current.has(name)) {
      const channel = supabase.channel(name);
      channelsRef.current.set(name, channel);
      channel.subscribe();
    }
  }, []);

  const leaveTrip = useCallback((tripId: string) => {
    const name = `trip:${tripId}`;
    const channel = channelsRef.current.get(name);
    if (channel) {
      channel.unsubscribe();
      channelsRef.current.delete(name);
    }
  }, []);

  useEffect(() => {
    return () => {
      channelsRef.current.forEach((ch) => ch.unsubscribe());
      channelsRef.current.clear();
    };
  }, []);

  return { subscribe, joinTrip, leaveTrip };
}
