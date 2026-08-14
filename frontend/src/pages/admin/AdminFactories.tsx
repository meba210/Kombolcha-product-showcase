import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export default function AdminFactories() {
  const queryClient = useQueryClient();

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['all-factories'],
    queryFn: () => api.get('/factories/manage').then((r) => r.data),
  });

  const { data: pendingData } = useQuery({
    queryKey: ['pending-factories'],
    queryFn: () => api.get('/factories/pending').then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/factories/${id}/approve`, { approval_status: status }),
    onSuccess: () => {
      toast.success('Factory status updated');
      queryClient.invalidateQueries({ queryKey: ['all-factories'] });
      queryClient.invalidateQueries({ queryKey: ['pending-factories'] });
    },
    onError: () => toast.error('Failed to update factory'),
  });

  if (allLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Factory Management</h1>

      {/* Pending Approvals */}
      {pendingData?.factories?.length > 0 && (
        <div className="card p-6 mb-6 border-l-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-yellow-600" />
            <h2 className="font-semibold text-slate-800">Pending Approvals ({pendingData.factories.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingData.factories.map((factory: {
              factory_id: number;
              factory_name: string;
              location: string;
              user: { full_name: string; email: string };
            }) => (
              <div key={factory.factory_id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{factory.factory_name}</p>
                  <p className="text-sm text-slate-500">{factory.user.email} · {factory.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate({ id: factory.factory_id, status: 'APPROVED' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: factory.factory_id, status: 'REJECTED' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Factories */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Factory</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Products</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {allData?.factories?.map((factory: {
              factory_id: number;
              factory_name: string;
              location: string;
              approval_status: string;
              user: { full_name: string; email: string };
              _count: { products: number };
            }) => (
              <tr key={factory.factory_id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-slate-800">{factory.factory_name}</p>
                  <p className="text-xs text-slate-400">{factory.user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{factory.location}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{factory._count.products}</td>
                <td className="px-6 py-4"><StatusBadge status={factory.approval_status} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {factory.approval_status !== 'APPROVED' && (
                      <button
                        onClick={() => approveMutation.mutate({ id: factory.factory_id, status: 'APPROVED' })}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}
                    {factory.approval_status !== 'REJECTED' && (
                      <button
                        onClick={() => approveMutation.mutate({ id: factory.factory_id, status: 'REJECTED' })}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
