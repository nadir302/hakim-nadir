import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/services/api';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor, formatDate } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReservations() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page, search],
    queryFn: () => reservationsApi.getAll({ page, limit: 10, search }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Reservation approved'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.reject(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Reservation rejected'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    { key: 'code', header: 'Code', render: (r: any) => <span className="font-mono text-sm font-medium">{r.reservationCode}</span> },
    { key: 'participant', header: 'Participant', render: (r: any) => `${r.participant?.firstName} ${r.participant?.lastName}` },
    { key: 'event', header: 'Event', render: (r: any) => r.event?.name },
    { key: 'date', header: 'Date', render: (r: any) => formatDate(r.date) },
    { key: 'pickup', header: 'Pickup', render: (r: any) => r.pickupPoint?.name || '-' },
    { key: 'status', header: 'Status', render: (r: any) => <Badge className={getStatusColor(r.status)}>{r.status}</Badge> },
    { key: 'actions', header: '', render: (r: any) => r.status === 'PENDING' ? (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="text-green-600" onClick={() => approveMutation.mutate(r.id)}
          disabled={approveMutation.isPending}><Check className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Reject this reservation?')) rejectMutation.mutate(r.id); }}
          disabled={rejectMutation.isPending}><X className="h-4 w-4" /></Button>
      </div>
    ) : null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reservations</h1>
        <p className="text-muted-foreground">Manage reservations — approve or reject pending requests</p>
      </div>
      <DataTable columns={columns} data={data?.data || []} total={data?.total} page={data?.page} totalPages={data?.totalPages}
        onPageChange={setPage} onSearch={setSearch} loading={isLoading} searchPlaceholder="Search by code or name..." />
    </div>
  );
}
