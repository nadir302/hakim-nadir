import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate, getStatusColor } from '@/lib/utils';
import {
  CalendarDays, Users, Truck, Bus, Activity, CheckCircle2,
  TrendingUp, Clock, Hourglass, XCircle, UserCheck, UserX
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => dashboardApi.getAdmin().then(r => r.data) });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const stats = data?.overview || {};
  const pieData = data?.reservationsByStatus?.map((s: any) => ({ name: s.status, value: s._count })) || [];
  const barData = data?.reservationsByMonth || [];
  const boarding = data?.activeBoarding;

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950' },
    { label: 'Participants', value: stats.totalParticipants || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950' },
    { label: 'Drivers', value: stats.totalDrivers || 0, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950' },
    { label: 'Vehicles', value: stats.totalVehicles || 0, icon: Bus, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950' },
    { label: 'Pending', value: stats.pendingReservations || 0, icon: Hourglass, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-950' },
    { label: 'Checked-in', value: stats.checkedInReservations || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950' },
    { label: 'Rejected', value: stats.rejectedReservations || 0, icon: UserX, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950' },
    { label: 'Active Trips', value: stats.activeTrips || 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-950' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Reservation & boarding management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {boarding && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bus className="h-5 w-5 text-emerald-600" /> Active Boarding — {boarding.eventName}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div><p className="text-sm text-muted-foreground">Bus</p><p className="text-lg font-semibold">{boarding.busNumber}</p></div>
              <div><p className="text-sm text-muted-foreground">Capacity</p><p className="text-lg font-semibold">{boarding.capacity}</p></div>
              <div><p className="text-sm text-muted-foreground">Route</p><p className="text-lg font-semibold">{boarding.routeName}</p></div>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium">Boarding Progress</span>
              <span className="text-sm text-muted-foreground">{boarding.checkedIn} / {boarding.capacity} checked in</span>
              <Badge variant="secondary" className="ml-auto">{boarding.progress}%</Badge>
            </div>
            <Progress value={boarding.progress} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span className="text-emerald-600 font-medium">{boarding.confirmed} confirmed</span>
              <span className="text-orange-600 font-medium">{boarding.remaining} remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Reservations</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Array.isArray(barData) ? barData : []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reservation Status</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name }) => name}>
                      {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {pieData.map((entry: any, i: number) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize">{entry.name.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Reservations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentReservations?.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.participant?.firstName} {r.participant?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{r.event?.name}</p>
                  </div>
                  <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.upcomingEvents?.slice(0, 5).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                  </div>
                  <Badge className={getStatusColor(e.status)}>{e.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
