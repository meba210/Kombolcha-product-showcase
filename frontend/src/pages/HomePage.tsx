import { useState, lazy, Suspense } from 'react';
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
import { useAuthStore } from '../store/authStore';
import BuyerLandingPage from '../pages/BuyerLandingPage';
import api from '../lib/api';
import industrialPark from '../assets/industrial-park.jpg';

// Lazy-load the map so Leaflet doesn't bloat the initial bundle
const FactoryMap = lazy(() => import('../components/FactoryMap'));

// ─── Static data ──────────────────────────────────────────────────────────────

const trustBadges = [
  { icon: CheckCircle, label: 'Verified Factories', sub: 'Trusted & Reviewed' },
  { icon: Shield,       label: 'Quality Products',  sub: 'High Standards'      },
  { icon: MapPin,       label: 'Made in Ethiopia',  sub: 'Proudly Local'       },
];

const glanceStats = [
  { icon: Factory,    value: '150+',    label: 'Factories'     },
  { icon: Package,    value: '2,500+',  label: 'Products'      },
  { icon: Users,      value: '10,000+', label: 'Jobs Created'  },
  { icon: ShoppingBag,value: '1,200+',  label: 'Global Buyers' },
];

// ─── Factory list item (Nike-style) ──────────────────────────────────────────

interface FactoryItemProps {
  factory: { factory_id: number; factory_name: string; location: string; _count?: { product: number } };
  index: number;
}

