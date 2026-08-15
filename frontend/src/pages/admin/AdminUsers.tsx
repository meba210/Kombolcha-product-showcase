import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get(`/users${roleFilter ? `?role=${roleFilter}` : ''}`).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'DISABLED' }) =>
      api.put(`/users/${id}/status`, { account_status: status }),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update user status'),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-40">
          <option value="">All Roles</option>
          <option value="BUYER">Buyers</option>
          <option value="FACTORY">Factories</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.users?.map((user: {
              user_id: number;
              full_name: string;
              email: string;
              role: string;
              account_status: 'ACTIVE' | 'DISABLED';
              phone_number: string | null;
              created_at: string;
            }) => (
              <tr key={user.user_id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{user.full_name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${user.role === 'ADMIN' ? 'badge-red' : user.role === 'FACTORY' ? 'badge-blue' : 'badge-green'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.phone_number || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => statusMutation.mutate({ id: user.user_id, status: user.account_status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}
                    disabled={statusMutation.isPending}
                    title={user.account_status === 'ACTIVE' ? 'Disable user' : 'Enable user'}
                    className={`mr-1.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-50 ${user.account_status === 'ACTIVE' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {user.account_status === 'ACTIVE' ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(user.user_id); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.users?.length === 0 && (
          <div className="text-center py-12 text-slate-400">No users found</div>
        )}
      </div>
    </div>
  );
}
