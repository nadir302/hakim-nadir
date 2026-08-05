import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Bell, CheckCheck, Trash2, Bus, Clock, AlertTriangle, CheckCircle2, MapPin, XCircle, Info, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const typeIcons: Record<string, any> = {
  TRIP_STARTED: Bus,
  TRIP_ARRIVED: MapPin,
  TRIP_DELAYED: Clock,
  TRIP_CANCELLED: XCircle,
  RESERVATION_CONFIRMATION: CheckCircle2,
  REMINDER: AlertTriangle,
  GENERAL: Info,
};

const typeColors: Record<string, string> = {
  TRIP_STARTED: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
  TRIP_ARRIVED: 'text-green-600 bg-green-100 dark:bg-green-900',
  TRIP_DELAYED: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
  TRIP_CANCELLED: 'text-red-600 bg-red-100 dark:bg-red-900',
  RESERVATION_CONFIRMATION: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900',
  REMINDER: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900',
  GENERAL: 'text-gray-600 bg-gray-100 dark:bg-gray-900',
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 50 }).then(r => r.data),
    refetchInterval: 30000,
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const unsub = subscribe('notifications', 'notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => { unsub(); };
  }, [subscribe, queryClient]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-accent transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-card border rounded-xl shadow-lg z-50 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading && (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            )}
            {!isLoading && notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
            {notifications.map((n: any) => {
              const Icon = typeIcons[n.type] || Bell;
              const colorClass = typeColors[n.type] || 'text-gray-600 bg-gray-100';
              return (
                <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-accent transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        {!n.read && (
                          <button onClick={() => markReadMutation.mutate(n.id)} className="p-1 hover:bg-accent rounded" title="Mark read">
                            <CheckCheck className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                        <button onClick={() => deleteMutation.mutate(n.id)} className="p-1 hover:bg-accent rounded" title="Delete">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
