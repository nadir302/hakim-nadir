import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatDate, formatTime } from '@/lib/utils';
import TrackingMap from '@/components/maps/TrackingMap';
import { MapPoint } from '@/services/googleMaps';
import { useEffect, useState } from 'react';
import { Navigation, Gauge, Timer, Bus, MapPin, Clock, CheckCircle2, Radio, Users, ChevronRight } from 'lucide-react';

const STATUS_SEQUENCE = [
  { status: 'SCHEDULED', label: 'Scheduled', icon: Clock },
  { status: 'APPROACHING', label: 'On the Way', icon: Navigation },
  { status: 'NEAR_500M', label: '500m Away', icon: Radio },
  { status: 'NEAR_200M', label: '200m Away', icon: Radio },
  { status: 'ARRIVED', label: 'Arrived', icon: MapPin },
  { status: 'BOARDING', label: 'Boarding', icon: Users },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: Bus },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

export default function ParticipantTrack() {
  const { tripId } = useParams();
  const socketRef = useSocket();
  const [livePos, setLivePos] = useState<[number, number] | undefined>();
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [liveEta, setLiveEta] = useState<string | null>(null);
  const [liveDistance, setLiveDistance] = useState<number | null>(null);
  const [liveProgress, setLiveProgress] = useState(0);
  const [tripStatus, setTripStatus] = useState<string>('SCHEDULED');
  const [statusLabel, setStatusLabel] = useState('Waiting');
  const [proximityStage, setProximityStage] = useState<string | null>(null);
  const [lastNotif, setLastNotif] = useState<string | null>(null);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getById(tripId!).then(r => r.data),
    enabled: !!tripId,
  });

  useEffect(() => {
    if (trip?.status) setTripStatus(trip.status);
    if (trip?.currentLat && trip?.currentLng) setLivePos([trip.currentLat, trip.currentLng]);
  }, [trip]);

  useEffect(() => {
    if (!socketRef.current || !tripId) return;

    socketRef.current.emit('subscribe-shuttle', tripId);

    const handleLocation = (data: any) => {
      if (data.tripId === tripId && data.lat && data.lng) {
        setLivePos([data.lat, data.lng]);
        if (data.speed) setLiveSpeed(data.speed);
        if (data.estimatedArrival) setLiveEta(formatTime(data.estimatedArrival));
        if (data.remainingDistance !== undefined) setLiveDistance(data.remainingDistance);
        if (data.progress !== undefined) setLiveProgress(data.progress);
      }
    };

    const handleStatus = (data: any) => {
      if (data.tripId === tripId) {
        setTripStatus(data.status);
        setStatusLabel(data.label || data.status.replace('_', ' '));
      }
    };

    const handleProximity = (data: any) => {
      if (data.tripId === tripId) {
        setProximityStage(data.stage);
        if (data.stage === 'approaching') {
          setLastNotif('Shuttle is 500m away');
          setTimeout(() => setLastNotif(null), 5000);
        } else if (data.stage === 'very-close') {
          setLastNotif('Shuttle is almost here!');
          setTimeout(() => setLastNotif(null), 5000);
        } else if (data.stage === 'arrived') {
          setLastNotif('Shuttle has arrived!');
        }
      }
    };

    socketRef.current.on('location-update', handleLocation);
    socketRef.current.on('trip-status-changed', handleStatus);
    socketRef.current.on('shuttle-near', handleProximity);

    return () => {
      socketRef.current?.emit('unsubscribe-shuttle', tripId);
      socketRef.current?.off('location-update', handleLocation);
      socketRef.current?.off('trip-status-changed', handleStatus);
      socketRef.current?.off('shuttle-near', handleProximity);
    };
  }, [socketRef, tripId]);

  const StatusIcon = STATUS_SEQUENCE.find(s => s.status === tripStatus)?.icon || Clock;
  const progress = trip?.tripProgress !== undefined ? Math.round(trip.tripProgress) : liveProgress;
  const speed = trip?.currentSpeed || liveSpeed;
  const eta = liveEta || (trip?.estimatedArrival ? formatTime(trip.estimatedArrival) : null);
  const distance = liveDistance;

  const stopPoints: MapPoint[] = trip?.route?.stops?.map((s: any) => ({
    lat: s.latitude, lng: s.longitude, name: s.name,
  })) || [];

  const originPoint = trip?.route ? {
    lat: trip.route.originLat || 0,
    lng: trip.route.originLng || 0,
    name: trip.route.origin,
  } : undefined;

  const destPoint = trip?.route ? {
    lat: trip.route.destinationLat || 0,
    lng: trip.route.destinationLng || 0,
    name: trip.route.destination,
  } : undefined;

  const routePoints: [number, number][] = [];
  if (originPoint) routePoints.push([originPoint.lat, originPoint.lng]);
  stopPoints.forEach((s) => routePoints.push([s.lat, s.lng]));
  if (destPoint) routePoints.push([destPoint.lat, destPoint.lng]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Live Tracking</h1>
          <p className="text-muted-foreground">Real-time shuttle location</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(tripStatus)} self-start px-4 py-1.5 text-sm`}>
            <StatusIcon className="mr-1.5 h-4 w-4" />
            {statusLabel || tripStatus.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Proximity alert toast */}
      {lastNotif && (
        <Card className="border-2 border-primary/30 bg-primary/5 animate-in slide-in-from-top-2">
          <CardContent className="flex items-center gap-3 py-3">
            <Radio className="h-5 w-5 text-primary animate-pulse shrink-0" />
            <p className="text-sm font-medium">{lastNotif}</p>
          </CardContent>
        </Card>
      )}

      {/* Trip status sequence */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between overflow-x-auto gap-1">
            {STATUS_SEQUENCE.map((step, idx) => {
              const currentIdx = STATUS_SEQUENCE.findIndex(s => s.status === tripStatus);
              const isActive = idx <= currentIdx || (
                tripStatus === 'IN_PROGRESS' && idx <= STATUS_SEQUENCE.findIndex(s => s.status === 'IN_TRANSIT')
              );
              const StepIcon = step.icon;
              return (
                <div key={step.status} className="flex items-center gap-1 shrink-0">
                  <div className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                      <StepIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[9px] whitespace-nowrap">{step.label}</span>
                  </div>
                  {idx < STATUS_SEQUENCE.length - 1 && (
                    <ChevronRight className={`h-3 w-3 ${isActive ? 'text-primary/40' : 'text-muted-foreground/20'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <TrackingMap
              shuttlePosition={livePos}
              origin={originPoint}
              destination={destPoint}
              stops={stopPoints}
              routePath={routePoints}
              height="480px"
              zoom={13}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="text-right font-medium">{trip?.route?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium">{trip?.vehicle?.busNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver</span>
                <span className="font-medium">{trip?.driver?.user?.firstName} {trip?.driver?.user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure</span>
                <span className="font-medium">{trip?.departureTime ? formatTime(trip.departureTime) : '-'}</span>
              </div>
              {trip?.reservations && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-medium">{trip.reservations.length} on board</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Live Updates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-primary/5 p-3 text-center">
                  <Gauge className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xl font-bold">{speed ? `${Math.round(speed)}` : '--'}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-3 text-center">
                  <Timer className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xl font-bold">{eta || '--:--'}</p>
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
              </div>

              {distance !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distance remaining</span>
                  <span className="font-medium">{distance.toFixed(1)} km</span>
                </div>
              )}

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Trip Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {proximityStage && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs">
                  <Radio className={`h-3 w-3 ${proximityStage === 'arrived' ? 'text-green-500' : 'text-primary animate-pulse'}`} />
                  <span>
                    {proximityStage === 'approaching' ? 'Shuttle is 500m away' :
                     proximityStage === 'very-close' ? 'Shuttle is very close (200m)' :
                     proximityStage === 'arrived' ? 'Shuttle has arrived!' : 'Tracking...'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {trip?.route?.stops && trip.route.stops.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Route</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                    <span className="text-sm">{trip.route.origin}</span>
                  </div>
                  {trip.route.stops.map((stop: any) => (
                    <div key={stop.id} className="ml-1 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full border-2 border-primary shrink-0" />
                      <span className="text-sm">{stop.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
                    <span className="text-sm">{trip.route.destination}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
