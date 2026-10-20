import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  MapPin,
  Layers,
  Building2,
  Package,
  Wheat,
  Truck,
  Globe,
  Phone,
  ExternalLink,
} from 'lucide-react';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'textile',
      icon: Layers,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      accent: '#92400e',
      title: t('textileInputTitle'),
      intro: t('textileInputIntro'),
      sources: [
        {
          name: t('amharaRegionalCottonFarms'),
          location: t('resourceTextileLocation1'),
          what: t('resourceTextileWhat1'),
          distance: t('resourceTextileDistance1'),
          notes: t('resourceTextileNote1'),
        },
        {
          name: t('awashValleyCottonScheme'),
          location: t('resourceTextileLocation2'),
          what: t('resourceTextileWhat2'),
          distance: t('resourceTextileDistance2'),
          notes: t('resourceTextileNote2'),
        },
        {
          name: t('importSupplementTextile'),
          location: t('resourceTextileLocation3'),
          what: t('resourceTextileWhat3'),
          distance: t('resourceTextileDistance3'),
          notes: t('resourceTextileNote3'),
        },
        {
          name: t('bahirDarTextileSuppliers'),
          location: t('resourceTextileLocation4'),
          what: t('resourceTextileWhat4'),
          distance: t('resourceTextileDistance4'),
          notes: t('resourceTextileNote4'),
        },
      ],
    },
    {
      id: 'steel',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      accent: '#1d4ed8',
      title: t('steelInputTitle'),
      intro: t('steelInputIntro'),
      sources: [
        {
          name: t('domesticScrapMetalYards'),
          location: t('resourceSteelLocation1'),
          what: t('resourceSteelWhat1'),
          distance: t('resourceSteelDistance1'),
          notes: t('resourceSteelNote1'),
        },
        {
          name: t('importedSteelBillets'),
          location: t('resourceSteelLocation2'),
          what: t('resourceSteelWhat2'),
          distance: t('resourceSteelDistance2'),
          notes: t('resourceSteelNote2'),
        },
        {
          name: t('westernEthiopiaIronDeposits'),
          location: t('resourceSteelLocation3'),
          what: t('resourceSteelWhat3'),
          distance: t('resourceSteelDistance3'),
          notes: t('resourceSteelNote3'),
        },
      ],
    },
    {
      id: 'food',
      icon: Wheat,
      color: 'bg-green-50 text-green-700 border-green-200',
      accent: '#166534',
      title: t('foodInputTitle'),
      intro: t('foodInputIntro'),
      sources: [
        {
          name: t('wolloAgriculturalBelt'),
          location: t('resourceFoodLocation1'),
          what: t('resourceFoodWhat1'),
          distance: t('resourceFoodDistance1'),
          notes: t('resourceFoodNote1'),
        },
        {
          name: t('borkenaRiverIrrigationFarms'),
          location: t('resourceFoodLocation2'),
          what: t('resourceFoodWhat2'),
          distance: t('resourceFoodDistance2'),
          notes: t('resourceFoodNote2'),
        },
        {
          name: t('ethiopiaCommodityExchange'),
          location: t('resourceFoodLocation3'),
          what: t('resourceFoodWhat3'),
          distance: t('resourceFoodDistance3'),
          notes: t('resourceFoodNote3'),
        },
        {
          name: t('livestockSupplyWolloAfar'),
          location: t('resourceFoodLocation4'),
          what: t('resourceFoodWhat4'),
          distance: t('resourceFoodDistance4'),
          notes: t('resourceFoodNote4'),
        },
      ],
    },
    {
      id: 'construction',
      icon: Package,
      color: 'bg-stone-50 text-stone-700 border-stone-200',
      accent: '#57534e',
      title: t('constructionInputTitle'),
      intro: t('constructionInputIntro'),
      sources: [
        {
          name: t('messeboCementFactory'),
          location: t('resourceConstructionLocation1'),
          what: t('resourceConstructionWhat1'),
          distance: t('resourceConstructionDistance1'),
          notes: t('resourceConstructionNote1'),
        },
        {
          name: t('mugherCementEnterprise'),
          location: t('resourceConstructionLocation2'),
          what: t('resourceConstructionWhat2'),
          distance: t('resourceConstructionDistance2'),
          notes: t('resourceConstructionNote2'),
        },
        {
          name: t('highlandBasaltQuarries'),
          location: t('resourceConstructionLocation3'),
          what: t('resourceConstructionWhat3'),
          distance: t('resourceConstructionDistance3'),
          notes: t('resourceConstructionNote3'),
        },
        {
          name: t('packagingImportTraders'),
          location: t('resourceConstructionLocation4'),
          what: t('resourceConstructionWhat4'),
          distance: t('resourceConstructionDistance4'),
          notes: t('resourceConstructionNote4'),
        },
      ],
    },
  ];

  const logistics = [
    {
      icon: Truck,
      title: t('roadTransport'),
      desc: t('roadTransportDesc'),
    },
    {
      icon: Globe,
      title: t('djiboutiPortCorridor'),
      desc: t('djiboutiPortCorridorDesc'),
    },
    {
      icon: MapPin,
      title: t('dessieHub'),
      desc: t('dessieHubDesc'),
    },
  ];

  const stats = [
    { num: '4', desc: t('mainInputSectors') },
    { num: '15+', desc: t('sourcingLocations') },
    { num: t('djiboutiCorridorDistance'), desc: t('djiboutiCorridor') },
    { num: t('local'), desc: t('localSupply') },
  ];
  return (
    <div className="bg-white text-smoke-900">
      {/* ── Header ── */}
      <section className="border-b border-smoke-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 pt-8 pb-6 text-xs text-smoke-400 font-medium">
            <Link to="/" className="hover:text-smoke-700 transition-colors">
              {t('home')}
            </Link>
            <span>/</span>
            <span className="text-smoke-600">{t('sources')}</span>
          </div>

          <div className="pb-10">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-5 h-px bg-primary-600" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
                {t('rawMaterialGuide')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
              <div>
                <h1 className="text-[3rem] sm:text-[3.8rem] font-bold leading-[1.05] text-smoke-900 mb-5 tracking-tight">
                  {t('resourcesTitle')}
                </h1>
                <p className="text-smoke-500 text-base leading-relaxed max-w-xl">
                  {t('resourcesSubtitle')}
                </p>
              </div>
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

            <div className="mt-8 h-px bg-smoke-100" />

            <div className="flex flex-wrap gap-x-10 gap-y-3 mt-6">
              {stats.map((s) => (
                <div key={s.desc}>
                  <span className="text-sm font-bold text-smoke-900">
                    {s.num}
                  </span>
                  <span className="text-sm text-smoke-400 ml-1.5">
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Logistics strip ── */}
      <section className="border-b border-smoke-100 bg-smoke-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {logistics.map((l) => (
              <div key={l.title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <l.icon size={16} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-smoke-900">{l.title}</p>
                  <p className="text-xs text-smoke-500 mt-0.5 leading-relaxed">
                    {l.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category sections ── */}
      {categories.map((cat, ci) => (
        <section
          key={cat.id}
          className={`py-14 border-b border-smoke-100 ${ci % 2 === 1 ? 'bg-smoke-50' : 'bg-white'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category header */}
            <div className="flex items-start gap-4 mb-8">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${cat.color}`}
              >
                <cat.icon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-smoke-900">
                  {cat.title}
                </h2>
                <p className="text-sm text-smoke-500 mt-1 max-w-2xl leading-relaxed">
                  {cat.intro}
                </p>
              </div>
            </div>

            {/* Source cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {cat.sources.map((src) => (
                <div
                  key={src.name}
                  className="bg-white border border-smoke-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Source name + distance pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-smoke-900 text-sm leading-snug">
                      {src.name}
                    </h3>
                    <span className="text-[10px] font-bold bg-smoke-100 text-smoke-600 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                      {src.distance}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={11} className="text-smoke-400 shrink-0" />
                    <p className="text-xs text-smoke-500">{src.location}</p>
                  </div>

                  {/* What they supply */}
                  <div className="flex items-start gap-1.5 mb-3">
                    <Package
                      size={11}
                      className="text-smoke-400 shrink-0 mt-0.5"
                    />
                    <p className="text-xs font-semibold text-smoke-700">
                      {src.what}
                    </p>
                  </div>

                  {/* Notes */}
                  <p className="text-xs text-smoke-500 leading-relaxed border-t border-smoke-100 pt-3">
                    {src.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── How to find suppliers ── */}
      <section className="py-14 bg-white border-b border-smoke-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-smoke-900 mb-2">
            {t('howToConnect')}
          </h2>
          <p className="text-smoke-500 text-sm mb-8 max-w-2xl">
            {t('howToConnectDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: t('ecxTitle'),
                desc: t('ecxDesc'),
                link: 'https://www.ecx.com.et',
              },
              {
                title: t('dessieMarketTitle'),
                desc: t('dessieMarketDesc'),
                link: null,
              },
              {
                title: t('eicTitle'),
                desc: t('eicDesc'),
                link: 'https://www.ethiopiainvestment.gov.et',
              },
              {
                title: t('unidoTitle'),
                desc: t('unidoDesc'),
                link: 'https://www.unido.org/where-we-work/africa/ethiopia',
              },
              {
                title: t('djiboutiShippingTitle'),
                desc: t('djiboutiShippingDesc'),
                link: null,
              },
              {
                title: t('platformResourceTitle'),
                desc: t('platformResourceDesc'),
                link: '/factories',
                internal: true,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-smoke-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white"
              >
                <h3 className="font-bold text-smoke-900 text-sm mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-smoke-500 leading-relaxed mb-3">
                  {item.desc}
                </p>
                {item.link &&
                  (item.internal ? (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      {t('viewFactories')} <ChevronRight size={11} />
                    </Link>
                  ) : (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      {t('visitWebsite')} <ExternalLink size={11} />
                    </a>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
