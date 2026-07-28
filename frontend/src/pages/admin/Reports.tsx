import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, Users, Truck, Bus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function exportCSV(data: any[], filename: string, headers: string[]) {
  const csv = [headers.join(','), ...data.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${filename}.csv`;
  link.click(); URL.revokeObjectURL(link.href);
  toast.success(`${filename}.csv downloaded`);
}

export default function AdminReports() {
  const { data: daily } = useQuery({ queryKey: ['report-daily'], queryFn: () => reportsApi.getDaily().then(r => r.data) });
  const { data: weekly } = useQuery({ queryKey: ['report-weekly'], queryFn: () => reportsApi.getWeekly().then(r => r.data) });
  const { data: monthly } = useQuery({ queryKey: ['report-monthly'], queryFn: () => reportsApi.getMonthly().then(r => r.data) });
  const { data: routeAnalytics } = useQuery({ queryKey: ['report-routes'], queryFn: () => reportsApi.getRouteAnalytics().then(r => r.data) });
  const { data: tripsPerDay } = useQuery({ queryKey: ['report-trips-per-day'], queryFn: () => reportsApi.getTripsPerDay(14).then(r => r.data) });
  const { data: driverPerformance } = useQuery({ queryKey: ['report-drivers'], queryFn: () => reportsApi.getDriverPerformance().then(r => r.data) });
  const { data: vehicleUsage } = useQuery({ queryKey: ['report-vehicles'], queryFn: () => reportsApi.getVehicleUsage().then(r => r.data) });
  const { data: occupancy } = useQuery({ queryKey: ['report-occupancy'], queryFn: () => reportsApi.getOccupancyStats().then(r => r.data) });

  const routeData = Array.isArray(routeAnalytics) ? routeAnalytics : [];
  const tripsData = Array.isArray(tripsPerDay) ? tripsPerDay : [];
  const driversData = Array.isArray(driverPerformance) ? driverPerformance : [];
  const vehiclesData = Array.isArray(vehicleUsage) ? vehicleUsage : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics & Reports</h1>
          <p className="text-muted-foreground">Full analytics dashboard with export</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(routeData, 'route-analytics', ['name', 'totalTrips', 'totalPassengers', 'avgPassengersPerTrip'])}>
            <Download className="h-4 w-4 mr-2" /> Routes CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(tripsData, 'trips-per-day', ['day', 'trips', 'completed', 'delayed', 'cancelled'])}>
            <Download className="h-4 w-4 mr-2" /> Trips CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(driversData, 'driver-performance', ['name', 'totalTrips', 'completedTrips', 'rating'])}>
            <Download className="h-4 w-4 mr-2" /> Drivers CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-blue-600 shrink-0" /><div><p className="text-2xl font-bold">{daily?.trips || 0}</p><p className="text-xs text-muted-foreground">Today's Trips</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-green-600 shrink-0" /><div><p className="text-2xl font-bold">{weekly?.reservations || 0}</p><p className="text-xs text-muted-foreground">Weekly Reservations</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><Bus className="h-8 w-8 text-purple-600 shrink-0" /><div><p className="text-2xl font-bold">{monthly?.trips || 0}</p><p className="text-xs text-muted-foreground">Monthly Trips</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-orange-600 shrink-0" /><div><p className="text-2xl font-bold">{occupancy?.occupancyRate || 0}%</p><p className="text-xs text-muted-foreground">Occupancy Rate</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Trips per Day (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tripsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Line type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={2} name="Total" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="delayed" stroke="#f59e0b" strokeWidth={2} name="Delayed" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Route Popularity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                <Tooltip />
                <Bar dataKey="totalTrips" fill="#3b82f6" name="Trips" radius={[0, 4, 4, 0]} />
                <Bar dataKey="totalPassengers" fill="#22c55e" name="Passengers" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Driver Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driversData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip />
                <Bar dataKey="totalTrips" fill="#8b5cf6" name="Total Trips" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completedTrips" fill="#22c55e" name="Completed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle Usage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehiclesData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="busNumber" width={80} className="text-xs" />
                <Tooltip />
                <Bar dataKey="totalTrips" fill="#06b6d4" name="Trips" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Occupancy Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: 'Occupied', value: occupancy?.totalPassengers || 0 },
                  { name: 'Available', value: Math.max(0, (occupancy?.totalCapacity || 0) - (occupancy?.totalPassengers || 0)) },
                ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Today's Trips</span>
              <span className="font-bold">{daily?.trips || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-600" /> Weekly Reservations</span>
              <span className="font-bold">{weekly?.reservations || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600" /> Monthly Trips</span>
              <span className="font-bold">{monthly?.trips || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-600" /> Late Trips</span>
              <span className="font-bold">{tripsData.reduce((s: number, d: any) => s + (d.delayed || 0), 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
