import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import TableControls, { TablePagination, useTableControls } from '../../components/TableControls';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get(`/users${roleFilter ? `?role=${roleFilter}` : ''}`).then((r) => r.data),
  });
  const users = data?.users ?? [];
  const table = useTableControls(
    users,
    (user: any) => `${user.full_name} ${user.email} ${user.phone_number ?? ''} ${user.role}`,
    (user: any) => user.account_status
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success(t('userDeleted'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error(t('failedDeleteUser')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'DISABLED' }) =>
      api.put(`/users/${id}/status`, { account_status: status }),
    onSuccess: () => {
      toast.success(t('userStatusUpdated'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('failedUpdateUserStatus')),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('userManagement')}</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-40">
          <option value="">{t('allRoles')}</option>
          <option value="BUYER">{t('buyers')}</option>
          <option value="FACTORY">{t('factories')}</option>
          <option value="ADMIN">{t('admins')}</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <TableControls
          search={table.search}
          onSearchChange={table.setSearch}
          filter={table.filter}
          onFilterChange={table.setFilter}
          filterLabel="status"
          filterOptions={[{ value: 'ACTIVE', label: 'Active' }, { value: 'DISABLED', label: 'Disabled' }]}
          page={table.page}
          totalPages={table.totalPages}
          totalItems={table.totalItems}
          onPageChange={table.setPage}
        />
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('user')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('role')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('phone')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('joined')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {table.pageItems.map((user: {
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
                    {t(user.role === 'ADMIN' ? 'adminRole' : user.role === 'FACTORY' ? 'factoryRole' : 'buyerRole')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.phone_number || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => statusMutation.mutate({ id: user.user_id, status: user.account_status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}
                    disabled={statusMutation.isPending}
                    title={user.account_status === 'ACTIVE' ? t('disableUser') : t('enableUser')}
                    className={`mr-1.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-50 ${user.account_status === 'ACTIVE' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {user.account_status === 'ACTIVE' ? <><UserX size={14} /> {t('disable')}</> : <><UserCheck size={14} /> {t('enable')}</>}
                  </button>
                  <button
                    onClick={() => { if (confirm(t('deleteUserConfirm'))) deleteMutation.mutate(user.user_id); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {table.totalItems === 0 && (
          <div className="text-center py-12 text-slate-400">{t('noUsersFound')}</div>
        )}
        <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} onPageChange={table.setPage} />
      </div>
    </div>
  );
}
