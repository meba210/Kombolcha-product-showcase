import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Users,
  Factory,
  CreditCard,
  Tag,
  LogOut,
  User,
  ChevronRight,
  SunMedium,
  MoonStar,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface DashboardLayoutProps {
  role: 'FACTORY' | 'ADMIN';
}

const factoryNav = [
  { to: '/factory', labelKey: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/factory/products', labelKey: 'myProducts', icon: Package },
  { to: '/factory/orders', labelKey: 'orders', icon: ShoppingCart },
  { to: '/factory/messages', labelKey: 'messages', icon: MessageSquare },
  { to: '/factory/reports', labelKey: 'reports', icon: BarChart3 },
  { to: '/factory/profile', labelKey: 'profile', icon: User },
];

const adminNav = [
  { to: '/admin', labelKey: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', labelKey: 'products', icon: Package },
  { to: '/admin/orders', labelKey: 'orders', icon: ShoppingCart },
  { to: '/admin/payments', labelKey: 'payments', icon: CreditCard },
  { to: '/admin/users', labelKey: 'users', icon: Users },
  { to: '/admin/factories', labelKey: 'factories', icon: Factory },
  { to: '/admin/categories', labelKey: 'categories', icon: Tag },
  { to: '/admin/messages', labelKey: 'messages', icon: MessageSquare },
];

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = role === 'FACTORY' ? factoryNav : adminNav;
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('theme-dark') ||
    localStorage.getItem('theme-preference') === 'dark'
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Factory size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">
                {t('kombolchaName')}
              </p>
              <p className="text-xs text-slate-400">{t('tagline')}</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">
                {role === 'ADMIN' ? t('adminRole') : t('factoryRole')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon size={18} />
              {t(item.labelKey)}
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-end items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
              }
              className="p-2 text-slate-600 hover:text-primary-700 rounded-lg border border-slate-200 bg-white"
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? (
                <SunMedium size={16} />
              ) : (
                <MoonStar size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')
              }
              className="text-sm font-medium text-slate-600 hover:text-primary-700 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
              aria-label={t('toggleLanguage')}
            >
              {i18n.language === 'en' ? 'አማ' : 'EN'}
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
