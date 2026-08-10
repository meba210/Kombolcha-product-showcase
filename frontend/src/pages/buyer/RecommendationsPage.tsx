import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import api from '../../lib/api';
import ProductCard, { Product } from '../../components/ProductCard';
import { PageLoader } from '../../components/LoadingSpinner';

export default function RecommendationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then((r) => r.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-accent-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended for You</h1>
          <p className="text-slate-500 text-sm">AI-powered suggestions based on your activity</p>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : data?.recommendations?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No recommendations yet</h3>
          <p className="text-slate-500">Browse some products to get personalized recommendations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.recommendations?.map((product: Product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
