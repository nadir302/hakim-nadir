import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import { getInitials } from '@/lib/utils';
import { driverSchema, DriverFormData } from '@/lib/validation';
import { Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDrivers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const form = useForm<DriverFormData>({ resolver: zodResolver(driverSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', page, search],
    queryFn: () => driversApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: DriverFormData) => driversApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver created'); setModalOpen(false); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: DriverFormData) => driversApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const openCreate = () => { setEditing(null); form.reset({ availability: true } as any); setModalOpen(true); };
  const openEdit = (d: any) => {
    setEditing(d);
    form.reset({ firstName: d.user?.firstName, lastName: d.user?.lastName, email: d.user?.email, phone: d.phone, licenseNumber: d.licenseNumber, address: d.address || '' });
    setModalOpen(true);
  };

  const onSubmit = async (data: DriverFormData) => {
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Driver', render: (d: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {getInitials(d.user?.firstName, d.user?.lastName)}
        </div>
        <div><p className="font-medium">{d.user?.firstName} {d.user?.lastName}</p><p className="text-xs text-muted-foreground">{d.user?.email}</p></div>
      </div>
    )},
    { key: 'license', header: 'License', render: (d: any) => d.licenseNumber },
    { key: 'phone', header: 'Phone', render: (d: any) => d.phone },
    { key: 'vehicle', header: 'Vehicle', render: (d: any) => d.vehicle?.busNumber || 'Unassigned' },
    { key: 'trips', header: 'Trips', render: (d: any) => d._count?.trips || 0 },
    { key: 'availability', header: 'Available', render: (d: any) => (
      <Badge variant={d.availability ? 'success' : 'secondary'}>{d.availability ? 'Yes' : 'No'}</Badge>
    )},
    { key: 'actions', header: '', render: (d: any) => <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Edit2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Drivers</h1>
          <p className="text-muted-foreground">Manage drivers</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search drivers..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Driver' : 'Add Driver'}
        form={form} onSubmit={onSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Update' : 'Create'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>First Name</Label><Input {...form.register('firstName')} />{form.formState.errors.firstName && <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>}</div>
          <div><Label>Last Name</Label><Input {...form.register('lastName')} />{form.formState.errors.lastName && <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>}</div>
          <div><Label>Email</Label><Input type="email" {...form.register('email')} />{form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}</div>
          <div><Label>Phone</Label><Input type="tel" {...form.register('phone')} />{form.formState.errors.phone && <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>}</div>
          <div><Label>License Number</Label><Input {...form.register('licenseNumber')} />{form.formState.errors.licenseNumber && <p className="text-sm text-red-500">{form.formState.errors.licenseNumber.message}</p>}</div>
          <div><Label>Password (leave blank to keep)</Label><Input type="password" {...form.register('password')} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Textarea {...form.register('address')} /></div>
        </div>
      </EntityModal>
    </div>
  );
}
