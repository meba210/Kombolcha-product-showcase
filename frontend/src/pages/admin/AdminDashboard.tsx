import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingCart, DollarSign, Factory, Clock } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-report'],
    queryFn: () => api.get('/reports/admin').then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;
  const report = data?.report;

  const stats = [
    { labelKey: 'totalUsers', value: report?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { labelKey: 'totalProducts', value: report?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { labelKey: 'totalOrders', value: report?.totalOrders || 0, icon: ShoppingCart, color: 'bg-orange-50 text-orange-600' },
    { labelKey: 'revenue', value: Number(report?.totalRevenue || 0).toLocaleString(), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { labelKey: 'factories', value: report?.totalFactories || 0, icon: Factory, color: 'bg-slate-50 text-slate-600' },
    { labelKey: 'pendingApprovals', value: report?.pendingFactories || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('adminDashboard')}</h1>
        <p className="text-slate-500 mt-1">{t('platformOverview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{t(stat.labelKey)}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">{t('recentOrders')}</h2>
          <div className="space-y-3">
            {report?.recentOrders?.map((order: {
              order_id: number;
              order_status: string;
              total_amount: number;
              buyer: { user: { full_name: string } };
              payment: { payment_status: string } | null;
            }) => (
              <div key={order.order_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-slate-800">{t('orderNumber', { id: order.order_id })}</p>
                  <p className="text-xs text-slate-500">{order.buyer.user.full_name}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.order_status} />
                  <p className="text-sm font-semibold text-slate-800 mt-1">ETB {Number(order.total_amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">{t('ordersByStatus')}</h2>
          <div className="space-y-3">
            {report?.ordersByStatus?.map((item: { order_status: string; _count: { order_id: number } }) => (
              <div key={item.order_status} className="flex items-center justify-between">
                <StatusBadge status={item.order_status} />
                <span className="font-semibold text-slate-800">{item._count.order_id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
