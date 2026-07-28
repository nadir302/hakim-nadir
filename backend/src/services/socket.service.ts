import { supabase } from '../config/supabase';

const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

function getChannel(name: string) {
  if (!activeChannels.has(name)) {
    const channel = supabase.channel(name);
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED' && status !== 'CHANNEL_ERROR') {
        activeChannels.delete(name);
      }
    });
    activeChannels.set(name, channel);
  }
  return activeChannels.get(name)!;
}

export const emitToUser = (userId: string, event: string, data: any) => {
  const channel = getChannel(`user:${userId}`);
  channel.send({ type: 'broadcast', event, payload: data });
};

export const emitToRole = (role: string, event: string, data: any) => {
  const channel = getChannel(`role:${role}`);
  channel.send({ type: 'broadcast', event, payload: data });
};

export const emitToTrip = (tripId: string, event: string, data: any) => {
  const channel = getChannel(`trip:${tripId}`);
  channel.send({ type: 'broadcast', event, payload: data });
};

export const emitToAllDrivers = (event: string, data: any) => {
  const channel = getChannel('drivers');
  channel.send({ type: 'broadcast', event, payload: data });
};
