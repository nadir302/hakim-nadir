import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatTime } from '@/lib/utils';
import { Bus, Navigation, Users, Gauge, MapPin } from 'lucide-react';
import ShuttleMap from '@/components/maps/ShuttleMap';

export default function AdminActiveShuttles() {
  const { data: trips, isLoading } = useQuery({
    queryKey: ['active-shuttles'],
    queryFn: () => tripsApi.getActive().then(r => r.data),
    refetchInterval: 10000,
  });

  const activeTrips = Array.isArray(trips) ? trips : [];

  const routePoints = activeTrips.map((t: any) => {
    if (t.currentLat && t.currentLng) return [t.currentLat, t.currentLng] as [number, number];
    if (t.route?.originLat && t.route?.originLng) return [t.route.originLat, t.route.originLng] as [number, number];
    return null;
  }).filter(Boolean) as [number, number][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Active Shuttles</h1>
        <p className="text-muted-foreground">Real-time monitoring of all active shuttles</p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[400px]">
          <ShuttleMap
            center={routePoints[0] || [40.7128, -74.006]}
            shuttlePosition={routePoints.length > 0 ? routePoints[0] : undefined}
            height="100%"
            zoom={11}
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeTrips.map((trip: any) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{trip.vehicle?.busNumber || 'N/A'}</span>
                </div>
                <Badge className={getStatusColor(trip.status)}>{trip.status.replace('_', ' ')}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Driver:</span>
                  <span className="font-medium">{trip.driver?.user?.firstName} {trip.driver?.user?.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Route:</span>
                  <span className="font-medium">{trip.route?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Passengers:</span>
                  <span className="font-medium">{trip._count?.reservations || 0}</span>
                </div>
                {trip.currentSpeed && (
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">{Math.round(trip.currentSpeed)} km/h</span>
                  </div>
                )}
              </div>

              {trip.currentLat && trip.currentLng && (
                <div className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                  {trip.currentLat.toFixed(4)}, {trip.currentLng.toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {activeTrips.length === 0 && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bus className="mb-3 h-12 w-12 opacity-50" />
            <p>No active shuttles right now</p>
          </div>
        )}
      </div>
    </div>
  );
}
