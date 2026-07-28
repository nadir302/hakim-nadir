import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import AddressSearch from '@/components/shared/AddressSearch';
import LocationPicker from '@/components/shared/LocationPicker';
import { formatDate, getStatusColor } from '@/lib/utils';
import { eventSchema, EventFormData } from '@/lib/validation';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reverseGeocode } from '@/services/googleMaps';

export default function AdminEvents() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({ resolver: zodResolver(eventSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, search],
    queryFn: () => eventsApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: EventFormData) => eventsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Event created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: EventFormData) => eventsApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Event updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Event deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const openCreate = () => { setEditing(null); form.reset({ status: 'DRAFT' }); setModalOpen(true); };
  const openEdit = (e: any) => {
    setEditing(e);
    form.reset({
      name: e.name, description: e.description || '', date: e.date?.split('T')[0] || '',
      startTime: e.startTime?.slice(0, 16) || '', endTime: e.endTime?.slice(0, 16) || '',
      address: e.address, latitude: e.latitude || '', longitude: e.longitude || '',
      capacity: e.capacity, status: e.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: EventFormData) => {
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Event', render: (e: any) => (
      <div><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.address}</p></div>
    )},
    { key: 'date', header: 'Date', render: (e: any) => formatDate(e.date) },
    { key: 'capacity', header: 'Capacity', render: (e: any) => `${e._count?.reservations || 0}/${e.capacity}` },
    { key: 'status', header: 'Status', render: (e: any) => <Badge className={getStatusColor(e.status)}>{e.status}</Badge> },
    { key: 'organizer', header: 'Organizer', render: (e: any) => e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : '-' },
    { key: 'actions', header: '', render: (e: any) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete event?')) deleteMutation.mutate(e.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Events</h1>
          <p className="text-muted-foreground">Manage events</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search events..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Event' : 'Create Event'}
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Update' : 'Create'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Name</Label><Input {...form.register('name')} />{form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}</div>
          <div><Label>Date</Label><Input type="date" {...form.register('date')} />{form.formState.errors.date && <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>}</div>
          <div><Label>Status</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('status')}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ONGOING">Ongoing</option><option value="COMPLETED">Completed</option></select></div>
          <div><Label>Start Time</Label><Input type="datetime-local" {...form.register('startTime')} />{form.formState.errors.startTime && <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>}</div>
          <div><Label>End Time</Label><Input type="datetime-local" {...form.register('endTime')} />{form.formState.errors.endTime && <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>}</div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <AddressSearch
              value={form.watch('address') || ''}
              onChange={(v) => form.setValue('address', v)}
              onSelect={(addr, lat, lng) => { form.setValue('address', addr); form.setValue('latitude', lat); form.setValue('longitude', lng); }}
              placeholder="Search event address..."
              error={form.formState.errors.address?.message as string}
            />
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
                try {
                  const addr = await reverseGeocode(lat, lng);
                  form.setValue('address', addr);
                } catch {}
              }}
              height="200px"
            />
          </div>
          <div><Label>Capacity</Label><Input type="number" {...form.register('capacity')} />{form.formState.errors.capacity && <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>}</div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea {...form.register('description')} /></div>
        </div>
      </EntityModal>
    </div>
  );
}
