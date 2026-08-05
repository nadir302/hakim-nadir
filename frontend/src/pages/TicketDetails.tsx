import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Bus, MapPin, Clock, Calendar, User, Phone, FileText } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';
import SafeQRCode from '@/components/shared/SafeQRCode';

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CHECKED_IN: 'Embarqué',
  BOARDED: 'À bord',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  REJECTED: 'Rejeté',
  NO_SHOW: 'Absent',
};

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [showQR, setShowQR] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getTicket(id!).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!ticket) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
      <FileText className="h-12 w-12 mb-4 opacity-50" />
      <p>Billet introuvable.</p>
      <Button variant="link" asChild><Link to="/participant/tickets">Retour</Link></Button>
    </div>
  );

  const t = ticket;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Mon billet</h1>

      <Card>
        <CardHeader><CardTitle>Informations du billet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono font-medium">{t.reservationCode}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><Badge className={getStatusColor(t.status)}>{statusLabels[t.status] || t.status}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(t.date).toLocaleDateString('fr-FR')}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Heure</span><span>{new Date(t.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
          {t.passengerCount && <div className="flex justify-between"><span className="text-muted-foreground">Passagers</span><span>{t.passengerCount}</span></div>}
          {t.contactPhone && <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{t.contactPhone}</span></div>}
          {t.notes && <div><span className="text-muted-foreground text-sm">Notes</span><p className="text-sm">{t.notes}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Participant</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t.participant?.firstName} {t.participant?.lastName}</span></div>
          {t.participant?.email && <div className="text-sm text-muted-foreground">{t.participant.email}</div>}
          {t.participant?.phone && <div className="text-sm text-muted-foreground">{t.participant.phone}</div>}
        </CardContent>
      </Card>

      {t.event && (
        <Card>
          <CardHeader><CardTitle>Événement</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{t.event.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{new Date(t.event.date).toLocaleDateString('fr-FR')}</span></div>
            {t.event.startTime && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{t.event.startTime} - {t.event.endTime}</span></div>}
            {t.event.address && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{t.event.address}</span></div>}
          </CardContent>
        </Card>
      )}

      {t.trip && (
        <Card>
          <CardHeader><CardTitle>Navette</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2"><Bus className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t.trip.name || t.trip.vehicle?.busNumber || 'Navette'}</span></div>
            {t.trip.driver?.user && <div className="text-sm text-muted-foreground">Chauffeur: {t.trip.driver.user.firstName} {t.trip.driver.user.lastName}</div>}
            {t.trip.route && <div className="text-sm text-muted-foreground">{t.trip.route.origin} → {t.trip.route.destination}</div>}
            {t.trip.departureTime && <div className="text-sm text-muted-foreground">Départ: {new Date(t.trip.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Statut navette</span><Badge className={getStatusColor(t.trip.status)}>{t.trip.status}</Badge></div>
          </CardContent>
        </Card>
      )}

      {t.pickupPoint && (
        <Card>
          <CardHeader><CardTitle>Point de départ</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{t.pickupPoint.name}</p>
            {t.pickupPoint.address && <p className="text-sm text-muted-foreground">{t.pickupPoint.address}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>QR Code</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!showQR ? (
            <>
              <p className="text-sm text-muted-foreground">Scannez ce QR code pour afficher votre billet</p>
              <Button onClick={() => setShowQR(true)} className="gap-2"><QrCode className="h-4 w-4" /> Afficher QR Code</Button>
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg">
              <SafeQRCode value={t.qrCode} size={200} />
              <p className="text-center text-xs text-muted-foreground mt-2">{t.reservationCode}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}