function FactoryListItem({ factory, index }: FactoryItemProps) {
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
          <p className="text-xs text-smoke-500 mt-1 leading-snug">{factory.location}</p>
          {factory._count !== undefined && (
            <p className="text-xs text-smoke-400 mt-0.5">
              {factory._count.product} products
            </p>
          )}
          <p className="text-xs font-semibold text-green-600 mt-1.5">
            Verified · Open
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
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cardOpen, setCardOpen] = useState(false);

  if (user?.role === 'BUYER') return <BuyerLandingPage />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-nav'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?limit=5').then((r) => r.data),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: highlightsData } = useQuery({
    queryKey: ['public-highlights'],
    queryFn: () => api.get('/reports/highlights').then((r) => r.data),
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-map'],
    queryFn: () => api.get('/factories').then((r) => r.data),
  });

  const categories: { category_id: number; category_name: string }[] = categoriesData?.categories ?? [];
  const featuredProducts = productsData?.products ?? [];
  const highlight = highlightsData;
  const fp = highlight?.featuredProduct ?? null;
  const mapFactories = factoriesData?.factories ?? [];

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
            src={industrialPark}
            alt="Kombolcha Industrial Park"
            className="absolute right-0 top-0 h-full w-[62%] object-cover object-left"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, #ffffff 30%, #ffffffee 38%, #ffffffcc 44%, #ffffff88 50%, #ffffff33 56%, transparent 65%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/30 to-transparent" />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-[560px]">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary-600 mb-4 border border-primary-200 bg-primary-50 px-3 py-1 rounded-full">
              Kombolcha, Ethiopia
            </span>

            <h1 className="text-[2.6rem] sm:text-5xl font-bold leading-[1.15] text-smoke-900 mb-5">
              Discover Quality Products<br />
              From{' '}
              <span className="text-primary-600 relative inline-block">
                Kombolcha
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary-200 rounded-full" />
              </span>{' '}
              Factories
            </h1>

            <p className="text-smoke-500 text-[1.05rem] leading-relaxed mb-8">
              Connecting local manufacturers with global opportunities.
              Explore verified factories and their quality products.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex rounded-xl overflow-hidden border border-smoke-200 shadow-lg bg-white mb-8 max-w-[520px]"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, factories..."
                className="flex-1 px-4 py-3.5 text-sm text-smoke-900 placeholder-smoke-400 focus:outline-none bg-white min-w-0"
              />
              <div className="w-px bg-smoke-200 self-stretch my-2 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-3.5 text-sm text-smoke-600 bg-white focus:outline-none min-w-[120px] cursor-pointer shrink-0"
              >
                <option value="">All Categories</option>
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
                Search
              </button>
            </form>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {trustBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <b.icon size={15} className="text-primary-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-smoke-800 leading-snug">{b.label}</p>
                    <p className="text-[11px] text-smoke-400">{b.sub}</p>
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
            className="w-full flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-smoke-200 shadow-xl rounded-2xl px-4 py-3 hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <Flame size={13} className="text-white" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-bold text-smoke-900 leading-tight">Featured Factory</p>
                <p className="text-[10px] text-smoke-400 truncate leading-tight">
                  {fp ? fp.factory?.factory_name ?? 'Loading…' : 'Most searched'}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-smoke-400 group-hover:text-primary-600 transition-colors">
              {cardOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </div>
          </button>

          {/* ── Expanded card body ── */}
          {cardOpen && fp && (
            <div className="mt-2 bg-white/95 backdrop-blur-md border border-smoke-200 shadow-2xl rounded-2xl overflow-hidden">

              {/* Product image strip */}
              <div className="relative h-32 bg-smoke-100">
                {fp.image ? (
                  <img
                    src={fp.image}
                    alt={fp.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={28} className="text-smoke-300" />
                  </div>
                )}
                {/* Top-searched badge */}
                {highlight?.topKeyword && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary-700/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg">
                    <Flame size={9} />
                    Most Searched
                  </div>
                )}
                {/* Category pill */}
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  {fp.category?.category_name}
                </div>
              </div>

              <div className="p-4">
                {/* Product name + price */}
                <p className="text-sm font-bold text-smoke-900 leading-snug truncate">
                  {fp.product_name}
                </p>
                <p className="text-sm font-bold text-primary-600 mt-0.5">
                  ETB {Number(fp.price).toLocaleString()}
                </p>

                {/* Divider */}
                <div className="border-t border-smoke-100 my-3" />

                {/* Factory info */}
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center shrink-0">
                    <Factory size={14} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-smoke-900 leading-snug truncate">
                        {fp.factory?.factory_name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle size={8} /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={9} className="text-smoke-400 shrink-0" />
                      <p className="text-[10px] text-smoke-400 truncate">{fp.factory?.location}</p>
                    </div>
                    <p className="text-[10px] text-smoke-400 mt-0.5">
                      {fp.factory?._count?.product ?? 0} products listed
                    </p>
                  </div>
                </div>

                {/* Search count context */}
                {highlight?.topKeyword && (
                  <div className="flex items-center gap-1.5 bg-primary-50 rounded-lg px-3 py-2 mb-3">
                    <Flame size={11} className="text-primary-600 shrink-0" />
                    <p className="text-[10px] text-primary-700 font-medium leading-snug">
                      "{highlight.topKeyword}" searched{' '}
                      <span className="font-bold">{highlight.searchCount}×</span> by buyers
                    </p>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/products/${fp.product_id}`}
                    className="flex items-center justify-center gap-1 bg-primary-700 hover:bg-primary-800 text-white text-[11px] font-bold py-2 rounded-xl transition-colors"
                  >
                    View Product <ArrowRight size={10} />
                  </Link>
                  <Link
                    to={`/factories/${fp.factory?.factory_id}`}
                    className="flex items-center justify-center gap-1 bg-smoke-100 hover:bg-smoke-200 text-smoke-700 text-[11px] font-bold py-2 rounded-xl transition-colors"
                  >
                    Factory <ChevronRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton when card is open and data isn't ready */}
          {cardOpen && !fp && (
            <div className="mt-2 bg-white/95 backdrop-blur-md border border-smoke-200 shadow-2xl rounded-2xl p-4 space-y-3">
              <div className="h-28 bg-smoke-100 animate-pulse rounded-xl" />
              <div className="h-3 bg-smoke-100 animate-pulse rounded-full w-3/4" />
              <div className="h-3 bg-smoke-100 animate-pulse rounded-full w-1/2" />
            </div>
          )}
        </div>

        {/* Image caption — bottom left of image area, only when card is closed */}
        {!cardOpen && (
          <div className="absolute bottom-5 right-5 hidden lg:block z-10">
            <span className="inline-block bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
              Kombolcha Industrial Park
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
              <h2 className="text-2xl font-bold text-smoke-900">Browse Categories</h2>
              <p className="text-smoke-500 text-sm mt-1">Find products from the most requested industrial categories.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-smoke-100 animate-pulse rounded-2xl" />
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
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint} group-hover:scale-110 transition-transform duration-200`}>
                      <Package size={20} />
                    </div>
                    <p className="text-xs font-semibold text-smoke-800 text-center leading-snug">{cat.category_name}</p>
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
              <h2 className="text-2xl font-bold text-smoke-900">Featured Products</h2>
              <p className="text-smoke-500 text-sm mt-1">Top industrial goods ready for your order.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-64 bg-smoke-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {featuredProducts.map((product: {
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
                      {product.factory?.factory_name ?? 'Kombolcha Platform'}
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
              ))}
            </div>
          )}

          {/* Mobile "view all" */}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all products <ChevronRight size={15} />
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
            <h2 className="text-2xl font-bold text-smoke-900">Find a Factory</h2>
            <p className="text-smoke-500 text-sm mt-1">
              {mapFactories.length} verified{' '}
              {mapFactories.length === 1 ? 'factory' : 'factories'} at Kombolcha Industrial Park
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
                  {mapFactories.length} Factories Near You
                </p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto">
                {mapFactories.map((f: { factory_id: number; factory_name: string; location: string; _count?: { product: number } }, i: number) => (
                  <FactoryListItem
                    key={f.factory_id}
                    factory={f}
                    index={i}
                  />
                ))}

                {mapFactories.length === 0 && (
                  <div className="px-5 py-10 text-center text-smoke-400 text-sm">
                    No approved factories yet.
                  </div>
                )}

                {/* View all link */}
                <div className="px-5 py-5 border-t border-smoke-100">
                  <Link
                    to="/factories"
                    className="text-sm font-bold text-smoke-900 underline underline-offset-2 hover:text-primary-700 transition-colors"
                  >
                    View All Factories
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
                    <p className="text-sm text-smoke-400">Loading map…</p>
                  </div>
                }
              >
                {mapFactories.length > 0 ? (
                  <FactoryMap factories={mapFactories} />
                ) : (
                  <div className="w-full h-full bg-smoke-50 flex items-center justify-center">
                    <p className="text-smoke-400 text-sm">No factories to display yet.</p>
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
            <h2 className="text-2xl font-bold text-smoke-900 mb-2">Why Kombolcha Showcase?</h2>
            <p className="text-smoke-500 text-sm max-w-xl mx-auto">
              A purpose-built marketplace connecting Ethiopia's industrial heartland with buyers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: 'Verified Supplier Network',
                desc: 'Every factory is reviewed and approved before listing products on the platform.',
                color: 'text-primary-600 bg-primary-50',
              },
              {
                icon: TrendingUp,
                title: 'Transparent Pricing',
                desc: 'Direct factory prices in Ethiopian Birr. No hidden fees, no middlemen.',
                color: 'text-amber-700 bg-amber-50',
              },
              {
                icon: ShoppingBag,
                title: 'Simple Checkout',
                desc: 'Secure Chapa payment integration. One cart, one payment, every seller covered.',
                color: 'text-green-700 bg-green-50',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-smoke-200 p-7 hover:shadow-lg transition-shadow duration-200">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${item.color}`}>
                  <item.icon size={21} />
                </div>
                <h3 className="text-base font-bold text-smoke-900 mb-2">{item.title}</h3>
                <p className="text-sm text-smoke-500 leading-relaxed">{item.desc}</p>
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
            {glanceStats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold">{s.value}</p>
                <p className="text-primary-200 text-sm mt-1">{s.label}</p>
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
                  <p className="text-sm font-bold text-white leading-tight">Kombolcha</p>
                  <p className="text-[11px] text-smoke-400 leading-tight">Factory Showcase</p>
                </div>
              </div>
              <p className="text-sm text-smoke-400 leading-relaxed">
                Connecting Kombolcha's industrial manufacturers with buyers through a trusted digital marketplace.
              </p>
              <div className="flex gap-2 mt-5">
                {['f', 'in', '@'].map((icon) => (
                  <button key={icon} className="w-8 h-8 rounded-lg bg-smoke-700 hover:bg-primary-600 text-smoke-300 hover:text-white text-xs font-bold flex items-center justify-center transition-colors">
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">Quick Links</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Browse Products', to: '/products' },
                  { label: 'Our Factories',   to: '/factories' },
                  { label: 'Register',        to: '/register'  },
                  { label: 'Login',           to: '/login'     },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-smoke-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">Support</p>
              <ul className="space-y-2.5">
                {['Help Center', 'How It Works', 'Contact Us', 'Privacy Policy', 'Terms of Use'].map((l) => (
                  <li key={l}>
                    <Link to="/" className="text-sm text-smoke-400 hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-smoke-400 mb-4">Contact</p>
              <ul className="space-y-3">
                {[
                  { icon: MapPin,  text: 'Kombolcha, Amhara, Ethiopia' },
                  { icon: Package, text: 'info@kombolcha-showcase.com' },
                  { icon: Users,   text: '+251 33 551 0000'             },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2.5 text-sm text-smoke-400">
                    <item.icon size={14} className="text-primary-400 mt-0.5 shrink-0" />
                    {item.text}
                  </li>
                ))}

                {/* CTA buttons */}
                <li className="pt-2 space-y-2">
                  <Link to="/login" className="block text-center text-xs font-bold bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Buyer Login
                  </Link>
                  <Link to="/register" className="block text-center text-xs font-bold bg-smoke-700 hover:bg-smoke-600 text-smoke-300 px-4 py-2 rounded-lg transition-colors">
                    Register Your Factory
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-smoke-700 mt-10 pt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-smoke-500">© 2024 Kombolcha Factory Showcase. All rights reserved.</p>
            <p className="text-xs text-smoke-500">Made with care in Ethiopia</p>
          </div>
        </div>
      </section>
    </div>
  );
}
