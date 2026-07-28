import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi, eventsApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import AddressSearch from '@/components/shared/AddressSearch';
import LocationPicker from '@/components/shared/LocationPicker';
import StopsEditor from '@/components/shared/StopsEditor';
import { routeSchema, RouteFormData } from '@/lib/validation';
import { Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reverseGeocode } from '@/services/googleMaps';

export default function AdminRoutes() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const form = useForm<RouteFormData>({ resolver: zodResolver(routeSchema) });

  const { data: eventsData } = useQuery({ queryKey: ['events-list'], queryFn: () => eventsApi.getAll({ limit: 100 }).then(r => r.data) });
  const events = eventsData?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['routes', page, search],
    queryFn: () => routesApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: RouteFormData) => routesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routes'] }); toast.success('Route created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: RouteFormData) => routesApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routes'] }); toast.success('Route updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const openCreate = () => { setEditing(null); form.reset({ isActive: true, stops: [] } as any); setModalOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    form.reset({
      name: r.name, origin: r.origin, originLat: r.originLat || '', originLng: r.originLng || '',
      destination: r.destination, destinationLat: r.destinationLat || '', destinationLng: r.destinationLng || '',
      distance: r.distance || '', estimatedDuration: r.estimatedDuration || '',
      description: r.description || '', isActive: r.isActive, eventId: r.eventId,
      stops: r.stops?.map((s: any) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude, order: s.order })) || [],
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: RouteFormData) => {
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Route', render: (r: any) => (
      <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.origin} → {r.destination}</p></div>
    )},
    { key: 'distance', header: 'Distance', render: (r: any) => r.distance ? `${r.distance} km` : '-' },
    { key: 'duration', header: 'Duration', render: (r: any) => r.estimatedDuration ? `${r.estimatedDuration} min` : '-' },
    { key: 'stops', header: 'Stops', render: (r: any) => r.stops?.length || 0 },
    { key: 'status', header: 'Status', render: (r: any) => (
      <Badge variant={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'actions', header: '', render: (r: any) => <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Edit2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Routes</h1>
          <p className="text-muted-foreground">Manage shuttle routes</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Route</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search routes..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Route' : 'Create Route'}
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Update' : 'Create'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Name</Label><Input {...form.register('name')} />{form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}</div>
          <div className="sm:col-span-2"><Label>Event</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('eventId')}>
            <option value="">Select event...</option>{events.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>{form.formState.errors.eventId && <p className="text-sm text-red-500">{form.formState.errors.eventId.message}</p>}</div>
          <div className="sm:col-span-2">
            <Label>Origin</Label>
            <AddressSearch
              value={form.watch('origin') || ''}
              onChange={(v) => form.setValue('origin', v)}
              onSelect={(addr, lat, lng) => { form.setValue('origin', addr); form.setValue('originLat', lat); form.setValue('originLng', lng); }}
              placeholder="Search origin..."
              error={form.formState.errors.origin?.message as string}
            />
          </div>
          <input type="hidden" {...form.register('originLat')} />
          <input type="hidden" {...form.register('originLng')} />
          <div className="sm:col-span-2">
            <LocationPicker
              lat={Number(form.watch('originLat')) || 0}
              lng={Number(form.watch('originLng')) || 0}
              onMove={async (lat, lng) => {
                form.setValue('originLat', lat);
                form.setValue('originLng', lng);
                try { const addr = await reverseGeocode(lat, lng); form.setValue('origin', addr); } catch {}
              }}
              height="180px"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Destination</Label>
            <AddressSearch
              value={form.watch('destination') || ''}
              onChange={(v) => form.setValue('destination', v)}
              onSelect={(addr, lat, lng) => { form.setValue('destination', addr); form.setValue('destinationLat', lat); form.setValue('destinationLng', lng); }}
              placeholder="Search destination..."
              error={form.formState.errors.destination?.message as string}
            />
          </div>
          <input type="hidden" {...form.register('destinationLat')} />
          <input type="hidden" {...form.register('destinationLng')} />
          <div className="sm:col-span-2">
            <LocationPicker
              lat={Number(form.watch('destinationLat')) || 0}
              lng={Number(form.watch('destinationLng')) || 0}
              onMove={async (lat, lng) => {
                form.setValue('destinationLat', lat);
                form.setValue('destinationLng', lng);
                try { const addr = await reverseGeocode(lat, lng); form.setValue('destination', addr); } catch {}
              }}
              height="180px"
            />
          </div>
          <div><Label>Distance (km)</Label><Input type="number" step="any" {...form.register('distance')} /></div>
          <div><Label>Duration (min)</Label><Input type="number" {...form.register('estimatedDuration')} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea {...form.register('description')} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="isActive" {...form.register('isActive')} className="h-4 w-4 rounded border-gray-300" /><Label htmlFor="isActive">Active</Label></div>
          <StopsEditor form={form} />
        </div>
      </EntityModal>
    </div>
  );
}
