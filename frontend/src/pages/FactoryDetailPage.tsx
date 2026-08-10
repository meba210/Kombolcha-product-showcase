import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Mail, Phone, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import ProductCard, { Product } from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';

export default function FactoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['factory', id],
    queryFn: () => api.get(`/factories/${id}`).then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;
  if (!data?.factory) return <div className="text-center py-16 text-slate-500">Factory not found</div>;

  const { factory } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/factories" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={14} /> Back to Factories
      </Link>

      {/* Factory Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            🏭
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{factory.factory_name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary-500" />
                {factory.location}
              </div>
              {factory.user?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={15} className="text-primary-500" />
                  {factory.user.email}
                </div>
              )}
              {factory.user?.phone_number && (
                <div className="flex items-center gap-1.5">
                  <Phone size={15} className="text-primary-500" />
                  {factory.user.phone_number}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-bold text-slate-900 mb-6">Products from {factory.factory_name}</h2>
      {factory.products?.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No products available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {factory.products?.map((product: Product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
