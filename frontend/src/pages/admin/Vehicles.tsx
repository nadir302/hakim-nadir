import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import { getStatusColor } from '@/lib/utils';
import { vehicleSchema, VehicleFormData } from '@/lib/validation';
import { Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVehicles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const form = useForm<VehicleFormData>({ resolver: zodResolver(vehicleSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', page, search],
    queryFn: () => vehiclesApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: VehicleFormData) => vehiclesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: VehicleFormData) => vehiclesApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const openCreate = () => { setEditing(null); form.reset({ status: 'AVAILABLE' }); setModalOpen(true); };
  const openEdit = (v: any) => {
    setEditing(v);
    form.reset({ busNumber: v.busNumber, plateNumber: v.plateNumber, capacity: v.capacity, model: v.model || '', year: v.year || '', color: v.color || '', status: v.status });
    setModalOpen(true);
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const columns = [
    { key: 'bus', header: 'Bus / Plate', render: (v: any) => (
      <div><p className="font-medium">{v.busNumber}</p><p className="text-xs text-muted-foreground">{v.plateNumber}</p></div>
    )},
    { key: 'model', header: 'Model', render: (v: any) => v.model || '-' },
    { key: 'capacity', header: 'Capacity', render: (v: any) => `${v.capacity} seats` },
    { key: 'driver', header: 'Driver', render: (v: any) => v.driver ? `${v.driver.user?.firstName} ${v.driver.user?.lastName}` : 'Unassigned' },
    { key: 'status', header: 'Status', render: (v: any) => <Badge className={getStatusColor(v.status)}>{v.status.replace('_', ' ')}</Badge> },
    { key: 'actions', header: '', render: (v: any) => <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Edit2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vehicles</h1>
          <p className="text-muted-foreground">Manage shuttle vehicles</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Vehicle</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search vehicles..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Update' : 'Create'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Bus Number</Label><Input {...form.register('busNumber')} />{form.formState.errors.busNumber && <p className="text-sm text-red-500">{form.formState.errors.busNumber.message}</p>}</div>
          <div><Label>Plate Number</Label><Input {...form.register('plateNumber')} />{form.formState.errors.plateNumber && <p className="text-sm text-red-500">{form.formState.errors.plateNumber.message}</p>}</div>
          <div><Label>Model</Label><Input {...form.register('model')} /></div>
          <div><Label>Year</Label><Input type="number" {...form.register('year')} /></div>
          <div><Label>Color</Label><Input {...form.register('color')} /></div>
          <div><Label>Capacity</Label><Input type="number" {...form.register('capacity')} />{form.formState.errors.capacity && <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>}</div>
          <div><Label>Status</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('status')}><option value="AVAILABLE">Available</option><option value="IN_USE">In Use</option><option value="MAINTENANCE">Maintenance</option><option value="OUT_OF_SERVICE">Out of Service</option></select></div>
        </div>
      </EntityModal>
    </div>
  );
}
