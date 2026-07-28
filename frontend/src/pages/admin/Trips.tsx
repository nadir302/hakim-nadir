import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, driversApi, vehiclesApi, routesApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import { getStatusColor, formatDate, formatTime } from '@/lib/utils';
import { tripSchema, TripFormData } from '@/lib/validation';
import { Plus, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTrips() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({ resolver: zodResolver(tripSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['trips', page],
    queryFn: () => tripsApi.getAll({ page, limit: 10 }).then(r => r.data),
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers-list'],
    queryFn: () => driversApi.getAll({ limit: 100 }).then(r => r.data?.data || []),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: () => vehiclesApi.getAll({ limit: 100 }).then(r => r.data?.data || []),
  });

  const { data: routesData } = useQuery({
    queryKey: ['routes-list'],
    queryFn: () => routesApi.getAll({ limit: 100 }).then(r => r.data?.data || []),
  });

  const drivers = Array.isArray(driversData) ? driversData : [];
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  const routes = Array.isArray(routesData) ? routesData : [];

  const createMutation = useMutation({
    mutationFn: (d: TripFormData) => tripsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); toast.success('Trip created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create trip'),
  });

  const openCreate = () => { form.reset(); setModalOpen(true); };

  const onSubmit = async (data: TripFormData) => {
    createMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Trip', render: (t: any) => (
      <div><p className="font-medium">{t.name || `Trip #${t.id.slice(0, 8)}`}</p><p className="text-xs text-muted-foreground">{t.route?.name}</p></div>
    )},
    { key: 'driver', header: 'Driver', render: (t: any) => t.driver?.user ? `${t.driver.user.firstName} ${t.driver.user.lastName}` : '-' },
    { key: 'vehicle', header: 'Vehicle', render: (t: any) => t.vehicle?.busNumber || '-' },
    { key: 'departure', header: 'Departure', render: (t: any) => `${formatDate(t.date)} ${formatTime(t.departureTime)}` },
    { key: 'passengers', header: 'Passengers', render: (t: any) => t._count?.reservations || 0 },
    { key: 'status', header: 'Status', render: (t: any) => <Badge className={getStatusColor(t.status)}>{t.status.replace('_', ' ')}</Badge> },
    { key: 'actions', header: '', render: (t: any) => t.status === 'COMPLETED' ? (
      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/trips/replay/${t.id}`)}>
        <History className="h-4 w-4 mr-1" /> Replay
      </Button>
    ) : null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Trips</h1>
          <p className="text-muted-foreground">Manage shuttle trips</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Trip</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} loading={isLoading} />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title="Create Trip"
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending} submitLabel="Create">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Trip Name (optional)</Label><Input {...form.register('name')} placeholder="e.g. Morning Shuttle" /></div>
          <div><Label>Date</Label><Input type="date" {...form.register('date')} />{form.formState.errors.date && <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>}</div>
          <div><Label>Departure Time</Label><Input type="time" {...form.register('departureTime')} />{form.formState.errors.departureTime && <p className="text-sm text-red-500">{form.formState.errors.departureTime.message}</p>}</div>
          <div><Label>Driver</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...form.register('driverId')}>{form.formState.errors.driverId && <p className="text-sm text-red-500">{form.formState.errors.driverId.message}</p>}<option value="">Select driver</option>{drivers.map((d: any) => <option key={d.id} value={d.id}>{d.user?.firstName} {d.user?.lastName}</option>)}</select></div>
          <div><Label>Vehicle</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...form.register('vehicleId')}><option value="">Select vehicle</option>{vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.busNumber} ({v.plateNumber})</option>)}</select></div>
          <div className="sm:col-span-2"><Label>Route</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...form.register('routeId')}><option value="">Select route</option>{routes.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.origin} → {r.destination})</option>)}</select></div>
          <div className="sm:col-span-2"><Label>Notes (optional)</Label><Input {...form.register('notes')} placeholder="Any special instructions" /></div>
        </div>
      </EntityModal>
    </div>
  );
}
