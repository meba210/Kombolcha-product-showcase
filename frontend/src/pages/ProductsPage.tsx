import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import ProductCard, { Product } from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const queryParams = new URLSearchParams({
    ...(search && { search }),
    ...(categoryId && { category_id: categoryId }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    page: String(page),
    limit: '12',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, categoryId, minPrice, maxPrice, page],
    queryFn: () => api.get(`/products?${queryParams}`).then((r) => r.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = search || categoryId || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('products_title')}</h1>
        <p className="text-slate-500 mt-1">
          {data?.pagination?.total
            ? t('products_subtitle_count', { count: data.pagination.total })
            : t('products_subtitle_default')}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('products_search_placeholder')}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            {t('products_search_btn')}
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          {t('products_filters_btn')}
          {hasFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="btn-secondary flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          >
            <X size={16} /> {t('products_clear_btn')}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('products_filter_category')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                className="input-field"
              >
                <option value="">{t('products_filter_all_categories')}</option>
                {categoriesData?.categories?.map((cat: { category_id: number; category_name: string }) => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('products_filter_min_price')}
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('products_filter_max_price')}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder={t('filter')}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <PageLoader />
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('products_not_found_title')}</h3>
          <p className="text-slate-500">{t('products_not_found_sub')}</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-primary mt-4">
              {t('products_clear_filters')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.products?.map((product: Product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                {t('products_previous')}
              </button>
              <span className="text-sm text-slate-600 px-4">
                {t('products_page_of', { page, total: data.pagination.totalPages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="btn-secondary px-4 py-2 disabled:opacity-50"
              >
                {t('products_next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
