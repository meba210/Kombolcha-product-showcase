import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function FactoryDashboard() {
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
        <h1 className="text-2xl font-bold text-slate-900">Factory Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.full_name?.split(' ')[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Products', value: report?.totalProducts || 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Sales (ETB)', value: `${Number(report?.totalSales || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'Recent Orders', value: report?.recentOrders?.length || 0, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
          { label: 'Top Products', value: report?.topProducts?.length || 0, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
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
          <h2 className="font-semibold text-slate-800 mb-4">Recent Orders</h2>
          {report?.recentOrders?.length === 0 ? (
            <p className="text-slate-400 text-sm">No orders yet</p>
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
                    <p className="font-medium text-sm text-slate-800">Order #{order.order_id}</p>
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
          <h2 className="font-semibold text-slate-800 mb-4">Top Products</h2>
          {report?.topProducts?.length === 0 ? (
            <p className="text-slate-400 text-sm">No sales data yet</p>
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
                    <p className="text-xs text-slate-500">{item._count.order_item_id} orders</p>
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
