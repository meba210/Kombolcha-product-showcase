import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  MessageSquare,
  LogOut,
  Factory,
  Menu,
  X,
  Globe,
  ChevronDown,
  Info,
  Phone,
  BookOpen,
  MapPin,
  Mail,
  HelpCircle,
  FileText,
  Users,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

// ─── Dropdown menus data ──────────────────────────────────────────────────────

const aboutLinks = [
  { icon: Info,    label: 'About Kombolcha',  sub: 'Our story and mission',      to: '/' },
  { icon: Factory, label: 'Industrial Park',  sub: 'The factory ecosystem',      to: '/factories' },
  { icon: Users,   label: 'Our Team',         sub: 'People behind the platform', to: '/' },
  { icon: MapPin,  label: 'Location',         sub: 'Kombolcha, Amhara, Ethiopia',to: '/' },
];

const resourceLinks = [
  { icon: BookOpen, label: 'How It Works',    sub: 'Buyer & factory guide',   to: '/' },
  { icon: FileText, label: 'For Buyers',      sub: 'Ordering & payments',     to: '/register' },
  { icon: Factory,  label: 'For Factories',   sub: 'Register your factory',   to: '/register' },
  { icon: HelpCircle,label: 'FAQ',            sub: 'Common questions',        to: '/' },
];

const contactLinks = [
  { icon: Mail,    label: 'Email Us',          sub: 'info@kombolcha-showcase.com', to: '/' },
  { icon: Phone,   label: 'Call Us',           sub: '+251 33 551 0000',            to: '/' },
  { icon: MapPin,  label: 'Visit Us',          sub: 'Kombolcha, Amhara Region',    to: '/' },
  { icon: MessageSquare, label: 'Live Chat',   sub: 'Chat with our support',       to: '/messages' },
];

// ─── Reusable dropdown ────────────────────────────────────────────────────────

interface DropdownItem {
  icon: React.ElementType;
  label: string;
  sub: string;
  to: string;
}

function NavDropdown({
  label,
  items,
  isActive,
}: {
  label: string;
  items: DropdownItem[];
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'flex items-center gap-1 text-sm font-medium transition-colors px-1 py-0.5 rounded',
          isActive || open
            ? 'text-primary-700'
            : 'text-smoke-600 hover:text-smoke-900'
        )}
      >
        {label}
        <ChevronDown
          size={13}
          className={clsx('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-smoke-100 overflow-hidden z-50">
          {/* Arrow pointer */}
          <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-l border-t border-smoke-100 rotate-45" />
          <div className="p-2">
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 group transition-colors"
              >
                <div className="w-8 h-8 bg-smoke-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <item.icon size={15} className="text-smoke-500 group-hover:text-primary-600 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-smoke-900 leading-snug">{item.label}</p>
                  <p className="text-[11px] text-smoke-400 truncate">{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleLang = () => { i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en'); };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'FACTORY') return '/factory';
    return '/profile';
  };

  const isActive = (path: string) => location.pathname === path;

  // Simple nav links (no dropdown)
  const simpleLinks = [
    { to: '/',          label: t('home')      },
    { to: '/products',  label: t('products')  },
    { to: '/factories', label: t('factories') },
  ];

  return (
    <header className="bg-white border-b border-smoke-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center shadow-sm">
              <Factory size={19} className="text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-bold text-smoke-900 text-[15px] block leading-none">Kombolcha</span>
              <span className="text-[10px] text-smoke-400 font-medium tracking-wide block">
                Factory Showcase
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {simpleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'relative text-sm font-medium px-3 py-2 rounded-lg transition-colors',
                  isActive(link.to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-smoke-600 hover:text-smoke-900 hover:bg-smoke-50'
                )}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-600 rounded-full" />
                )}
              </Link>
            ))}

            {/* Dropdown links */}
            <NavDropdown
              label="About Kombolcha"
              items={aboutLinks}
              isActive={false}
            />
            <NavDropdown
              label="Resources"
              items={resourceLinks}
              isActive={false}
            />
            <NavDropdown
              label="Contact"
              items={contactLinks}
              isActive={false}
            />
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1.5">

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-smoke-500 hover:text-smoke-800 hover:bg-smoke-100 rounded-lg transition-colors"
              title="Toggle language"
            >
              <Globe size={14} />
              {i18n.language === 'en' ? 'አማ' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Cart — buyers only */}
                {user?.role === 'BUYER' && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-smoke-500 hover:text-smoke-900 hover:bg-smoke-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={19} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none px-1">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2 text-smoke-500 hover:text-smoke-900 hover:bg-smoke-100 rounded-lg transition-colors"
                >
                  <MessageSquare size={19} />
                </Link>

                {/* Profile pill */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-smoke-100 hover:bg-smoke-200 rounded-full transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-smoke-800 hidden sm:block max-w-[88px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-smoke-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-smoke-700 hover:text-smoke-900 px-3 py-1.5 rounded-lg hover:bg-smoke-100 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-smoke-600 hover:bg-smoke-100 rounded-lg transition-colors ml-1"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-smoke-100 py-3 space-y-0.5 pb-4">
            {/* Simple links */}
            {simpleLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors',
                  isActive(item.to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-smoke-700 hover:text-smoke-900 hover:bg-smoke-50'
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-smoke-100 my-2 mx-3" />

            {/* About Kombolcha flat links */}
            <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-smoke-400">
              About Kombolcha
            </p>
            {aboutLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-smoke-700 hover:bg-smoke-50 rounded-xl transition-colors"
              >
                <item.icon size={15} className="text-smoke-400 shrink-0" />
                {item.label}
              </Link>
            ))}

            <div className="h-px bg-smoke-100 my-2 mx-3" />

            <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-smoke-400">
              Resources
            </p>
            {resourceLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-smoke-700 hover:bg-smoke-50 rounded-xl transition-colors"
              >
                <item.icon size={15} className="text-smoke-400 shrink-0" />
                {item.label}
              </Link>
            ))}

            <div className="h-px bg-smoke-100 my-2 mx-3" />

            <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-smoke-400">
              Contact
            </p>
            {contactLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-smoke-700 hover:bg-smoke-50 rounded-xl transition-colors"
              >
                <item.icon size={15} className="text-smoke-400 shrink-0" />
                {item.label}
              </Link>
            ))}

            {/* Auth buttons for mobile */}
            {!isAuthenticated && (
              <>
                <div className="h-px bg-smoke-100 my-2 mx-3" />
                <div className="px-3 pt-1 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-semibold text-smoke-700 border border-smoke-200 py-2 rounded-xl hover:bg-smoke-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-semibold text-white bg-primary-700 py-2 rounded-xl hover:bg-primary-800 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
