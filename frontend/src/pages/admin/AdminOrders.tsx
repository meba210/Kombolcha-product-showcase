import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders?limit=50').then((r) => r.data),
  });

  const adminOrders = data?.orders?.filter((order: any) =>
    order.orderitem?.some((item: any) => item.product?.created_by_admin)
  );
  const factoryOrders = data?.orders?.filter(
    (order: any) =>
      !order.orderitem?.some((item: any) => item.product?.created_by_admin)
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/orders/${id}/status`, { order_status: status }),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Order Management
      </h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              Admin Product Orders
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Orders containing admin-created products.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Buyer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Payment
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminOrders?.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-slate-800">
                        #{order.order_id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {order.buyer.user.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.buyer.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm">
                      ETB {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.payment ? (
                        <StatusBadge status={order.payment.payment_status} />
                      ) : (
                        <span className="text-slate-400 text-xs">
                          No payment
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.order_id,
                            status: e.target.value,
                          })
                        }
                        className="input-field text-sm py-1.5 w-36"
                      >
                        {['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!adminOrders?.length && (
            <div className="text-center py-10 text-slate-400">
              No orders for admin-created products yet.
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              Factory Product Orders
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Orders containing factory-created products.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Buyer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Payment
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {factoryOrders?.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-slate-800">
                        #{order.order_id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {order.buyer.user.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.buyer.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm">
                      ETB {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.payment ? (
                        <StatusBadge status={order.payment.payment_status} />
                      ) : (
                        <span className="text-slate-400 text-xs">
                          No payment
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.order_id,
                            status: e.target.value,
                          })
                        }
                        className="input-field text-sm py-1.5 w-36"
                      >
                        {['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!factoryOrders?.length && (
            <div className="text-center py-10 text-slate-400">
              No orders for factory-created products yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
