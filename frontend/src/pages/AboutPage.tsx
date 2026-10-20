import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Factory,
  Package,
  Users,
  TrendingUp,
  Globe,
  ChevronRight,
  Building2,
  Layers,
  Award,
} from 'lucide-react';

// ─── Data (sourced from Wikipedia, Xinhua, World Bank, UNIDO, Scribd) ────────

const keyFacts = [
  { icon: MapPin, label: 'location', valueKey: 'aboutLocationValue' },
  { icon: Globe, label: 'coordinates', valueKey: 'aboutCoordinatesValue' },
  { icon: Users, label: 'population', valueKey: 'aboutPopulationValue' },
  { icon: Factory, label: 'distance', valueKey: 'aboutDistanceValue' },
];

const industrialStats = [
  {
    value: '52',
    label: 'factoryShedsInKip',
    color: 'bg-primary-50 text-primary-700',
  },
  {
    value: '27,000+',
    label: 'directJobsCreated',
    color: 'bg-green-50  text-green-700',
  },
  {
    value: '$90M',
    label: 'kipConstructionInvestment',
    color: 'bg-blue-50   text-blue-700',
    valueKey: 'kipInvestmentValue',
  },
  {
    value: '1984',
    label: 'kombolchaTextileEst',
    color: 'bg-amber-50  text-amber-700',
  },
];

const sectors = [
  {
    icon: Layers,
    titleKey: 'textileAndGarment',
    descKey: 'textileAndGarmentDesc',
  },
  {
    icon: Building2,
    titleKey: 'steelAndMetalWorks',
    descKey: 'steelAndMetalWorksDesc',
  },
  {
    icon: Package,
    titleKey: 'foodAndBeverage',
    descKey: 'foodAndBeverageDesc',
  },
  {
    icon: TrendingUp,
    titleKey: 'lightManufacturing',
    descKey: 'lightManufacturingDesc',
  },
];

const timeline = [
  { year: '1970s', eventKey: 'timeline1970s' },
  { year: '1984', eventKey: 'timeline1984' },
  { year: '2017', eventKey: 'timeline2017' },
  { year: '2020', eventKey: 'timeline2020' },
  { year: '2026', eventKey: 'timeline2026' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-white text-smoke-900">
      {/* ── Hero — no image, clean editorial header ── */}
      <section className="border-b border-smoke-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 pt-8 pb-6 text-xs text-smoke-400 font-medium">
            <Link to="/" className="hover:text-smoke-700 transition-colors">
              {t('home')}
            </Link>
            <span>/</span>
            <span className="text-smoke-600">{t('aboutKombolcha')}</span>
          </div>

          {/* Main heading block */}
          <div className="pb-10">
            {/* Location tag */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-5 h-px bg-primary-600" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
                {t('amharaEthiopia')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
              {/* Left: headline + sub */}
              <div>
                <h1 className="text-[3rem] sm:text-[3.8rem] font-bold leading-[1.05] text-smoke-900 mb-5 tracking-tight">
                  {t('aboutWord')}
                  <br />
                  <span className="text-primary-700">{t('kombolchaName')}</span>
                </h1>
                <p className="text-smoke-500 text-base leading-relaxed max-w-xl">
                  {t('aboutSubtitle')}
                </p>
              </div>

              {/* Right: quick CTA buttons */}
              <div className="flex flex-col gap-2 shrink-0 pb-1">
                <Link
                  to="/factories"
                  className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  {t('exploreFactories')} <ChevronRight size={14} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 border border-smoke-200 hover:border-smoke-300 hover:bg-smoke-50 text-smoke-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  {t('browseProducts')}
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px bg-smoke-100" />

            {/* Quick inline stats row */}
            <div className="flex flex-wrap gap-x-10 gap-y-3 mt-6">
              {[
                { numKey: 'aboutDistanceStatValue', descKey: 'fromAddisAbaba' },
                { numKey: 'aboutElevationStatValue', descKey: 'elevation' },
                { num: '130,000+', descKey: 'populationShort' },
                { numKey: 'aboutSinceStatValue', descKey: 'industrialHistory' },
                {
                  numKey: 'industrialParkStatValue',
                  descKey: 'industrialParkOpened',
                },
              ].map((s) => (
                <div key={s.descKey}>
                  <span className="text-sm font-bold text-smoke-900">
                    {s.numKey ? t(s.numKey) : s.num}
                  </span>
                  <span className="text-sm text-smoke-400 ml-1.5">
                    {t(s.descKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Key facts strip ── */}
      <section className="border-b border-smoke-100 bg-smoke-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {keyFacts.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon size={16} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-smoke-400">
                    {t(f.label.toLowerCase())}
                  </p>
                  <p className="text-sm font-semibold text-smoke-800 mt-0.5 leading-snug">
                    {t(f.valueKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City overview ── */}
      <section className="py-14 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold text-smoke-900 mb-4">
                {t('ethiopiasIndustrialHeartland')}
              </h2>
              <div className="space-y-4 text-smoke-600 leading-relaxed text-[15px]">
                <p>{t('aboutCityIntro1')}</p>
                <p>{t('aboutCityIntro2')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('aboutCityIntro3') }} />
                <p>{t('aboutCityIntro4')}</p>
              </div>
            </div>

            {/* Industrial stats */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-smoke-900">
                {t('industrialParkAtGlance')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {industrialStats.map((s) => (
                  <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                    <p className="text-3xl font-bold leading-none mb-1">
                      {s.valueKey ? t(s.valueKey) : s.value}
                    </p>
                    <p className="text-xs font-medium leading-snug opacity-80">
                      {t(s.label)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-smoke-200 p-5 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-primary-600" />
                  <p className="text-sm font-bold text-smoke-900">
                    {t('whyKombolchaQ')}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-smoke-600">
                  {[
                    'strategicAccess',
                    'competitiveLabour',
                    'governmentIncentives',
                    'experiencedWorkforce',
                    'proximityToRawMaterials',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Industry sectors ── */}
      <section className="py-14 bg-smoke-50 border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-smoke-900">
              {t('keyIndustrySectors')}
            </h2>
            <p className="text-smoke-500 text-sm mt-1">
              {t('keyIndustrySectorsDesc')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sectors.map((s) => (
              <div
                key={s.titleKey}
                className="bg-white border border-smoke-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <s.icon size={19} className="text-primary-600" />
                  </div>
                  <h3 className="font-bold text-smoke-900">{t(s.titleKey)}</h3>
                </div>
                <p className="text-sm text-smoke-600 leading-relaxed">
                  {t(s.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-14 border-b border-smoke-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-smoke-900 mb-8">
            {t('industrialHistory')}
          </h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-smoke-200" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6">
                  {/* Year badge */}
                  <div className="w-[52px] shrink-0 flex flex-col items-center pt-0.5">
                    <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center z-10 relative shrink-0">
                      <span className="text-[9px] font-bold text-white leading-none text-center">
                        {item.year}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-bold text-smoke-900 mb-1">
                      {item.year}
                    </p>
                    <p className="text-sm text-smoke-600 leading-relaxed">
                      {t(item.eventKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
