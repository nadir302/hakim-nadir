import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reservationsApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import QRCode from 'qrcode';
import { Calendar, MapPin, Bus, XCircle, Ticket, Users, Clock, AlertTriangle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

function SafeQRCode({ value, size }: { value: string; size: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(undefined);
  const [qrError, setQrError] = useState(false);
  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(value, { width: size, errorCorrectionLevel: 'L', margin: 1 })
      .then((url: string) => { if (mounted) setQrDataUrl(url); })
      .catch(() => { if (mounted) setQrError(true); });
    return () => { mounted = false; };
  }, [value, size]);
  if (!qrDataUrl && !qrError) return <div className="h-[60px] w-[60px] animate-pulse rounded bg-muted" />;
  if (qrError) return <div className="flex h-[60px] w-[60px] items-center justify-center rounded bg-muted p-0.5"><span className="text-[10px] leading-tight text-muted-foreground">{value.slice(-8)}</span></div>;
  return <img src={qrDataUrl} width={size} height={size} alt="QR" className="rounded" />;
}

const reservationStatusStyle = (status: string) => {
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (status === 'CONFIRMED') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'CHECKED_IN') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (status === 'BOARDED') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (status === 'COMPLETED') return 'bg-gray-100 text-gray-500 border-gray-200';
  if (status === 'CANCELLED' || status === 'NO_SHOW') return 'bg-red-100 text-red-800 border-red-200';
  if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const reservationStatusLabel = (status: string) => {
  if (status === 'PENDING') return 'Pending';
  if (status === 'CONFIRMED') return 'Confirmed';
  if (status === 'CHECKED_IN') return 'Checked In';
  if (status === 'BOARDED') return 'Boarded';
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'NO_SHOW') return 'No Show';
  return status;
};

export default function MyTickets() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: myReservations, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationsApi.getMyReservations().then(r => r.data),
    refetchInterval: 15000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Reservation cancelled');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  const reservations = Array.isArray(myReservations) ? myReservations : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Tickets</h1>
        <p className="text-muted-foreground">Your reservations and QR codes</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Ticket className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">No reservations yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((r: any) => (
            <Card
              key={r.id}
              className={`${r.status === 'CANCELLED' ? 'opacity-60' : ''} ${r.trip?.id ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
              onClick={() => {
                if (r.trip?.id) navigate(`/participant/track/${r.trip.id}`);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{r.event?.name}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${reservationStatusStyle(r.status)}`}>
                        {reservationStatusLabel(r.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(r.date)}</span>
                      {r.pickupTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(r.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.passengerCount || 1} pax</span>
                      {r.optimizedPickup && <span className="flex items-center gap-1 text-green-600"><MapPin className="h-3 w-3" /> Shared pickup</span>}
                    </div>
                    {r.trip?.vehicle && (
                      <div className="flex items-center gap-2 text-xs">
                        <Bus className="h-3 w-3 text-muted-foreground" />
                        <span>{r.trip.vehicle.busNumber}</span>
                        {r.trip._count?.reservations !== undefined && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {r.trip._count.reservations} on board
                          </Badge>
                        )}
                      </div>
                    )}
                    {r.trip?.id && r.status !== 'CANCELLED' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Navigation className="h-3 w-3" /> Track bus
                      </div>
                    )}
                    {r.waitingListEntry?.status === 'PENDING' && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Waiting list — will be confirmed when a seat opens
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {r.qrCode && r.status !== 'CANCELLED' && (
                      <div className="rounded bg-white p-0.5" title="Scan for check-in">
                        <SafeQRCode value={r.qrCode} size={48} />
                      </div>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">{r.reservationCode}</span>
                    {['PENDING', 'CONFIRMED'].includes(r.status) && (
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] text-red-600 px-1"
                        onClick={(e) => { e.stopPropagation(); cancelMutation.mutate(r.id); }}>
                        <XCircle className="mr-0.5 h-3 w-3" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
