import { useState, lazy, Suspense, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  MapPin,
  CheckCircle,
  Shield,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Factory,
  Package,
  Users,
  ShoppingBag,
  Star,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';
import BuyerLandingPage from '../pages/BuyerLandingPage';
import api from '../lib/api';
import industrialPark from '../assets/industrial-park.jpg';
import industrialParkNight from '../assets/industrial park night.jpg';

const FactoryMap = lazy(() => import('../components/FactoryMap'));

// ─── Static data — icons only, labels come from t() ─────────────────────────

const trustBadgeIcons = [
  {
    icon: CheckCircle,
    key: 'verifiedFactories',
    subKey: 'verifiedFactoriesSub',
  },
  { icon: Shield, key: 'qualityProducts', subKey: 'qualityProductsSub' },
  { icon: MapPin, key: 'madeInEthiopia', subKey: 'madeInEthiopiaSub' },
];

const glanceStatDefs = [
  { icon: Factory, value: '150+', key: 'factories' },
  { icon: Package, value: '2,500+', key: 'products' },
  { icon: Users, value: '10,000+', key: 'jobsCreated' },
  { icon: ShoppingBag, value: '1,200+', key: 'globalBuyers' },
];

// ─── Factory list item (Nike-style) ──────────────────────────────────────────

interface FactoryItemProps {
  factory: {
    factory_id: number;
    factory_name: string;
    location: string;
    _count?: { product: number };
  };
  index: number;
}

function FactoryListItem({ factory }: FactoryItemProps) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/factories/${factory.factory_id}`}
      className="block px-5 py-4 border-b border-smoke-100 hover:bg-smoke-50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-smoke-900 text-sm leading-snug group-hover:text-primary-700 transition-colors">
            {factory.factory_name}
          </p>
          <p className="text-xs text-smoke-500 mt-1 leading-snug">
            {factory.location}
          </p>
          {factory._count !== undefined && (
            <p className="text-xs text-smoke-400 mt-0.5">
              {factory._count.product} {t('products')}
            </p>
          )}
          <p className="text-xs font-semibold text-green-600 mt-1.5">
            {t('verified')} · {t('open')}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-smoke-900 flex items-center justify-center shrink-0 mt-0.5">
          <Factory size={14} className="text-white" />
        </div>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains('theme-dark'));
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-nav'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    enabled: user?.role !== 'BUYER',
  });
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?limit=5').then((r) => r.data),
    enabled: user?.role !== 'BUYER',
  });
  const { data: highlightsData } = useQuery({
    queryKey: ['public-highlights'],
    queryFn: () => api.get('/reports/highlights').then((r) => r.data),
    enabled: user?.role !== 'BUYER',
  });
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-map'],
    queryFn: () => api.get('/factories').then((r) => r.data),
    enabled: user?.role !== 'BUYER',
  });

  const categories: { category_id: number; category_name: string }[] =
    categoriesData?.categories ?? [];
  const featuredProducts = productsData?.products ?? [];
  const highlight = highlightsData;
  const fp = highlight?.featuredProduct ?? null;
  const mapFactories = factoriesData?.factories ?? [];

  if (user?.role === 'BUYER') return <BuyerLandingPage />;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white text-smoke-900">
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-smoke-100 min-h-[540px] flex items-center">
        {/* ── Background image — right half, fades left into white ── */}
        <div className="absolute inset-0 hidden lg:block">
          <img
            src={isDarkTheme ? industrialParkNight : industrialPark}
            alt={`${t('kombolchaName')} ${t('industrialPark')}`}
            className="absolute right-0 top-0 h-full w-[62%] object-cover object-left"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDarkTheme
                ? 'linear-gradient(to right, rgba(2,6,23,0.86) 24%, rgba(2,6,23,0.72) 35%, rgba(2,6,23,0.58) 48%, rgba(2,6,23,0.2) 58%, transparent 68%)'
                : 'linear-gradient(to right, #ffffff 30%, #ffffffee 38%, #ffffffcc 44%, #ffffff88 50%, #ffffff33 56%, transparent 65%)',
            }}
          />
          <div
            className={`absolute bottom-0 left-0 right-0 h-24 ${
              isDarkTheme
                ? 'bg-gradient-to-t from-slate-950/60 to-transparent'
                : 'bg-gradient-to-t from-white/30 to-transparent'
            }`}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-[560px]">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-[0.18em] mb-4 border px-3 py-1 rounded-full ${
                isDarkTheme
                  ? 'text-primary-300 border-primary-500/40 bg-primary-500/10'
                  : 'text-primary-600 border-primary-200 bg-primary-50'
              }`}
            >
              {t('kombolchaEthiopia')}
            </span>

            <h1
              className={`text-[2.6rem] sm:text-5xl font-bold leading-[1.15] mb-5 ${
                isDarkTheme ? 'text-white' : 'text-smoke-900'
              }`}
            >
              {t('heroTitle')}
              <br />
              {t('heroTitleFrom')}{' '}
              <span
                className={`${isDarkTheme ? 'text-primary-400' : 'text-primary-600'} relative inline-block`}
              >
                {t('kombolchaName')}
                <span
                  className={`absolute -bottom-1 left-0 right-0 h-[3px] rounded-full ${isDarkTheme ? 'bg-primary-400' : 'bg-primary-200'}`}
                />
              </span>{' '}
              {t('heroTitleFactories')}
            </h1>

            <p
              className={`text-[1.05rem] leading-relaxed mb-8 ${
                isDarkTheme ? 'text-slate-300' : 'text-smoke-500'
              }`}
            >
              {t('heroSubtitle')}
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className={`flex rounded-xl overflow-hidden border shadow-lg mb-8 max-w-[520px] ${
                isDarkTheme
                  ? 'border-slate-700 bg-slate-900'
                  : 'border-smoke-200 bg-white'
              }`}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`flex-1 px-4 py-3.5 text-sm focus:outline-none min-w-0 ${
                  isDarkTheme
                    ? 'text-white placeholder-slate-400 bg-slate-900'
                    : 'text-smoke-900 placeholder-smoke-400 bg-white'
                }`}
              />
              <div
                className={`w-px self-stretch my-2 shrink-0 ${
                  isDarkTheme ? 'bg-slate-700' : 'bg-smoke-200'
                }`}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-3.5 text-sm focus:outline-none min-w-[120px] cursor-pointer shrink-0 ${
                  isDarkTheme
                    ? 'text-slate-200 bg-slate-900'
                    : 'text-smoke-600 bg-white'
                }`}
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white text-sm font-semibold px-6 py-3.5 transition-colors shrink-0"
              >
                <Search size={15} />
                {t('searchBtn')}
              </button>
            </form>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {trustBadgeIcons.map((b) => (
                <div key={b.key} className="flex items-center gap-2.5">
                  <b.icon
                    size={15}
                    className={
                      isDarkTheme ? 'text-primary-400' : 'text-primary-600'
                    }
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold leading-snug ${isDarkTheme ? 'text-slate-100' : 'text-smoke-800'}`}
                    >
                      {t(b.key)}
                    </p>
                    <p
                      className={`text-[11px] ${isDarkTheme ? 'text-slate-400' : 'text-smoke-400'}`}
                    >
                      {t(b.subKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            FEATURED FACTORY CARD — floats over image, collapsible
        ══════════════════════════════════════════════════════ */}
        <div className="absolute bottom-5 right-5 hidden lg:block z-20 w-[270px]">
          {/* ── Toggle header — always visible ── */}
          <button
            onClick={() => setCardOpen((o) => !o)}
            className={`w-full flex items-center justify-between gap-3 backdrop-blur-md border shadow-xl rounded-2xl px-4 py-3 transition-colors group ${
              isDarkTheme
                ? 'bg-slate-950/95 border-slate-700 hover:bg-slate-900'
                : 'bg-white/90 border-smoke-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <Flame size={13} className="text-white" />
              </div>
              <div className="min-w-0 text-left">
                <p
                  className={`text-[11px] font-bold leading-tight ${isDarkTheme ? 'text-white' : 'text-smoke-900'}`}
                >
                  {t('featuredFactory')}
                </p>
                <p
                  className={`text-[10px] truncate leading-tight ${isDarkTheme ? 'text-slate-400' : 'text-smoke-400'}`}
                >
                  {fp
                    ? (fp.factory?.factory_name ?? t('loading'))
                    : t('mostSearched')}
                </p>
              </div>
            </div>
            <div
              className={`shrink-0 transition-colors ${isDarkTheme ? 'text-slate-400 group-hover:text-primary-300' : 'text-smoke-400 group-hover:text-primary-600'}`}
            >
              {cardOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </div>
          </button>

          {/* ── Expanded card body ── */}
          {cardOpen && fp && (
            <div
              className={`mt-2 backdrop-blur-md border shadow-2xl rounded-2xl overflow-hidden ${isDarkTheme ? 'bg-slate-950/95 border-slate-700' : 'bg-white/95 border-smoke-200'}`}
            >
              {/* Product image strip */}
              <div
                className={`relative h-32 ${isDarkTheme ? 'bg-slate-800' : 'bg-smoke-100'}`}
              >
                {fp.image ? (
                  <img
                    src={fp.image}
                    alt={fp.product_name || t('industrialPark')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package
                      size={28}
                      className={
                        isDarkTheme ? 'text-slate-500' : 'text-smoke-300'
                      }
                    />
                  </div>
                )}
                {/* Top-searched badge */}
                {highlight?.topKeyword && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg">
                    <Flame size={9} />
                    {t('mostSearched')}
                  </div>
                )}
                {/* Category pill */}
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  {fp.category?.category_name}
                </div>
              </div>

              <div className="p-4">
                {/* Product name + price */}
                <p
                  className={`text-sm font-bold leading-snug truncate ${isDarkTheme ? 'text-white' : 'text-smoke-900'}`}
                >
                  {fp.product_name}
                </p>
                <p
                  className={`text-sm font-bold mt-0.5 ${isDarkTheme ? 'text-primary-300' : 'text-primary-600'}`}
                >
                  ETB {Number(fp.price).toLocaleString()}
                </p>

                {/* Divider */}
                <div
                  className={`border-t my-3 ${isDarkTheme ? 'border-slate-700' : 'border-smoke-100'}`}
                />

                {/* Factory info */}
                <div className="flex items-start gap-2.5 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkTheme ? 'bg-primary-900/40 border border-primary-700' : 'bg-primary-50 border border-primary-100'}`}
                  >
                    <Factory
                      size={14}
                      className={
                        isDarkTheme ? 'text-primary-300' : 'text-primary-600'
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className={`text-xs font-bold leading-snug truncate ${isDarkTheme ? 'text-white' : 'text-smoke-900'}`}
                      >
                        {fp.factory?.factory_name}
                      </p>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isDarkTheme ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'}`}
                      >
                        <CheckCircle size={8} /> {t('verifiedLabel')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin
                        size={9}
                        className={`shrink-0 ${isDarkTheme ? 'text-slate-400' : 'text-smoke-400'}`}
                      />
                      <p
                        className={`text-[10px] truncate ${isDarkTheme ? 'text-slate-400' : 'text-smoke-400'}`}
                      >
                        {fp.factory?.location}
                      </p>
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-smoke-400'}`}
                    >
                      {t('productsListed', {
                        count: fp.factory?._count?.product ?? 0,
                      })}
                    </p>
                  </div>
                </div>

                {/* Search count context */}
                {highlight?.topKeyword && (
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 mb-3 ${isDarkTheme ? 'bg-primary-900/40' : 'bg-primary-50'}`}
                  >
                    <Flame
                      size={11}
                      className={`shrink-0 ${isDarkTheme ? 'text-primary-300' : 'text-primary-600'}`}
                    />
                    <p
                      className={`text-[10px] font-medium leading-snug ${isDarkTheme ? 'text-primary-200' : 'text-primary-700'}`}
                    >
                      {t('searchedByBuyers', {
                        keyword: highlight.topKeyword,
                        count: highlight.searchCount,
                      })}
                    </p>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/products/${fp.product_id}`}
                    className="flex items-center justify-center gap-1 bg-primary-700 hover:bg-primary-800 text-white text-[11px] font-bold py-2 rounded-xl transition-colors"
                  >
                    {t('viewProduct')} <ArrowRight size={10} />
                  </Link>
                  <Link
                    to={`/factories/${fp.factory?.factory_id}`}
                    className={`flex items-center justify-center gap-1 text-[11px] font-bold py-2 rounded-xl transition-colors ${isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-smoke-100 hover:bg-smoke-200 text-smoke-700'}`}
                  >
                    {t('factory')} <ChevronRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton when card is open and data isn't ready */}
          {cardOpen && !fp && (
            <div
              className={`mt-2 backdrop-blur-md border shadow-2xl rounded-2xl p-4 space-y-3 ${isDarkTheme ? 'bg-slate-950/95 border-slate-700' : 'bg-white/95 border-smoke-200'}`}
            >
              <div
                className={`h-28 animate-pulse rounded-xl ${isDarkTheme ? 'bg-slate-800' : 'bg-smoke-100'}`}
              />
              <div
                className={`h-3 animate-pulse rounded-full w-3/4 ${isDarkTheme ? 'bg-slate-800' : 'bg-smoke-100'}`}
              />
              <div
                className={`h-3 animate-pulse rounded-full w-1/2 ${isDarkTheme ? 'bg-slate-800' : 'bg-smoke-100'}`}
              />
            </div>
          )}
        </div>

        {/* Image caption — bottom left of image area, only when card is closed */}
        {!cardOpen && (
          <div className="absolute bottom-5 right-5 hidden lg:block z-10">
            <span className="inline-block bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
              {t('kombolchaName')} {t('industrialPark')}
            </span>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          BROWSE CATEGORIES
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-smoke-900">
                {t('browseCategories')}
              </h2>
              <p className="text-smoke-500 text-sm mt-1">
                {t('browseCategoriesDesc')}
              </p>
              <h2 className="reveal reveal-fade-up delay-100 text-3xl lg:text-4xl font-bold text-white leading-tight">
                {t('sectors_heading')}<br />{t('sectors_heading2')}
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('viewAll')} <ChevronRight size={15} />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-smoke-100 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, idx) => {
                // Alternate icon bg tints for visual variety — all within the brand palette
                const tints = [
                  'bg-primary-50 text-primary-600',
                  'bg-amber-50 text-amber-700',
                  'bg-stone-100 text-stone-600',
                  'bg-orange-50 text-orange-600',
                  'bg-yellow-50 text-yellow-700',
                  'bg-red-50 text-red-600',
                ];
                const tint = tints[idx % tints.length];
                return (
                  <Link
                    key={cat.category_id}
                    to={`/products?category=${cat.category_id}`}
                    className="group flex flex-col items-center gap-3 bg-white border border-smoke-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Package size={20} />
                    </div>
                    <p className="text-xs font-semibold text-smoke-800 text-center leading-snug">
                      {cat.category_name}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-smoke-900">
                {t('featuredProducts')}
              </h2>
              <p className="text-smoke-500 text-sm mt-1">
                {t('featuredProductsDesc')}
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('viewAll')} <ChevronRight size={15} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-smoke-100 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {featuredProducts.map(
                (product: {
                  product_id: number;
                  product_name: string;
                  price: number;
                  image: string | null;
                  factory: { factory_name: string } | null;
                }) => (
                  <Link
                    key={product.product_id}
                    to={`/products/${product.product_id}`}
                    className="group bg-white border border-smoke-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative h-36 bg-smoke-50 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={32} className="text-smoke-300" />
                        </div>
                      )}
                      {/* Wishlist hint */}
                      <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Star size={13} className="text-smoke-400" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-xs font-semibold text-smoke-900 truncate leading-snug mb-0.5">
                        {product.product_name}
                      </p>
                      <p className="text-[11px] text-smoke-400 truncate mb-2.5">
                        {product.factory?.factory_name ?? t('platformName')}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-primary-700">
                          ETB {Number(product.price).toLocaleString()}
                        </p>
                        <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center">
                          <ArrowRight size={11} className="text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

          {/* Mobile "view all" */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              {t('viewAllProducts')} <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FACTORY LOCATOR  (Nike store-finder layout)
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-smoke-900">
              {t('findAFactory')}
            </h2>
            <p className="text-smoke-500 text-sm mt-1">
              {t('verifiedFactorySummary', {
                count: mapFactories.length,
                noun: mapFactories.length === 1 ? t('factory') : t('factories'),
              })}
            </p>
          </div>

          {/*
            ONE single div — left sidebar + right map side by side.
            Exactly like the Nike store-finder reference image.
          */}
          <div
            className="overflow-hidden rounded-2xl border border-smoke-200 shadow-lg"
            style={{ height: '560px', display: 'flex' }}
          >
            {/* ── LEFT: factory list ── */}
            <div
              className="flex flex-col bg-white border-r border-smoke-100 shrink-0"
              style={{ width: '320px' }}
            >
              {/* List header */}
              <div className="px-5 py-4 border-b border-smoke-100">
                <p className="text-xs text-smoke-400 font-medium">
                  {mapFactories.length} {t('factoriesNearYou')}
                </p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto">
                {mapFactories.map(
                  (
                    f: {
                      factory_id: number;
                      factory_name: string;
                      location: string;
                      _count?: { product: number };
                    },
                    i: number
                  ) => (
                    <FactoryListItem key={f.factory_id} factory={f} index={i} />
                  )
                )}

                {mapFactories.length === 0 && (
                  <div className="px-5 py-10 text-center text-smoke-400 text-sm">
                    {t('noApprovedFactoriesYet')}
                  </div>
                )}

                {/* View all link */}
                <div className="px-5 py-5 border-t border-smoke-100">
                  <Link
                    to="/factories"
                    className="text-sm font-bold text-smoke-900 underline underline-offset-2 hover:text-primary-700 transition-colors"
                  >
                    {t('viewAllFactoriesLink')}
                  </Link>
                </div>
              </div>
            </div>

            {/* ── RIGHT: map fills remaining space ── */}
            <div className="flex-1 relative">
              <Suspense
                fallback={
                  <div className="w-full h-full bg-smoke-50 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-smoke-200 border-t-primary-700 animate-spin" />
                    <p className="text-sm text-smoke-400">{t('loading')}</p>
                  </div>
                }
              >
                {mapFactories.length > 0 ? (
                  <FactoryMap factories={mapFactories} />
                ) : (
                  <div className="w-full h-full bg-smoke-50 flex items-center justify-center">
                    <p className="text-smoke-400 text-sm">
                      {t('noFactoriesToDisplay')}
                    </p>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY KOMBOLCHA — 3-column value props
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-smoke-50 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-smoke-900 mb-2">
              {t('whyKombolcha')}
            </h2>
            <p className="text-smoke-500 text-sm max-w-xl mx-auto">
              {t('whyKombolchaDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                titleKey: 'verifiedNetwork',
                descKey: 'verifiedNetworkDesc',
                color: 'text-primary-600 bg-primary-50',
              },
              {
                icon: TrendingUp,
                titleKey: 'transparentPricing',
                descKey: 'transparentPricingDesc',
                color: 'text-amber-700 bg-amber-50',
              },
              {
                icon: ShoppingBag,
                titleKey: 'simpleCheckout',
                descKey: 'simpleCheckoutDesc',
                color: 'text-green-700 bg-green-50',
              },
            ].map((item) => (
              <div
                key={item.titleKey}
                className="bg-white rounded-2xl border border-smoke-200 p-7 hover:shadow-lg transition-shadow duration-200"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${item.color}`}
                >
                  <item.icon size={21} />
                </div>
                <h3 className="text-base font-bold text-smoke-900 mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-smoke-500 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 bg-primary-700 border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {glanceStatDefs.map((s) => (
              <div key={s.key}>
                <p className="text-3xl sm:text-4xl font-bold">{s.value}</p>
                <p className="text-primary-200 text-sm mt-1">{s.key}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER CTA + LINKS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-smoke-900 text-white">
        {/* Newsletter bar */}

        {/* Footer links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                  <Factory size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {t('kombolchaName')}
                  </p>
                  <p className="text-[11px] text-smoke-400 leading-tight">
                    {t('factoryShowcase')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-smoke-400 leading-relaxed">
                {t('footerDescription')}
              </p>
              <div className="flex gap-2 mt-5">
                {['f', 'in', '@'].map((icon) => (
                  <button
                    key={icon}
                    className="w-8 h-8 rounded-lg bg-smoke-700 hover:bg-primary-600 text-smoke-300 hover:text-white text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">
                {t('quickLinks')}
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: t('browseProducts'), to: '/products' },
                  { label: t('ourFactories'), to: '/factories' },
                  { label: t('register'), to: '/register' },
                  { label: t('login'), to: '/login' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-smoke-400 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">
                {t('support')}
              </p>
              <ul className="space-y-2.5">
                {[
                  t('helpCenter'),
                  t('howItWorks'),
                  t('contactUs'),
                  t('privacyPolicy'),
                  t('termsOfUse'),
                ].map((l) => (
                  <li key={l}>
                    <Link
                      to="/"
                      className="text-sm text-smoke-400 hover:text-white transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">
                {t('contact')}
              </p>
              <ul className="space-y-3">
                {[
                  { icon: MapPin, text: t('regionAddress') },
                  { icon: Package, text: 'info@kombolcha-showcase.com' },
                  { icon: Users, text: '+251 33 551 0000' },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-2.5 text-sm text-smoke-400"
                  >
                    <item.icon
                      size={14}
                      className="text-primary-400 mt-0.5 shrink-0"
                    />
                    {item.text}
                  </li>
                ))}

                {/* CTA buttons */}
                <li className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    className="block text-center text-xs font-bold bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('buyerLogin')}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center text-xs font-bold bg-smoke-700 hover:bg-smoke-600 text-smoke-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('registerFactory')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-smoke-700 mt-10 pt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-smoke-500">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-smoke-500">{t('madeWithCare')}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
