import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;

  const orders = data?.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary px-6 py-2.5">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: {
            order_id: number;
            order_date: string;
            order_status: string;
            total_amount: number;
            orderItems: { product: { product_name: string } }[];
            payment: { payment_status: string } | null;
          }) => (
            <Link
              key={order.order_id}
              to={`/orders/${order.order_id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">Order #{order.order_id}</span>
                  <StatusBadge status={order.order_status} />
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {order.orderItems.map((i) => i.product.product_name).join(', ')}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(order.order_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900">ETB {Number(order.total_amount).toLocaleString()}</p>
                {order.payment && (
                  <StatusBadge status={order.payment.payment_status} className="mt-1" />
                )}
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
