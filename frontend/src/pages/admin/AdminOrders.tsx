import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Building2, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettlementRow {
  settlement_id: number;
  factory_id: number | null;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  settlement_status: string;
  factory: { factory_id: number; factory_name: string } | null;
}

interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    product_name: string;
    created_by_admin: boolean;
    factory: { factory_id: number; factory_name: string } | null;
  };
}

interface Order {
  order_id: number;
  order_date: string;
  order_status: string;
  total_amount: number;
  buyer: { user: { full_name: string; email: string } };
  payment: { payment_status: string } | null;
  orderitem: OrderItem[];
  settlement: SettlementRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * If no settlement rows exist yet (order placed before this feature was added,
 * or payment still pending), derive a best-effort breakdown from the order items.
 */
function deriveBreakdown(order: Order): SettlementRow[] {
  const map = new Map<string, SettlementRow>();

  for (const item of order.orderitem) {
    const isAdmin = item.product.created_by_admin || !item.product.factory;
    const key = isAdmin ? 'admin' : `factory:${item.product.factory!.factory_id}`;

    if (!map.has(key)) {
      map.set(key, {
        settlement_id: -1,
        factory_id: isAdmin ? null : item.product.factory!.factory_id,
        gross_amount: 0,
        commission_rate: isAdmin ? 0 : 0.10,
        commission_amount: 0,
        net_amount: 0,
        settlement_status: 'CALCULATED',
        factory: isAdmin ? null : item.product.factory,
      });
    }

    const row = map.get(key)!;
    row.gross_amount += item.subtotal;
  }

  // Compute commission & net
  for (const row of map.values()) {
    row.commission_amount = row.gross_amount * row.commission_rate;
    row.net_amount = row.gross_amount - row.commission_amount;
  }

  return Array.from(map.values());
}

// ─── Sub-component: Seller Breakdown Panel ────────────────────────────────────

function SellerBreakdown({ order }: { order: Order }) {
  const rows: SettlementRow[] =
    order.settlement.length > 0 ? order.settlement : deriveBreakdown(order);

  const totalCommission = rows.reduce((s, r) => s + r.commission_amount, 0);

  return (
    <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Seller Breakdown — Buyer paid ETB {Number(order.total_amount).toLocaleString()} once
      </p>

      <div className="space-y-2">
        {rows.map((row, idx) => {
          const isAdmin = row.factory_id === null;
          return (
            <div
              key={idx}
              className={`flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg px-4 py-3 text-sm ${
                isAdmin
                  ? 'bg-blue-50 border border-blue-100'
                  : 'bg-white border border-slate-100'
              }`}
            >
              {/* Seller label */}
              <div className="flex items-center gap-2 w-44 shrink-0">
                {isAdmin ? (
                  <ShieldCheck size={15} className="text-blue-500 shrink-0" />
                ) : (
                  <Building2 size={15} className="text-slate-400 shrink-0" />
                )}
                <span className="font-medium text-slate-800 truncate">
                  {isAdmin ? 'Platform (Admin)' : row.factory!.factory_name}
                </span>
              </div>

              {/* Gross */}
              <div className="flex flex-col min-w-[90px]">
                <span className="text-xs text-slate-400">Gross</span>
                <span className="font-semibold text-slate-800">
                  ETB {Number(row.gross_amount).toLocaleString()}
                </span>
              </div>

              {/* Commission */}
              <div className="flex flex-col min-w-[110px]">
                <span className="text-xs text-slate-400">
                  Commission ({(row.commission_rate * 100).toFixed(0)}%)
                </span>
                <span
                  className={`font-semibold ${
                    isAdmin ? 'text-slate-400' : 'text-orange-600'
                  }`}
                >
                  {isAdmin
                    ? '—'
                    : `ETB ${Number(row.commission_amount).toLocaleString()}`}
                </span>
              </div>

              {/* Net */}
              <div className="flex flex-col min-w-[100px]">
                <span className="text-xs text-slate-400">
                  {isAdmin ? 'Platform Earns' : 'Factory Receives'}
                </span>
                <span className="font-semibold text-green-700">
                  ETB {Number(row.net_amount).toLocaleString()}
                </span>
              </div>

              {/* Status badge (only for real settlement rows) */}
              {row.settlement_id !== -1 && (
                <div className="ml-auto">
                  <StatusBadge status={row.settlement_status} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {rows.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <span className="text-slate-500">
            Total paid by buyer:{' '}
            <strong className="text-slate-800">
              ETB {Number(order.total_amount).toLocaleString()}
            </strong>
          </span>
          <span className="text-slate-500">
            Platform commission collected:{' '}
            <strong className="text-orange-600">
              ETB {Number(totalCommission).toLocaleString()}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () =>
      api
        .get(`/orders?limit=100${statusFilter ? `&status=${statusFilter}` : ''}`)
        .then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/orders/${id}/status`, { order_status: status }),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  if (isLoading) return <PageLoader />;

  const orders: Order[] = data?.orders ?? [];

  // Stats
  const adminOnlyOrders = orders.filter((o) =>
    o.orderitem.every((i) => i.product.created_by_admin)
  );
  const factoryOnlyOrders = orders.filter((o) =>
    o.orderitem.every((i) => !i.product.created_by_admin)
  );
  const mixedOrders = orders.filter(
    (o) =>
      o.orderitem.some((i) => i.product.created_by_admin) &&
      o.orderitem.some((i) => !i.product.created_by_admin)
  );

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Every order shows a full seller breakdown — click a row to expand.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field text-sm py-1.5 w-40"
        >
          <option value="">All statuses</option>
          {['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Admin-only', value: adminOnlyOrders.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Factory-only', value: factoryOnlyOrders.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Mixed (both)', value: mixedOrders.length, color: 'bg-orange-50 text-orange-700' },
        ].map((pill) => (
          <div key={pill.label} className={`px-4 py-2 rounded-xl text-sm font-semibold ${pill.color}`}>
            {pill.label}: {pill.value}
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Orders</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Click any row to see the seller split calculation.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-14 text-slate-400">No orders found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isExpanded = expandedId === order.order_id;

              // Determine order type label
              const hasAdmin = order.orderitem.some((i) => i.product.created_by_admin);
              const hasFactory = order.orderitem.some((i) => !i.product.created_by_admin);
              const typeLabel =
                hasAdmin && hasFactory
                  ? 'Mixed'
                  : hasAdmin
                  ? 'Admin'
                  : 'Factory';
              const typeBadgeClass =
                typeLabel === 'Mixed'
                  ? 'bg-orange-50 text-orange-700'
                  : typeLabel === 'Admin'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-purple-50 text-purple-700';

              return (
                <div key={order.order_id}>
                  {/* ── Main row (clickable) ── */}
                  <div
                    className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-6 py-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggle(order.order_id)}
                  >
                    {/* Expand icon */}
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      <p className="text-sm text-slate-700 font-medium">
                        {order.buyer.user.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.buyer.user.email}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${typeBadgeClass}`}
                    >
                      {typeLabel}
                    </span>

                    {/* Total */}
                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-900">
                        ETB {Number(order.total_amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.orderitem.length} item
                        {order.orderitem.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Payment status */}
                    <div className="text-center">
                      {order.payment ? (
                        <StatusBadge status={order.payment.payment_status} />
                      ) : (
                        <span className="text-slate-400 text-xs">No payment</span>
                      )}
                    </div>

                    {/* Order status badge */}
                    <div>
                      <StatusBadge status={order.order_status} />
                    </div>

                    {/* Status updater — stop propagation so clicking dropdown
                        doesn't toggle the expand */}
                    <div onClick={(e) => e.stopPropagation()}>
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
                        {['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* ── Expanded breakdown ── */}
                  {isExpanded && <SellerBreakdown order={order} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Column header hint (below the card so it doesn't crowd the header) */}
      <p className="text-xs text-slate-400 mt-3 text-center">
        Columns: expand · order · buyer · type · total · payment · status · update
      </p>
    </div>
  );
}
