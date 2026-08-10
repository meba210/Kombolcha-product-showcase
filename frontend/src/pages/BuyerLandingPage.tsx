import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  ClipboardList,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const quickActions = [
  {
    icon: ShoppingBag,
    label: 'Browse Products',
    desc: 'Explore the full catalog',
    to: '/products',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ClipboardList,
    label: 'My Orders',
    desc: 'Track your purchases',
    to: '/orders',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Sparkles,
    label: 'Recommendations',
    desc: 'AI-picked for you',
    to: '/recommendations',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    desc: 'Chat with suppliers',
    to: '/messages',
    color: 'bg-orange-50 text-orange-600',
  },
];

const highlights = [
  { icon: Package, label: 'Products available', value: '1,200+' },
  { icon: TrendingUp, label: 'Verified suppliers', value: '120+' },
  { icon: Clock, label: 'Avg. delivery', value: '3–5 days' },
];

const suggestions = [
  'Steel beams',
  'Fabric rolls',
  'Cement bags',
  'Sesame oil',
  'Packaging',
];

export default function BuyerLandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-smoke-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-smoke-500 mt-1 text-sm">
          Here's what's waiting for you today.
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white border border-smoke-200 rounded-2xl shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-smoke-400 mb-3">
          Search products
        </p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for steel, fabric, cement…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-smoke-200 bg-smoke-50 text-smoke-900 placeholder-smoke-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-6 py-3 text-sm rounded-xl flex items-center gap-2 shrink-0"
          >
            Search <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick suggestion chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                navigate(`/products?search=${encodeURIComponent(s)}`)
              }
              className="text-xs px-3 py-1.5 rounded-full border border-smoke-200 bg-smoke-50 text-smoke-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {highlights.map((h) => (
          <div
            key={h.label}
            className="flex items-center gap-4 bg-white border border-smoke-200 rounded-xl px-5 py-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-smoke-100 flex items-center justify-center text-smoke-600 shrink-0">
              <h.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-smoke-900">{h.value}</p>
              <p className="text-xs text-smoke-500">{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-smoke-400 mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="group flex flex-col gap-3 bg-white border border-smoke-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-smoke-300 transition-all duration-200"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}
              >
                <action.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-smoke-900 group-hover:text-primary-600 transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-smoke-500 mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight
                size={14}
                className="text-smoke-300 group-hover:text-primary-500 transition-colors mt-auto self-end"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Recommendations teaser */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-semibold text-lg">AI Recommendations ready</p>
            <p className="text-primary-100 text-sm mt-0.5">
              Products picked based on your browsing and order history.
            </p>
          </div>
        </div>
        <Link
          to="/recommendations"
          className="shrink-0 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
        >
          View picks <ArrowRight size={15} />
        </Link>
      </div>

      {/* Browse CTA */}
      <div className="border border-smoke-200 rounded-2xl p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-smoke-900">Ready to order?</p>
          <p className="text-sm text-smoke-500 mt-0.5">
            Browse the full catalog and add items to your cart.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/products"
            className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
          >
            Browse products <ArrowRight size={15} />
          </Link>
          <Link to="/cart" className="btn-secondary px-5 py-2 text-sm">
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
}
