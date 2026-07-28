import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor, formatDate, formatTime } from '@/lib/utils';
import TrackingMap from '@/components/maps/TrackingMap';
import { Play, Pause, Square, RotateCcw, ChevronLeft, Clock, Gauge, MapPin, Navigation, TrendingUp } from 'lucide-react';

type ReplayPoint = {
  id: string; latitude: number; longitude: number;
  speed: number | null; heading: number | null; timestamp: string;
};

type TripInfo = {
  id: string; name?: string; date: string; status: string;
  tripProgress: number; estimatedArrival?: string;
  route: { id: string; name: string; origin: string; destination: string;
    originLat?: number; originLng?: number; destinationLat?: number; destinationLng?: number;
    stops: { id: string; name: string; latitude: number; longitude: number; order: number }[];
  };
  driver: { user: { firstName: string; lastName: string } };
  vehicle: { busNumber: string; plateNumber: string };
};

export default function AdminReplayTrip() {
  const { tripId } = useParams<{ tripId: string }>();
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const animRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['replay', tripId],
    queryFn: () => trackingApi.replayTrip(tripId!).then(r => r.data),
    enabled: !!tripId,
  });

  const trip = raw as TripInfo | undefined;
  const points: ReplayPoint[] = (raw as any)?.trackingLogs || [];
  const sorted = points.slice().sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const startTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : 0;
  const totalDuration = sorted.length > 1
    ? new Date(sorted[sorted.length - 1].timestamp).getTime() - startTime
    : 0;

  const currentPoint = sorted[currentIdx];

  const traveledPath: [number, number][] = sorted.slice(0, currentIdx + 1).map(p => [p.latitude, p.longitude]);
  const remainingPath: [number, number][] = sorted.slice(currentIdx).map(p => [p.latitude, p.longitude]);

  const origin = trip?.route?.originLat && trip?.route?.originLng
    ? { lat: trip.route.originLat, lng: trip.route.originLng, name: trip.route.origin } : undefined;
  const destination = trip?.route?.destinationLat && trip?.route?.destinationLng
    ? { lat: trip.route.destinationLat, lng: trip.route.destinationLng, name: trip.route.destination } : undefined;
  const stops = (trip?.route?.stops || []).map(s => ({ lat: s.latitude, lng: s.longitude, name: s.name }));

  const play = useCallback(() => {
    if (currentIdx >= sorted.length - 1) { setCurrentIdx(0); }
    setPlaying(true);
  }, [currentIdx, sorted.length]);

  const pause = () => setPlaying(false);

  const stop = () => { setPlaying(false); setCurrentIdx(0); };

  const restart = () => { setCurrentIdx(0); setPlaying(true); };

  useEffect(() => {
    if (!playing || sorted.length < 2) return;

    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      const stepMs = speed;
      const totalMs = totalDuration;
      const pointsToAdvance = (elapsed / 16) * (totalMs / sorted.length) * (speed / 2);

      setCurrentIdx(prev => {
        const next = prev + Math.max(1, Math.round(pointsToAdvance));
        if (next >= sorted.length - 1) { setPlaying(false); return sorted.length - 1; }
        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, sorted, totalDuration, speed]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    setCurrentIdx(idx);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-8 bg-muted rounded animate-pulse" />
        <div className="h-[500px] bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/trips" className="rounded-lg p-2 hover:bg-accent">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Trip Replay</h1>
            <p className="text-muted-foreground">{trip?.name || tripId?.slice(0, 8)}</p>
          </div>
        </div>
        <Badge className={getStatusColor(trip?.status || '')}>{trip?.status?.replace('_', ' ')}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative h-[500px]">
              <TrackingMap
                shuttlePosition={currentPoint ? [currentPoint.latitude, currentPoint.longitude] : undefined}
                shuttleHeading={currentPoint?.heading || undefined}
                origin={origin}
                destination={destination}
                stops={stops}
                routePath={traveledPath}
                height="100%"
              />
            </div>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button variant={playing ? 'secondary' : 'default'} size="sm" onClick={playing ? pause : play}>
                    {playing ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                    {playing ? 'Pause' : 'Play'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={stop} disabled={currentIdx === 0}>
                    <Square className="mr-1 h-4 w-4" /> Stop
                  </Button>
                  <Button variant="outline" size="sm" onClick={restart}>
                    <RotateCcw className="mr-1 h-4 w-4" /> Restart
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Speed:</span>
                  {[0.5, 1, 2, 5, 10].map(s => (
                    <Button key={s} variant={speed === s ? 'default' : 'outline'} size="sm" onClick={() => setSpeed(s)}>
                      {s}x
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(sorted[0]?.timestamp || new Date().toISOString())}</span>
                  <span>{formatTime(sorted[sorted.length - 1]?.timestamp || new Date().toISOString())}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, sorted.length - 1)}
                  value={currentIdx}
                  onChange={handleSlider}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Start</span>
                  <span>Progress: {sorted.length > 0 ? Math.round((currentIdx / (sorted.length - 1)) * 100) : 0}%</span>
                  <span>End</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Trip Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />{formatDate(trip?.date || '')}</div>
              <div className="flex items-center gap-2"><Navigation className="h-4 w-4 shrink-0 text-muted-foreground" />{trip?.route?.name}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />{trip?.route?.origin} → {trip?.route?.destination}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-muted-foreground" />Driver: {trip?.driver?.user?.firstName} {trip?.driver?.user?.lastName}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-muted-foreground" />Vehicle: {trip?.vehicle?.busNumber} ({trip?.vehicle?.plateNumber})</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Live Data</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentPoint && (
                <>
                  <div>
                    <span className="text-muted-foreground">Time</span>
                    <p className="font-medium">{formatTime(currentPoint.timestamp)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates</span>
                    <p className="font-mono text-xs">{currentPoint.latitude.toFixed(6)}, {currentPoint.longitude.toFixed(6)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">{currentPoint.speed ? `${Math.round(currentPoint.speed)} km/h` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Heading:</span>
                    <span className="font-medium">{currentPoint.heading ? `${Math.round(currentPoint.heading)}°` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress</span>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{
                        width: `${sorted.length > 1 ? (currentIdx / (sorted.length - 1)) * 100 : 0}%`
                      }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {currentIdx + 1} / {sorted.length} points
                    </p>
                  </div>
                </>
              )}
              {!currentPoint && <p className="text-muted-foreground">No tracking data</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Statistics</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Points</span><span className="font-medium">{sorted.length.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">
                {totalDuration > 0 ? `${Math.round(totalDuration / 60000)} min` : 'N/A'}
              </span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg Speed</span><span className="font-medium">
                {sorted.filter(p => p.speed).length > 0
                  ? `${Math.round(sorted.filter(p => p.speed).reduce((a, p) => a + (p.speed || 0), 0) / sorted.filter(p => p.speed).length)} km/h`
                  : 'N/A'}
              </span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max Speed</span><span className="font-medium">
                {sorted.filter(p => p.speed).length > 0
                  ? `${Math.round(Math.max(...sorted.filter(p => p.speed).map(p => p.speed || 0)))} km/h`
                  : 'N/A'}
              </span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
