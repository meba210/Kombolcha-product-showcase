import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';
import BuyerLandingPage from '../pages/BuyerLandingPage';
import factoryImg from '../assets/factory.jpg';

const staggerDelay = ['delay-100','delay-200','delay-300','delay-400','delay-500','delay-600'];

export default function HomePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

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
            </div>
          </div>
        </div>

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
              </p>
              <h2 className="reveal reveal-fade-up delay-100 text-3xl lg:text-4xl font-bold text-white leading-tight">
                {t('sectors_heading')}<br />{t('sectors_heading2')}
              </h2>
            </div>
            <Link
              to="/products"
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
              </div>
            ))}
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

    </div>
  );
}
