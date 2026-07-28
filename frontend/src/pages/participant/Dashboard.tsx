import { useQuery } from '@tanstack/react-query';
import { dashboardApi, eventsApi, reservationsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Ticket, Calendar, Bus, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ParticipantDashboard() {
  const { data: stats } = useQuery({ queryKey: ['participant-stats'], queryFn: () => dashboardApi.getParticipant().then(r => r.data) });
  const { data: events } = useQuery({ queryKey: ['upcoming-events'], queryFn: () => eventsApi.getUpcoming().then(r => r.data) });
  const { data: myReservations, refetch } = useQuery({ queryKey: ['my-reservations'], queryFn: () => reservationsApi.getMyReservations().then(r => r.data) });

  const handleCancel = async (id: string) => {
    try { await reservationsApi.cancel(id); toast.success('Reservation cancelled'); refetch(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const cards = [
    { label: 'Total Reservations', value: stats?.totalReservations || 0, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Upcoming Trips', value: stats?.upcomingTrips || 0, icon: Bus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Completed', value: stats?.completedTrips || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Cancelled', value: stats?.cancelledTrips || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Dashboard</h1>
        <p className="text-muted-foreground">Your transportation overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(events) && events.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(e.date)}</p>
                </div>
                <Link to="/participant/bookings"><Button size="sm">Book Now</Button></Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>My Reservations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(myReservations) && myReservations.slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{r.event?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                  {r.status === 'CONFIRMED' && (
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleCancel(r.id)}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
            {(!myReservations || myReservations.length === 0) && (
              <p className="py-4 text-center text-muted-foreground">No reservations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
