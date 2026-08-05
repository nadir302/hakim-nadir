import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntityModal } from '@/components/shared/EntityModal';
import { getInitials, getStatusColor } from '@/lib/utils';
import { userSchema, UserFormData } from '@/lib/validation';
import { Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const form = useForm<UserFormData>({ resolver: zodResolver(userSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (d: UserFormData) => usersApi.update(editing.id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); setModalOpen(false); setEditing(null); form.reset(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const openEdit = (u: any) => {
    setEditing(u);
    form.reset({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', role: u.role, status: u.status });
    setModalOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    updateMutation.mutate(data);
  };

  const columns = [
    { key: 'name', header: 'Name', render: (u: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {getInitials(u.firstName, u.lastName)}
        </div>
        <div><p className="font-medium">{u.firstName} {u.lastName}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
      </div>
    )},
    { key: 'role', header: 'Role', render: (u: any) => (
      <Badge variant={u.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>{u.role ? u.role.replace('_', ' ') : ''}</Badge>
    )},
    { key: 'status', header: 'Status', render: (u: any) => <Badge className={getStatusColor(u.status)}>{u.status}</Badge> },
    { key: 'verified', header: 'Verified', render: (u: any) => u.emailVerified ? <Badge variant="success">Yes</Badge> : <Badge variant="warning">No</Badge> },
    { key: 'created', header: 'Joined', render: (u: any) => new Date(u.createdAt).toLocaleDateString() },
    { key: 'actions', header: '', render: (u: any) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete user?')) deleteMutation.mutate(u.id); }}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
          <p className="text-muted-foreground">Manage system users</p>
        </div>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search users..." />

      <EntityModal open={modalOpen} onOpenChange={setModalOpen} title="Edit User"
        form={form} onSubmit={onSubmit} isSubmitting={updateMutation.isPending} submitLabel="Update">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>First Name</Label><Input {...form.register('firstName')} />{form.formState.errors.firstName && <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>}</div>
          <div><Label>Last Name</Label><Input {...form.register('lastName')} />{form.formState.errors.lastName && <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>}</div>
          <div><Label>Email</Label><Input type="email" {...form.register('email')} />{form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}</div>
          <div><Label>Phone</Label><Input type="tel" {...form.register('phone')} />{form.formState.errors.phone && <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>}</div>
          <div><Label>Role</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('role')}>
            <option value="EMPLOYEE">Employee</option><option value="DRIVER">Driver</option><option value="ORGANIZER">Organizer</option><option value="SUPER_ADMIN">Super Admin</option>
          </select></div>
          <div><Label>Status</Label><select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...form.register('status')}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option>
          </select></div>
        </div>
      </EntityModal>
    </div>
  );
}
