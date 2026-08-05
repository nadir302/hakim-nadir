import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatTime } from '@/lib/utils';
import { Bus, Navigation, Users, Gauge, MapPin, Clock, Crosshair } from 'lucide-react';
import TrackingMap from '@/components/maps/TrackingMap';

export default function AdminActiveShuttles() {
  const { data: trips, isLoading } = useQuery({
    queryKey: ['active-shuttles'],
    queryFn: () => trackingApi.getActiveShuttles().then(r => r.data),
    refetchInterval: 10000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeTrips = Array.isArray(trips) ? trips : [];

  const locatedTrips = activeTrips.map((t: any) => {
    const lat = t.currentLat ?? t.vehicle?.currentLat ?? t.route?.originLat;
    const lng = t.currentLng ?? t.vehicle?.currentLng ?? t.route?.originLng;
    return { ...t, _lat: lat, _lng: lng };
  });

  const selected = selectedId ? locatedTrips.find((t: any) => t.id === selectedId) : null;

  const shuttles = useMemo(() => (
    locatedTrips
      .filter((t: any) => t._lat && t._lng)
      .map((t: any) => ({
        id: t.id,
        label: t.vehicle?.busNumber || t.route?.name || 'Shuttle',
        position: [t._lat, t._lng] as [number, number],
        heading: t.currentHeading,
      }))
  ), [locatedTrips]);

  const selectedRoutePath = useMemo(() => {
    if (!selected?.route) return undefined;
    const points: [number, number][] = [];
    if (selected.route.originLat && selected.route.originLng) points.push([selected.route.originLat, selected.route.originLng]);
    if (selected.route.destinationLat && selected.route.destinationLng) points.push([selected.route.destinationLat, selected.route.destinationLng]);
    return points.length > 1 ? points : undefined;
  }, [selected]);

  const selectedOrigin = useMemo(() => {
    if (!selected?.route?.originLat || !selected?.route?.originLng) return undefined;
    return { lat: selected.route.originLat, lng: selected.route.originLng, name: selected.route.origin || 'Origin' };
  }, [selected]);

  const selectedDest = useMemo(() => {
    if (!selected?.route?.destinationLat || !selected?.route?.destinationLng) return undefined;
    return { lat: selected.route.destinationLat, lng: selected.route.destinationLng, name: selected.route.destination || 'Destination' };
  }, [selected]);

  const center = shuttles[0]?.position || (selected?.route?.originLat && selected?.route?.originLng ? [selected.route.originLat, selected.route.originLng] as [number, number] : [40.7128, -74.006]);

  const mapShuttlePosition = selected?._lat && selected?._lng
    ? [selected._lat, selected._lng] as [number, number]
    : (shuttles[0]?.position as [number, number] | undefined);

  const isLocated = (t: any) => t._lat && t._lng;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Active Shuttles</h1>
        <p className="text-muted-foreground">Real-time monitoring of all active shuttles</p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[460px]">
          <TrackingMap
            center={center}
            shuttles={shuttles}
            shuttlePosition={mapShuttlePosition}
            origin={selectedOrigin}
            destination={selectedDest}
            routePath={selectedRoutePath}
            height="100%"
            zoom={12}
          />
        </div>
        {selected?.currentLat && selected?.currentLng && (
          <div className="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5" />
            <span className="font-medium">{selected.vehicle?.busNumber || selected.route?.name || 'Shuttle'}</span>
            <span className="font-mono">{Number(selected.currentLat).toFixed(6)}, {Number(selected.currentLng).toFixed(6)}</span>
            {selected.currentSpeed ? <span>· {Math.round(selected.currentSpeed)} km/h</span> : null}
            {selected.estimatedArrival ? <span>· ETA {formatTime(selected.estimatedArrival)}</span> : null}
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locatedTrips.map((trip: any) => (
          <Card
            key={trip.id}
            className={`transition-all cursor-pointer hover:shadow-md ${selectedId === trip.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedId(trip.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{trip.vehicle?.busNumber || 'N/A'}</span>
                </div>
                <Badge className={getStatusColor(trip.status)}>{trip.status ? trip.status.replace('_', ' ') : ''}</Badge>
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
                {trip.currentSpeed ? (
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">{Math.round(trip.currentSpeed)} km/h</span>
                  </div>
                ) : null}
              </div>

              <div className={`mt-3 rounded-lg p-2 text-xs ${isLocated(trip) ? 'bg-muted text-muted-foreground' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>
                {isLocated(trip) ? (
                  <span className="flex items-center gap-1">
                    <Crosshair className="h-3 w-3" />
                    <span className="font-mono">{Number(trip._lat).toFixed(6)}, {Number(trip._lng).toFixed(6)}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    No live GPS — showing route start
                  </span>
                )}
              </div>
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