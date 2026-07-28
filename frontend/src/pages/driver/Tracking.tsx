import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripsApi, trackingApi } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor, formatTime } from '@/lib/utils';
import TrackingMap from '@/components/maps/TrackingMap';
import { MapPoint } from '@/services/googleMaps';
import { Play, Square, Navigation, Gauge, Timer, Users, MapPin, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export default function DriverTracking() {
  const navigate = useNavigate();
  const { subscribe, joinTrip, leaveTrip } = useSocket();
  const [gpsStatus, setGpsStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
  const [currentPos, setCurrentPos] = useState<[number, number] | undefined>();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: trip, refetch } = useQuery({
    queryKey: ['driver-current-trip'],
    queryFn: () => trackingApi.getDriverCurrentTrip().then(r => r.data),
    refetchInterval: 10000,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TripStatus }) => {
      await trackingApi.changeTripStatus(id, status);
    },
    onSuccess: () => { refetch(); toast.success('Status updated'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const sendLocation = useCallback(async (lat: number, lng: number, speed: number, heading: number) => {
    if (!trip?.id) return;
    try {
      const res = await trackingApi.updateLocation(trip.id, { lat, lng, speed: Math.round(speed * 3.6), heading });
      if (res.data?.eta) setEta(formatTime(res.data.eta));
      if (res.data?.distance !== undefined) setDistance(res.data.distance);
      if (res.data?.progress !== undefined) setProgress(res.data.progress);
    } catch {}
  }, [trip?.id]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const speed = position.coords.speed || 0;
        const heading = position.coords.heading || 0;

        setCurrentPos([lat, lng]);
        setCurrentSpeed(speed);
        setCurrentHeading(heading);
        setGpsStatus('active');

        await sendLocation(lat, lng, speed, heading);
      },
      () => { setGpsStatus('error'); toast.error('GPS signal lost'); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    gpsIntervalRef.current = setInterval(() => {
      refetch();
    }, 30000);
  }, [sendLocation, refetch]);

  const stopGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    setGpsStatus('inactive');
    setCurrentPos(undefined);
    setCurrentSpeed(0);
  };

  const stopGpsRef = useRef(stopGps);
  stopGpsRef.current = stopGps;

  useEffect(() => {
    if (!trip?.id) return;
    joinTrip(trip.id);
    const unsub = subscribe(`trip:${trip.id}`, 'location-update', (payload: any) => {
      if (payload.estimatedArrival) setEta(formatTime(payload.estimatedArrival));
      if (payload.remainingDistance !== undefined) setDistance(payload.remainingDistance);
      if (payload.progress !== undefined) setProgress(payload.progress);
    });
    return () => { leaveTrip(trip.id); unsub(); };
  }, [trip?.id, subscribe, joinTrip, leaveTrip]);

  useEffect(() => {
    return () => { stopGpsRef.current(); };
  }, []);

  const getStatusOptions = (currentStatus: string) => {
    const transitions: Record<string, { label: string; status: TripStatus; icon: any }[]> = {
      SCHEDULED: [{ label: 'Start Trip', status: 'IN_PROGRESS', icon: Play }],
      IN_PROGRESS: [
        { label: 'Mark Delayed', status: 'DELAYED', icon: AlertTriangle },
        { label: 'Complete Trip', status: 'COMPLETED', icon: CheckCircle2 },
      ],
      DELAYED: [
        { label: 'Resume Trip', status: 'IN_PROGRESS', icon: Play },
        { label: 'Complete Trip', status: 'COMPLETED', icon: CheckCircle2 },
      ],
    };
    return transitions[currentStatus] || [];
  };

  const routePoints: [number, number][] = [];
  if (trip?.route?.originLat && trip?.route?.originLng) routePoints.push([trip.route.originLat, trip.route.originLng]);
  trip?.route?.stops?.forEach((s: any) => routePoints.push([s.latitude, s.longitude]));
  if (trip?.route?.destinationLat && trip?.route?.destinationLng) routePoints.push([trip.route.destinationLat, trip.route.destinationLng]);

  const stopPoints: MapPoint[] = trip?.route?.stops?.map((s: any) => ({ lat: s.latitude, lng: s.longitude, name: s.name })) || [];
  const originPoint = trip?.route ? { lat: trip.route.originLat || 0, lng: trip.route.originLng || 0, name: trip.route.origin } : undefined;
  const destPoint = trip?.route ? { lat: trip.route.destinationLat || 0, lng: trip.route.destinationLng || 0, name: trip.route.destination } : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">GPS Tracking</h1>
          <p className="text-muted-foreground">Share your live location</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/driver/scan-qr')}>
            <QrCode className="mr-1 h-4 w-4" /> Scan QR
          </Button>
          <Badge variant={gpsStatus === 'active' ? 'success' : gpsStatus === 'error' ? 'destructive' : 'secondary'}>
            {gpsStatus === 'active' ? 'GPS Active' : gpsStatus === 'error' ? 'GPS Error' : 'GPS Off'}
          </Badge>
          {gpsStatus === 'inactive' ? (
            <Button onClick={startGps} size="sm"><Navigation className="mr-1 h-4 w-4" /> Start GPS</Button>
          ) : (
            <Button onClick={stopGps} variant="destructive" size="sm"><Square className="mr-1 h-4 w-4" /> Stop GPS</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <TrackingMap
              shuttlePosition={currentPos}
              shuttleHeading={currentHeading}
              origin={originPoint}
              destination={destPoint}
              stops={stopPoints}
              routePath={routePoints}
              height="500px"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Trip Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(trip?.status || 'SCHEDULED')}>
                  {(trip?.status || 'SCHEDULED').replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="text-right font-medium">{trip?.route?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium">{trip?.vehicle?.busNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">{trip?._count?.reservations || 0}</span>
              </div>
            </CardContent>
          </Card>

          {gpsStatus === 'active' && (
            <Card>
              <CardHeader><CardTitle>Live Data</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Gauge className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{(currentSpeed * 3.6).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">km/h</p>
                  </div>
                </div>
                {distance !== null && (
                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="text-2xl font-bold">{distance.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">km remaining</p>
                    </div>
                  </div>
                )}
                {eta && (
                  <div className="flex items-center gap-4">
                    <Timer className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="text-2xl font-bold">{eta}</p>
                      <p className="text-xs text-muted-foreground">Estimated arrival</p>
                    </div>
                  </div>
                )}
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {currentPos && (
                  <div className="text-xs text-muted-foreground">
                    {currentPos[0].toFixed(6)}, {currentPos[1].toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {getStatusOptions(trip?.status || 'SCHEDULED').map((action) => (
                <Button
                  key={action.label}
                  className="w-full"
                  variant={action.status === 'COMPLETED' ? 'default' : 'outline'}
                  onClick={() => trip?.id && statusMutation.mutate({ id: trip.id, status: action.status })}
                  disabled={statusMutation.isPending}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
