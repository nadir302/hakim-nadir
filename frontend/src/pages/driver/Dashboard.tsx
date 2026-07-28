import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton, SkeletonCard } from '@/components/shared/Skeleton';
import { formatTime, getInitials, getStatusColor } from '@/lib/utils';
import {
  Bus, Route, Users, Timer, QrCode, Navigation, MapPin, Clock,
  AlertTriangle, CheckCircle2, XCircle, Bell, Search, UserCheck,
  UserX, ChevronRight, Car, ArrowRight, Gauge, Target
} from 'lucide-react';
import { useState, useMemo } from 'react';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DriverHeaderSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex flex-wrap items-center gap-4 p-5">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: () => dashboardApi.getDriver().then(r => r.data),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const bs = data?.boardingStats;
  const activeTrip = data?.activeTrip;

  useMemo(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const reservations = useMemo(() => {
    if (!activeTrip?.reservations) return [];
    return activeTrip.reservations
      .filter((r: any) =>
        !searchQuery ||
        `${r.participant?.firstName} ${r.participant?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reservationCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [activeTrip?.reservations, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
        <DriverHeaderSkeleton />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Driver Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage your trips, passengers, and boarding</p>
      </div>

      <Card className="border-0 bg-gradient-to-r from-primary/5 via-primary/0 to-transparent shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              getInitials(user?.firstName || '', user?.lastName || '')
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Car className="h-3.5 w-3.5" />
              {activeTrip?.vehicle?.busNumber || 'No bus assigned'}
            </p>
          </div>
          <Badge className={getStatusColor(activeTrip?.status || 'SCHEDULED')} aria-label={`Status: ${activeTrip?.status || 'Inactive'}`}>
            {activeTrip?.status?.replace('_', ' ') || 'Inactive'}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Current time">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(currentTime)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bus} label="Today's Trips" value={data?.todayTrips ?? 0} color="bg-blue-600" />
        <StatCard icon={Route} label="Total Trips" value={data?.totalTrips ?? 0} color="bg-emerald-600" />
        <StatCard icon={Users} label="Total Passengers" value={data?.totalPassengers ?? 0} color="bg-purple-600" />
        <StatCard icon={Target} label="Active Trip" value={activeTrip ? 'In Progress' : 'None'} color={activeTrip ? 'bg-emerald-600' : 'bg-gray-400'} />
      </div>

      {activeTrip && bs ? (
        <>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Active Trip</CardTitle>
                    <CardDescription>{bs.eventName}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(activeTrip.status)} aria-label={`Trip status: ${activeTrip.status}`}>
                  {activeTrip.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Origin
                  </p>
                  <p className="text-sm font-semibold">{activeTrip.route?.origin || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3 text-destructive" /> Destination
                  </p>
                  <p className="text-sm font-semibold">{activeTrip.route?.destination || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Bus className="h-3 w-3" /> Vehicle
                  </p>
                  <p className="text-sm font-semibold">{activeTrip.vehicle?.busNumber || '-'} ({activeTrip.vehicle?.plateNumber || '-'})</p>
                </div>
              </div>

              <hr className="my-4 border-dashed" />

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> Passengers
                    </span>
                    <span className="font-semibold">{bs.checkedIn} / {bs.capacity}</span>
                  </div>
                  <Progress value={bs.progress} className="h-2.5" aria-label={`Boarding progress ${bs.progress}%`} />
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-emerald-600 font-medium">{bs.checkedIn} boarded</span>
                    <span className="text-muted-foreground">{bs.remaining} remaining</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confirmed</span>
                    <span className="font-semibold text-emerald-600">{bs.totalConfirmed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Checked In</span>
                    <span className="font-semibold text-blue-600">{bs.checkedIn}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Departure</span>
                    <span className="font-semibold">{activeTrip.departureTime ? formatTime(activeTrip.departureTime) : '-'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/driver/tracking')}
                    aria-label="Open QR scanner"
                  >
                    <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/driver/tracking')}
                    aria-label="Open GPS tracking"
                  >
                    <Navigation className="mr-2 h-4 w-4" /> GPS Tracking
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/driver/trips')}
                    aria-label="View passenger list"
                  >
                    <Users className="mr-2 h-4 w-4" /> Passenger List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="border-b bg-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Passengers</CardTitle>
                    <CardDescription>{reservations.length} on this trip</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                    aria-label="Search passengers"
                  />
                </div>
                {reservations.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {searchQuery ? 'No passengers match your search.' : 'No passengers on this trip.'}
                  </p>
                ) : (
                  <div className="max-h-80 space-y-1.5 overflow-y-auto" role="list" aria-label="Passenger list">
                    {reservations.map((r: any) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        role="listitem"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {getInitials(r.participant?.firstName || '', r.participant?.lastName || '')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">
                            {r.participant?.firstName} {r.participant?.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{r.reservationCode}</p>
                        </div>
                        <Badge className={getStatusColor(r.status)} aria-label={`Status: ${r.status}`}>
                          {r.status.replace('_', ' ')}
                        </Badge>
                        {r.status === 'CHECKED_IN' && (
                          <UserCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Checked in" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-xs"
                  onClick={() => navigate('/driver/trips')}
                  aria-label="View all trips with full details"
                >
                  View All Trips <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">QR Scanner</CardTitle>
                      <CardDescription>Validate passenger boarding</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <Button
                    size="lg"
                    className="h-28 w-full text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigate('/driver/tracking')}
                    aria-label="Open QR scanner to validate passenger boarding"
                  >
                    <QrCode className="mr-3 h-8 w-8" />
                    Scan QR Code
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {bs.checkedIn} of {bs.capacity} passengers checked in
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">GPS Tracking</CardTitle>
                      <CardDescription>Share live location</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-20 w-full text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigate('/driver/tracking')}
                    aria-label="Open GPS tracking page"
                  >
                    <Navigation className="mr-2 h-6 w-6" />
                    Start GPS
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">Alerts</CardTitle>
                      <CardDescription>Quick actions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-5">
                  <Button variant="outline" className="w-full justify-start text-sm" disabled aria-label="Mark trip as delayed">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" /> Mark Delayed
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" disabled aria-label="Cancel trip">
                    <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel Trip
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" disabled aria-label="Send emergency alert">
                    <Bell className="mr-2 h-4 w-4 text-red-500" /> Emergency Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bus className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-semibold">No Active Trip</h3>
              <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                You don't have any trip in progress right now. When a trip starts, it will appear here.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => navigate('/driver/trips')}
                aria-label="View your trip schedule"
              >
                <Route className="mr-2 h-4 w-4" /> View Trip Schedule
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Navigation className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">GPS Tracking</p>
                <p className="text-xs text-muted-foreground">Available when trip starts</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <QrCode className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">QR Scanner</p>
                <p className="text-xs text-muted-foreground">Available when trip starts</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">Passenger List</p>
                <p className="text-xs text-muted-foreground">Available when trip starts</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}