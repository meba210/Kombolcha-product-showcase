import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function FactoryReports() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['factory-report'],
    queryFn: () => api.get('/reports/factory').then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;
  const report = data?.report;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-slate-900">{t('reportsAnalytics')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { labelKey: 'totalProducts', value: report?.totalProducts || 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { labelKey: 'totalSales', value: Number(report?.totalSales || 0).toLocaleString(), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { labelKey: 'topProducts', value: report?.topProducts?.length || 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map((stat) => (
          <div key={stat.labelKey} className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-sm text-slate-500">{t(stat.labelKey)}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">{t('topSellingProducts')}</h2>
        {report?.topProducts?.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('noSalesData')}</p>
        ) : (
          <div className="space-y-3">
            {report?.topProducts?.map((item: {
              product_id: number;
              _count: { order_item_id: number };
              _sum: { quantity: number; subtotal: number };
              product: { product_name: string };
            }, idx: number) => (
              <div key={item.product_id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-800">{item.product?.product_name}</p>
                  <p className="text-xs text-slate-500">{item._count.order_item_id} orders · {item._sum.quantity} units sold</p>
                </div>
                <p className="font-semibold text-green-600 text-sm">ETB {Number(item._sum.subtotal || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
