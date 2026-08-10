import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import BuyerLandingPage from '../pages/BuyerLandingPage';
import factory from '../assets/factory.jpg';

const heroImageUrl =
  'https://images.unsplash.com/photo-1542831382-3a7f4dbac9f9?auto=format&fit=crop&w=1600&q=80';

const stats = [
  { label: 'Trusted Suppliers', value: '120+' },
  { label: 'Available Products', value: '1.2K+' },
  { label: 'Categories', value: '8' },
  { label: 'Happy Buyers', value: '4K+' },
];

const categories = [
  { title: 'Textiles', icon: '🧵' },
  { title: 'Steel', icon: '⚙️' },
  { title: 'Food', icon: '🌾' },
  { title: 'Construction', icon: '🏗️' },
  { title: 'Packaging', icon: '📦' },
];

const featuredProducts = [
  { title: 'Industrial Fabric Roll', category: 'Textiles' },
  { title: 'Structural Steel Beam', category: 'Steel' },
  { title: 'Organic Sesame Oil', category: 'Food' },
  { title: 'Cement Bags', category: 'Construction' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (user?.role === 'BUYER') {
    return <BuyerLandingPage />;
  }

  return (
    <div className="bg-dust-50 text-smoke-900">
      <section className="relative overflow-hidden bg-dust-50 text-smoke-900">
        <div className="absolute inset-0 bg-dust-100/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: text content */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-dust-300 rounded-full px-4 py-2 mb-6 text-sm text-smoke-700 backdrop-blur-sm">
                <Sparkles size={16} className="text-smoke-700" />
                AI-Powered searching for industrial buyers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-smoke-900">
                Kombolcha Industrial Marketplace
              </h1>
              <p className="text-lg sm:text-xl text-smoke-700 mb-8 max-w-2xl leading-relaxed">
                Discover trusted local suppliers across textiles, steel, food,
                and construction. Fast searches, simple checkout, and a fresh
                buyer experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn-primary px-6 py-3 text-base flex items-center gap-2"
                >
                  Browse Products <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                  Buyer login
                </Link>
              </div>
            </div>

            {/* Right: floating factory image */}
            <div
              className="flex-1 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ animation: 'floatUpDown 4s ease-in-out infinite' }}
            >
              <img
                src={factory}
                alt="Industrial factory"
                className="w-full h-72 lg:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-smoke-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {stat.value}
                </p>
                <p className="text-sm text-smoke-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-smoke-900">
              Browse by category
            </h2>
            <p className="text-smoke-600 mt-2">
              Choose from the most requested industrial categories in Kombolcha.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Explore all products
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.title}
              className="card p-5 text-center hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-dust-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl">
                {category.icon}
              </div>
              <p className="font-semibold text-smoke-900">{category.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-smoke-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-smoke-900">
                Featured products
              </h2>
              <p className="text-smoke-600 mt-2">
                A quick selection of top industrial goods ready for your order.
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all products
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.title}
                className="card p-5 border-smoke-200 hover:shadow-lg transition-shadow duration-200"
              >
                <p className="text-xs uppercase tracking-[0.2em] mb-2 text-smoke-500">
                  {product.category}
                </p>
                <h3 className="font-semibold text-smoke-900 text-lg">
                  {product.title}
                </h3>
                <p className="text-sm text-smoke-600 mt-3">
                  Reliable sourcing and local supplier connections for
                  industrial orders.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Curated supplier network',
                desc: 'Verified local factories and stable product availability.',
              },
              {
                icon: Shield,
                title: 'Secure order flow',
                desc: 'Clear purchase steps with buyer-friendly support.',
              },
              {
                icon: Zap,
                title: 'Fast discovery',
                desc: 'Search, compare and request orders instantly.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-primary-100" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-smoke-200 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dust-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-smoke-900 mb-4">
            Start buying from Kombolcha now
          </h2>
          <p className="text-smoke-600 mb-8">
            Sign in with a buyer account and unlock product recommendations,
            simple checkout, and smart order tracking.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login" className="btn-primary px-8 py-3">
              Buyer login
            </Link>
            <Link to="/products" className="btn-secondary px-8 py-3">
              Browse without login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
