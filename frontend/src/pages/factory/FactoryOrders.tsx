import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const COMMISSION_RATE = 0.10;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettlementRow {
  settlement_id: number;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  settlement_status: string;
}

interface OrderItem {
  order_item_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    product_id: number;
    product_name: string;
    image: string | null;
    created_by_admin: boolean;
    factory: { factory_id: number; factory_name: string } | null;
  };
}

interface Order {
  order_id: number;
  order_date: string;
  order_status: string;
  total_amount: number; // full buyer payment (may include other sellers)
  buyer: { user: { full_name: string; email: string } };
  payment: { payment_status: string } | null;
  orderitem: OrderItem[];
  settlement: SettlementRow[]; // filtered to this factory only by the backend
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Items in this order that belong to this factory (not admin products) */
function myItems(order: Order): OrderItem[] {
  return order.orderitem.filter(
    (i) => !i.product.created_by_admin && i.product.factory !== null
  );
}

/**
 * My gross = sum of my items' subtotals.
 * Falls back to calculating from orderitem if no settlement row exists yet.
 */
function calcBreakdown(order: Order) {
  if (order.settlement.length > 0) {
    const s = order.settlement[0];
    return {
      gross: Number(s.gross_amount),
      commission: Number(s.commission_amount),
      net: Number(s.net_amount),
      rate: Number(s.commission_rate),
      fromSettlement: true,
      status: s.settlement_status,
    };
  }
  // Derive from order items (for orders before settlement feature was added)
  const gross = myItems(order).reduce((sum, i) => sum + i.subtotal, 0);
  const commission = gross * COMMISSION_RATE;
  return {
    gross,
    commission,
    net: gross - commission,
    rate: COMMISSION_RATE,
    fromSettlement: false,
    status: 'CALCULATED',
  };
}

// ─── Expanded breakdown panel ─────────────────────────────────────────────────

function OrderBreakdown({ order }: { order: Order }) {
  const items = myItems(order);
  const bd = calcBreakdown(order);
  const buyerPaid = Number(order.total_amount);
  const otherSellers = buyerPaid - bd.gross;

  return (
    <div className="bg-slate-50 border-t border-slate-100 px-6 py-5">
      {/* Products in this order that belong to this factory */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Your Products in This Order
      </p>
      <div className="space-y-2 mb-5">
        {items.map((item) => (
          <div
            key={item.order_item_id}
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg px-4 py-2.5"
          >
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={14} className="text-slate-400" />
              )}
            </div>
            <p className="text-sm text-slate-800 flex-1 truncate font-medium">
              {item.product.product_name}
            </p>
            <p className="text-xs text-slate-500 shrink-0">
              {item.quantity} × ETB {Number(item.price).toLocaleString()}
            </p>
            <p className="text-sm font-semibold text-slate-800 shrink-0 ml-2">
              ETB {Number(item.subtotal).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Commission calculation */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Revenue Calculation
      </p>
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        {/* Full buyer payment context */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-sm text-slate-500">Buyer paid (entire order)</span>
          <span className="text-sm font-semibold text-slate-700">
            ETB {buyerPaid.toLocaleString()}
          </span>
        </div>

        {otherSellers > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm text-slate-400 italic">
              Other sellers' portion (not yours)
            </span>
            <span className="text-sm text-slate-400">
              − ETB {otherSellers.toLocaleString()}
            </span>
          </div>
        )}

        {/* Gross */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm text-slate-700 font-medium">
            Your gross (your products only)
          </span>
          <span className="text-sm font-bold text-slate-900">
            ETB {bd.gross.toLocaleString()}
          </span>
        </div>

        {/* Commission */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-orange-50">
          <span className="text-sm text-orange-700">
            Platform commission ({(bd.rate * 100).toFixed(0)}%)
          </span>
          <span className="text-sm font-semibold text-orange-700">
            − ETB {bd.commission.toLocaleString()}
          </span>
        </div>

        {/* Net */}
        <div className="flex items-center justify-between px-4 py-4 bg-green-50">
          <span className="text-base font-bold text-green-800">
            You receive
          </span>
          <span className="text-base font-bold text-green-700">
            ETB {bd.net.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Settlement status note */}
      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={bd.status} />
        <span className="text-xs text-slate-400">
          {bd.fromSettlement
            ? 'Settlement record confirmed'
            : 'Calculated from order items — settlement record pending'}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FactoryOrders() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['factory-orders', statusFilter],
    queryFn: () =>
      api
        .get(`/orders?limit=100${statusFilter ? `&status=${statusFilter}` : ''}`)
        .then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/orders/${id}/status`, { order_status: status }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['factory-orders'] });
    },
    onError: () => toast.error('Failed to update order'),
  });

  if (isLoading) return <PageLoader />;

  const orders: Order[] = data?.orders ?? [];

  // Aggregate totals for the summary bar
  const totalGross = orders.reduce((sum, o) => sum + calcBreakdown(o).gross, 0);
  const totalCommission = orders.reduce((sum, o) => sum + calcBreakdown(o).commission, 0);
  const totalNet = orders.reduce((sum, o) => sum + calcBreakdown(o).net, 0);

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Orders that contain your products. Click a row to see your revenue split.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field text-sm py-1.5 w-40"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Revenue summary bar */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-1">Total Gross (your products)</p>
            <p className="text-xl font-bold text-slate-900">
              ETB {totalGross.toLocaleString()}
            </p>
          </div>
          <div className="card p-4 border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Platform Commission (10%)</p>
            <p className="text-xl font-bold text-orange-600">
              − ETB {totalCommission.toLocaleString()}
            </p>
          </div>
          <div className="card p-4 border-green-100 bg-green-50">
            <p className="text-xs text-green-700 mb-1">You Receive (net)</p>
            <p className="text-xl font-bold text-green-700">
              ETB {totalNet.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Orders list */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800">
            All Orders ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-14 text-slate-400">No orders yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isExpanded = expandedId === order.order_id;
              const bd = calcBreakdown(order);
              const items = myItems(order);

              return (
                <div key={order.order_id}>
                  {/* ── Main row ── */}
                  <div
                    className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-x-4 items-center px-6 py-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggle(order.order_id)}
                  >
                    {/* Expand toggle */}
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>

                    {/* Order ID + date */}
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        #{order.order_id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Buyer */}
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {order.buyer.user.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.buyer.user.email}
                      </p>
                    </div>

                    {/* Items count */}
                    <div className="text-center">
                      <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Your net amount (what you earn) */}
                    <div className="text-right">
                      <p className="font-bold text-sm text-green-700">
                        ETB {bd.net.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        your net
                      </p>
                    </div>

                    {/* Payment status */}
                    <div>
                      {order.payment ? (
                        <StatusBadge status={order.payment.payment_status} />
                      ) : (
                        <span className="text-xs text-slate-400">No payment</span>
                      )}
                    </div>

                    {/* Order status + updater */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.order_id,
                            status: e.target.value,
                          })
                        }
                        className="input-field text-sm py-1.5 w-32"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ── Expanded breakdown ── */}
                  {isExpanded && <OrderBreakdown order={order} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
