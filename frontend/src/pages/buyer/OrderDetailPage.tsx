import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;
  if (!data?.order)
    return (
      <div className="text-center py-16 text-slate-500">Order not found</div>
    );

  const { order } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/orders"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Order #{order.order_id}
        </h1>
        <StatusBadge status={order.order_status} />
      </div>

      {/* Order Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Items</h2>
        <div className="space-y-4">
          {order.orderitem.map(
            (item: {
              order_item_id: number;
              quantity: number;
              price: number;
              subtotal: number;
              product: {
                product_name: string;
                image: string | null;
                factory: { factory_name: string } | null;
              };
            }) => (
              <div key={item.order_item_id} className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-slate-800">
                    {item.product.product_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.product.factory?.factory_name || 'Platform Product'}
                  </p>

                  <p className="text-sm text-slate-500">
                    Qty: {item.quantity} × ETB{' '}
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>

                <p className="font-semibold text-slate-900">
                  ETB {Number(item.subtotal).toLocaleString()}
                </p>
              </div>
            )
          )}
        </div>
        <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-bold text-slate-900">
          <span>Total</span>
          <span>ETB {Number(order.total_amount).toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Info */}
      {order.payment && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Payment</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <StatusBadge
                status={order.payment.payment_status}
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-slate-500">Method</p>
              <p className="font-medium text-slate-800 mt-1">
                {order.payment.payment_method}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Amount</p>
              <p className="font-medium text-slate-800 mt-1">
                ETB {Number(order.payment.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Date</p>
              <p className="font-medium text-slate-800 mt-1">
                {new Date(order.payment.payment_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
