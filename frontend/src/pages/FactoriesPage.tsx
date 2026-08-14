import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { PageLoader } from '../components/LoadingSpinner';

export default function FactoriesPage() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['factories'],
    queryFn: () => api.get('/factories').then((r) => r.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('factories_title')}</h1>
        <p className="text-slate-500 mt-1">{t('factories_subtitle')}</p>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.factories?.map((factory: {
            factory_id: number;
            factory_name: string;
            location: string;
            user: { full_name: string; email: string };
            _count: { products: number };
          }) => (
            <Link
              key={factory.factory_id}
              to={`/factories/${factory.factory_id}`}
              className="card p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <span className="text-3xl">🏭</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{factory.factory_name}</h3>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                <MapPin size={14} />
                <span>{factory.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                <Package size={14} />
                <span>{t('factories_products_count', { count: factory._count.products })}</span>
              </div>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                {t('factories_view_products')} <ArrowRight size={14} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
