import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function AdminPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments?limit=50').then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payment Management</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Transaction</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Buyer</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Settlement</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.payments?.map((payment: {
              payment_id: number;
              transaction_reference: string;
              amount: number;
              payment_method: string;
              payment_status: string;
              settlement_status: string;
              payment_date: string;
              order: { buyer: { user: { full_name: string } } };
            }) => (
              <tr key={payment.payment_id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-mono text-xs text-slate-600 truncate max-w-32">{payment.transaction_reference}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{payment.order.buyer.user.full_name}</td>
                <td className="px-6 py-4 font-semibold text-sm">ETB {Number(payment.amount).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{payment.payment_method}</td>
                <td className="px-6 py-4"><StatusBadge status={payment.payment_status} /></td>
                <td className="px-6 py-4"><StatusBadge status={payment.settlement_status} /></td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(payment.payment_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.payments?.length === 0 && (
          <div className="text-center py-12 text-slate-400">No payments yet</div>
        )}
      </div>
    </div>
  );
}
