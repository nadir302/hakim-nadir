import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pickupPointsApi, eventsApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import AddressSearch from '@/components/shared/AddressSearch';
import LocationPicker from '@/components/shared/LocationPicker';
import { pickupPointSchema, PickupPointFormData } from '@/lib/validation';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reverseGeocode } from '@/services/googleMaps';

export default function AdminPickupPoints() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const form = useForm<PickupPointFormData>({ resolver: zodResolver(pickupPointSchema) });

  const { data: eventsData } = useQuery({ queryKey: ['events-list'], queryFn: () => eventsApi.getAll({ limit: 100 }).then(r => r.data) });
  const events = eventsData?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['pickup-points', page, search],
    queryFn: () => pickupPointsApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: PickupPointFormData) => pickupPointsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pickup-points'] }); toast.success('Pickup point created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: PickupPointFormData) => pickupPointsApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pickup-points'] }); toast.success('Pickup point updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pickupPointsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pickup-points'] }); toast.success('Deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const openCreate = () => { setEditing(null); form.reset({ maxCapacity: 50 } as any); setModalOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    form.reset({ name: p.name, latitude: p.latitude, longitude: p.longitude, address: p.address || '', maxCapacity: p.maxCapacity, eventId: p.eventId });
    setModalOpen(true);
  };
  const onSubmit = async (data: PickupPointFormData) => {
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Name', render: (p: any) => <span className="font-medium">{p.name}</span> },
    { key: 'address', header: 'Address', render: (p: any) => p.address || '-' },
    { key: 'capacity', header: 'Capacity', render: (p: any) => `${p.maxCapacity || '∞'}` },
    { key: 'coordinates', header: 'Coordinates', render: (p: any) => p.latitude && p.longitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : '-' },
    { key: 'actions', header: '', render: (p: any) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pickup Points</h1>
          <p className="text-muted-foreground">Manage pickup points</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Pickup Point</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search pickup points..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Pickup Point' : 'Add Pickup Point'}
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Update' : 'Create'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Name</Label><Input {...form.register('name')} />{form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}</div>
          <div className="sm:col-span-2"><Label>Event</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('eventId')}>
            <option value="">Select event...</option>{events.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>{form.formState.errors.eventId && <p className="text-sm text-red-500">{form.formState.errors.eventId.message}</p>}</div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <AddressSearch
              value={form.watch('address') || ''}
              onChange={(v) => form.setValue('address', v)}
              onSelect={(addr, lat, lng) => { form.setValue('address', addr); form.setValue('latitude', lat); form.setValue('longitude', lng); }}
              placeholder="Search pickup point address..."
            />
            {form.formState.errors.latitude && <p className="text-sm text-red-500">{form.formState.errors.latitude.message}</p>}
            {form.formState.errors.longitude && <p className="text-sm text-red-500">{form.formState.errors.longitude.message}</p>}
          </div>
          <input type="hidden" {...form.register('latitude')} />
          <input type="hidden" {...form.register('longitude')} />
          <div className="sm:col-span-2">
            <LocationPicker
              lat={Number(form.watch('latitude')) || 0}
              lng={Number(form.watch('longitude')) || 0}
              onMove={async (lat, lng) => {
                form.setValue('latitude', lat);
                form.setValue('longitude', lng);
                try { const addr = await reverseGeocode(lat, lng); form.setValue('address', addr); } catch {}
              }}
              height="200px"
            />
          </div>
          <div><Label>Max Capacity</Label><Input type="number" {...form.register('maxCapacity')} />{form.formState.errors.maxCapacity && <p className="text-sm text-red-500">{form.formState.errors.maxCapacity.message}</p>}</div>
        </div>
      </EntityModal>
    </div>
  );
}
