import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  BarChart3, Users, Factory, CreditCard, Tag, LogOut, User, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

interface DashboardLayoutProps {
  role: 'FACTORY' | 'ADMIN';
}

const factoryNav = [
  { to: '/factory', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/factory/products', label: 'My Products', icon: Package },
  { to: '/factory/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/factory/messages', label: 'Messages', icon: MessageSquare },
  { to: '/factory/reports', label: 'Reports', icon: BarChart3 },
  { to: '/factory/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/factories', label: 'Factories', icon: Factory },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = role === 'FACTORY' ? factoryNav : adminNav;

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
              <p className="font-bold text-sm leading-tight">Kombolcha</p>
              <p className="text-xs text-slate-400">Showcase Platform</p>
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
              <p className="text-xs text-slate-400 capitalize">{role.toLowerCase()}</p>
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
              {item.label}
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
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
