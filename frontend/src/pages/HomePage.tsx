<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';
import BuyerLandingPage from '../pages/BuyerLandingPage';
<<<<<<< HEAD
import factoryImg from '../assets/factory.jpg';

const staggerDelay = ['delay-100','delay-200','delay-300','delay-400','delay-500','delay-600'];
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91

export default function HomePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
<<<<<<< HEAD

  const heroRef    = useScrollReveal(0.1);
  const statsRef   = useScrollReveal(0.2);
  const sectorRef  = useScrollReveal(0.1);
  const processRef = useScrollReveal(0.1);
  const trustRef   = useScrollReveal(0.1);
  const ctaRef     = useScrollReveal(0.2);

  if (user?.role === 'BUYER') return <BuyerLandingPage />;

  const stats = [
    { value: '120+',   label: t('stat_suppliers') },
    { value: '1,200+', label: t('stat_products')  },
    { value: '8',      label: t('stat_sectors')   },
    { value: '4,000+', label: t('stat_buyers')    },
  ];

  const sectors = [
    { name: t('sector_textiles'),     icon: '🧵', count: t('sector_textiles_count')     },
    { name: t('sector_steel'),        icon: '⚙️', count: t('sector_steel_count')        },
    { name: t('sector_food'),         icon: '🌾', count: t('sector_food_count')         },
    { name: t('sector_construction'), icon: '🏗️', count: t('sector_construction_count') },
    { name: t('sector_packaging'),    icon: '📦', count: t('sector_packaging_count')    },
    { name: t('sector_chemical'),     icon: '🧪', count: t('sector_chemical_count')     },
  ];

  const process = [
    { step: '01', title: t('step1_title'), desc: t('step1_desc') },
    { step: '02', title: t('step2_title'), desc: t('step2_desc') },
    { step: '03', title: t('step3_title'), desc: t('step3_desc') },
  ];

  const trust = [
    t('trust_item1'), t('trust_item2'), t('trust_item3'), t('trust_item4'),
  ];

  return (
    <div className="bg-smoke-900 text-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="relative min-h-screen flex flex-col justify-center"
      >
        <div className="absolute inset-0">
          <img src={factoryImg} alt="Kombolcha factory" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-smoke-900/80" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(-55deg, #7f4d33 0px, #7f4d33 1px, transparent 1px, transparent 60px)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-4xl">
            <div className="reveal reveal-fade-in flex items-center gap-3 mb-8">
              <span className="block w-10 h-px bg-primary-400" />
              <span className="text-primary-300 text-xs font-semibold uppercase tracking-[0.25em]">
                {t('hero_eyebrow')}
              </span>
            </div>

            <h1 className="reveal reveal-fade-up delay-200 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
              {t('hero_headline_line1')}
              <br />
              <span className="text-primary-400">{t('hero_headline_line2')}</span>
            </h1>

            <p className="reveal reveal-fade-up delay-300 text-lg sm:text-xl text-smoke-300 max-w-2xl leading-relaxed mb-12">
              {t('hero_sub')}
            </p>

            <div className="reveal reveal-fade-up delay-400 flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-base"
              >
                {t('hero_cta_browse')} <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-base backdrop-blur-sm"
              >
                {t('hero_cta_register')} <ArrowUpRight size={18} />
              </Link>
=======
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

  const categories: { category_id: number; category_name: string }[] =
    categoriesData?.categories ?? [];
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-widest uppercase">{t('hero_scroll')}</span>
          <div className="w-px h-10 bg-white animate-pulse" />
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <section ref={statsRef as React.RefObject<HTMLElement>} className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-500">
            {stats.map((s, i) => (
              <div key={i} className={`reveal reveal-scale ${staggerDelay[i]} py-8 px-6 text-center`}>
                <p className="text-3xl lg:text-4xl font-bold text-white">{s.value}</p>
                <p className="text-primary-200 text-sm mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORS GRID ─────────────────────────────────────────────── */}
      <section ref={sectorRef as React.RefObject<HTMLElement>} className="bg-smoke-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="reveal reveal-fade-in text-primary-400 text-xs font-semibold uppercase tracking-[0.25em] mb-3">
                {t('sectors_eyebrow')}
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
              </p>
              <h2 className="reveal reveal-fade-up delay-100 text-3xl lg:text-4xl font-bold text-white leading-tight">
                {t('sectors_heading')}<br />{t('sectors_heading2')}
              </h2>
            </div>
            <Link
              to="/products"
<<<<<<< HEAD
              className="reveal reveal-fade-in delay-200 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 hover:text-primary-200 transition-colors group"
            >
              {t('sectors_link')}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-smoke-700">
            {sectors.map((sector, i) => (
              <Link
                key={i}
                to="/products"
                className={`reveal reveal-fade-up ${staggerDelay[i]} group bg-smoke-800 hover:bg-smoke-700 p-8 transition-colors duration-200 flex flex-col gap-4`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{sector.icon}</span>
                  <ArrowUpRight size={18} className="text-smoke-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{sector.name}</p>
                  <p className="text-smoke-400 text-sm mt-1">{sector.count}</p>
                </div>
                <div className="h-px bg-smoke-700 group-hover:bg-primary-600 transition-colors mt-auto" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section ref={processRef as React.RefObject<HTMLElement>} className="bg-smoke-900 py-24 border-t border-smoke-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <p className="reveal reveal-fade-in text-primary-400 text-xs font-semibold uppercase tracking-[0.25em] mb-3">
              {t('how_eyebrow')}
            </p>
            <h2 className="reveal reveal-fade-up delay-100 text-3xl lg:text-4xl font-bold text-white">
              {t('how_heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-px bg-smoke-800">
            {process.map((p, i) => (
              <div key={i} className={`reveal reveal-fade-up ${staggerDelay[i + 1]} bg-smoke-900 p-10 relative`}>
                <span className="block text-7xl font-black text-smoke-800 leading-none mb-6 select-none">{p.step}</span>
                <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-smoke-400 leading-relaxed text-sm">{p.desc}</p>
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ── TRUST SPLIT SECTION ──────────────────────────────────────── */}
      <section ref={trustRef as React.RefObject<HTMLElement>} className="bg-smoke-800 py-24 border-t border-smoke-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="reveal reveal-slide-left text-primary-400 text-xs font-semibold uppercase tracking-[0.25em] mb-3">
                {t('trust_eyebrow')}
              </p>
              <h2 className="reveal reveal-slide-left delay-100 text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
                {t('trust_heading')}<br />{t('trust_heading2')}
              </h2>
              <ul className="space-y-4">
                {trust.map((item, i) => (
                  <li key={i} className={`reveal reveal-slide-left ${staggerDelay[i + 1]} flex items-start gap-3`}>
                    <CheckCircle2 size={20} className="text-primary-400 shrink-0 mt-0.5" />
                    <span className="text-smoke-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="reveal reveal-slide-left delay-600 flex gap-4 mt-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  {t('trust_cta_register')} <ArrowRight size={16} />
                </Link>
                <Link
                  to="/factories"
                  className="inline-flex items-center gap-2 text-smoke-300 hover:text-white font-semibold px-6 py-3 rounded-lg border border-smoke-700 hover:border-smoke-500 transition-colors text-sm"
                >
                  {t('trust_cta_factories')}
                </Link>
              </div>
            </div>

            <div className="reveal reveal-slide-right delay-200 relative">
              <div className="absolute -top-4 -left-4 w-full h-full border border-primary-700 rounded-2xl" />
              <img src={factoryImg} alt="Kombolcha factory floor" className="relative w-full h-72 lg:h-96 object-cover rounded-2xl" />
              <div className="absolute -bottom-5 -right-5 bg-primary-600 rounded-xl px-5 py-4 shadow-xl">
                <p className="text-white font-bold text-2xl">4K+</p>
                <p className="text-primary-200 text-xs font-medium">{t('trust_badge_label')}</p>
              </div>
            </div>
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ── CTA FOOTER BAND ──────────────────────────────────────────── */}
      <section ref={ctaRef as React.RefObject<HTMLElement>} className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal reveal-fade-up text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('cta_heading')}
          </h2>
          <p className="reveal reveal-fade-up delay-100 text-primary-200 text-base mb-10 max-w-xl mx-auto">
            {t('cta_sub')}
          </p>
          <div className="reveal reveal-fade-up delay-200 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-lg transition-colors text-base"
            >
              {t('cta_start')} <ArrowRight size={18} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-4 rounded-lg border border-primary-500 transition-colors text-base"
            >
              {t('cta_browse')}
            </Link>
=======
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
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
          </div>
        </div>
      </section>

    </div>
  );
}
