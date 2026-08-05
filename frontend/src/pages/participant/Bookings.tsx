import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, reservationsApi, pickupPointsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, Clock, Navigation, CheckCircle2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

type Step = 'select-event' | 'select-pickup' | 'review-matches' | 'complete';

export default function ParticipantBookings() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('select-event');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [searching, setSearching] = useState('');
  const [notes, setNotes] = useState('');

  const { data: events } = useQuery({
    queryKey: ['events-list'],
    queryFn: () => eventsApi.getAll({ limit: 50 }).then(r => r.data),
  });

  const { data: myReservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationsApi.getMyReservations().then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: pickupPoints } = useQuery({
    queryKey: ['pickup-points', selectedEvent],
    queryFn: () => pickupPointsApi.getAll({ eventId: selectedEvent! }).then(r => r.data),
    enabled: !!selectedEvent,
  });

  const bookedEventIds = new Set(
    (Array.isArray(myReservations) ? myReservations : [])
      .filter((r: any) => !['CANCELLED', 'NO_SHOW'].includes(r.status))
      .map((r: any) => r.event?.id)
  );

  const bookMutation = useMutation({
    mutationFn: (data: any) => reservationsApi.create(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Reservation created!');
      handleMatching(res.data);
      setStep('review-matches');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Booking failed'),
  });

  const joinTripMutation = useMutation({
    mutationFn: ({ reservationId, tripId }: { reservationId: string; tripId: string }) =>
      reservationsApi.joinTrip(reservationId, tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Joined existing shuttle!');
      setShowMatches(false);
      setStep('select-event');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to join trip'),
  });

  const handleMatching = useCallback(async (reservation: any) => {
    if (!pickupLat || !pickupLng || !pickupTime) return;
    try {
      setSearching('Looking for shuttle matches...');
      const res = await reservationsApi.findMatches({
        eventId: selectedEvent,
        lat: pickupLat,
        lng: pickupLng,
        pickupTime,
        passengerCount,
        excludeReservationId: reservation?.id,
      });
      if (res.data?.matches?.length > 0) {
        setMatches(res.data.matches);
        setShowMatches(true);
        setSearching('');
      } else {
        setSearching('No matching shuttles found. You will create a new one.');
        setTimeout(() => { setSearching(''); setStep('select-event'); resetForm(); }, 2500);
      }
    } catch {
      setSearching('');
    }
  }, [pickupLat, pickupLng, pickupTime, passengerCount, selectedEvent]);

  const handleBook = async () => {
    if (!selectedEvent) { toast.error('Select an event'); return; }
    if (!pickupLat || !pickupLng) { toast.error('Select your pickup location on the map'); return; }
    if (!pickupTime) { toast.error('Select your preferred pickup time'); return; }

    const pickupDateObj = new Date(pickupTime);
    const dateStr = pickupDateObj.toISOString().split('T')[0];
    const timeStr = pickupDateObj.toTimeString().slice(0, 5);
    bookMutation.mutate({
      eventId: selectedEvent,
      date: dateStr,
      time: timeStr,
      passengerCount,
      contactPhone,
      pickupLatitude: pickupLat,
      pickupLongitude: pickupLng,
      pickupAddress,
      pickupTime: new Date(pickupTime).toISOString(),
      notes,
      skipMatching: false,
    });
  };

  const handleJoinTrip = (reservationId: string, tripId: string) => {
    joinTripMutation.mutate({ reservationId, tripId });
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setPickupLat(null);
    setPickupLng(null);
    setPickupAddress('');
    setPickupTime('');
    setPassengerCount(1);
    setNotes('');
    setShowMatches(false);
    setMatches([]);
  };

  const handleSelectEvent = (event: any) => {
    if (bookedEventIds.has(event.id)) return;
    setSelectedEvent(event.id);
    setStep('select-pickup');
  };

  const handleMapClick = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupLat(pos.coords.latitude);
        setPickupLng(pos.coords.longitude);
        setPickupAddress(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        toast.success('Location detected');
      },
      () => toast.error('Could not get location. Enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Smart Reservations</h1>
        <p className="text-muted-foreground">Reserve your shuttle and get matched with others</p>
      </div>

      {/* Smart Matching Suggestions Modal */}
      {showMatches && matches.length > 0 && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              Shuttle Matches Found!
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We found existing shuttles near your pickup location. Join one to share the ride!
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.map((match: any, idx: number) => (
              <Card key={match.matchId} className="border-l-4 border-l-primary">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="text-xs">Match #{idx + 1}</Badge>
                      <span className="text-sm font-medium">{match.existingParticipant.firstName}'s Shuttle</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {(match.distance * 1000).toFixed(0)}m away</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {match.occupiedSeats}/{match.totalCapacity} seats</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(match.departureTime).toLocaleTimeString()}</span>
                      {match.remainingSeats > 0 && (
                        <Badge variant="success" className="text-xs">
                          {match.remainingSeats} seat{match.remainingSeats > 1 ? 's' : ''} left
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleJoinTrip(match.existingReservationId, match.tripId)}
                      disabled={joinTripMutation.isPending}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Join Shuttle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => { setShowMatches(false); setStep('select-event'); resetForm(); }}
              >
                Skip — I'll wait for my own shuttle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Searching indicator */}
      {searching && (
        <Card className="border-primary/20">
          <CardContent className="flex items-center justify-center gap-3 py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{searching}</span>
          </CardContent>
        </Card>
      )}

      {/* Book New reservation form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {step === 'select-event' ? 'Book a Shuttle' : step === 'select-pickup' ? 'Set Your Pickup' : 'Complete'}
        </h2>

        {step === 'select-event' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {events?.data?.filter((e: any) => e.status === 'PUBLISHED' || e.status === 'ONGOING').map((event: any) => {
              const alreadyBooked = bookedEventIds.has(event.id);
              return (
                <Card key={event.id}
                  className={`transition-all hover:shadow-md ${alreadyBooked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selectedEvent === event.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleSelectEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{event.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" /> {formatDate(event.date)}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" /> {event.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Capacity: {event.capacity} seats
                        </p>
                      </div>
                      {alreadyBooked && <Badge variant="secondary" className="shrink-0 ml-2">Booked</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {(!events?.data || events.data.length === 0) && (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>No events available for booking.</p>
              </div>
            )}
          </div>
        )}

        {step === 'select-pickup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleMapClick}>
                  <Navigation className="mr-2 h-4 w-4" /> Use My Current Location
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Latitude</Label>
                    <Input type="number" step="any" placeholder="48.8566"
                      value={pickupLat ?? ''}
                      onChange={(e) => setPickupLat(e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input type="number" step="any" placeholder="2.3522"
                      value={pickupLng ?? ''}
                      onChange={(e) => setPickupLng(e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                </div>
                <div>
                  <Label>Address (optional)</Label>
                  <Input placeholder="123 Main St, City"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Number of Passengers</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button variant="outline" size="sm"
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      disabled={passengerCount <= 1}>-</Button>
                    <span className="w-12 text-center font-semibold text-lg">{passengerCount}</span>
                    <Button variant="outline" size="sm"
                      onClick={() => setPassengerCount(Math.min(20, passengerCount + 1))}
                      disabled={passengerCount >= 20}>+</Button>
                  </div>
                </div>
                <div>
                  <Label>Preferred Pickup Time</Label>
                  <Input type="datetime-local" className="mt-1"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)} />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input type="tel" placeholder="+212 6XX XXX XXX" className="mt-1"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Special Notes (optional)</Label>
                  <Input placeholder="Any special requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('select-event')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleBook} disabled={bookMutation.isPending}>
                {bookMutation.isPending ? 'Reserving...' : 'Reserve Shuttle'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}