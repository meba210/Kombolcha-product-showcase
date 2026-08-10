import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageSquare, User, LogOut, Factory, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'FACTORY') return '/factory';
    return '/profile';
  };

  return (
    <header className="bg-black border-b border-white/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Factory size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-white text-lg leading-tight block">Kombolcha</span>
              <span className="text-xs text-slate-300 leading-tight block">Showcase</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              {t('products')}
            </Link>
            <Link to="/factories" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              {t('factories')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Toggle language"
            >
              <Globe size={15} />
              {i18n.language === 'en' ? 'አማ' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                {user?.role === 'BUYER' && (
                  <Link to="/cart" className="relative p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link to="/messages" className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <MessageSquare size={20} />
                </Link>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-24 truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-200 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">
                  {t('register')}
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-200 hover:bg-white/10 rounded-lg"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {[
              { to: '/', label: t('home') },
              { to: '/products', label: t('products') },
              { to: '/factories', label: t('factories') },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
