import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export default function FactoryDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['factory-report'],
    queryFn: () => api.get('/reports/factory').then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;

  const report = data?.report;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('factoryDashboard')}</h1>
        <p className="text-slate-500 mt-1">{t('welcomeBackName', { name: user?.full_name?.split(' ')[0] ?? '' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { labelKey: 'totalProducts', value: report?.totalProducts || 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
          { labelKey: 'totalSales', value: `${Number(report?.totalSales || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { labelKey: 'recentOrders', value: report?.recentOrders?.length || 0, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
          { labelKey: 'topProducts', value: report?.topProducts?.length || 0, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
        ].map((stat) => (
          <div key={stat.labelKey} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{t(stat.labelKey)}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
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
          {report?.recentOrders?.length === 0 ? (
            <p className="text-slate-400 text-sm">{t('noOrdersYet')}</p>
          ) : (
            <div className="space-y-3">
              {report?.recentOrders?.map((order: {
                order_id: number;
                order_status: string;
                total_amount: number;
                buyer: { user: { full_name: string } };
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
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">{t('topProducts')}</h2>
          {report?.topProducts?.length === 0 ? (
            <p className="text-slate-400 text-sm">{t('noSalesData')}</p>
          ) : (
            <div className="space-y-3">
              {report?.topProducts?.map((item: {
                product_id: number;
                _count: { order_item_id: number };
                _sum: { subtotal: number };
                product: { product_name: string };
              }) => (
                <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{item.product?.product_name}</p>
                    <p className="text-xs text-slate-500">{t('orderCount', { count: item._count.order_item_id })}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">ETB {Number(item._sum.subtotal || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
