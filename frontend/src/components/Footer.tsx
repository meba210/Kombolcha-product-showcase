import { Link } from 'react-router-dom';
import { Factory, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Factory size={20} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg block leading-tight">Kombolcha Showcase</span>
                <span className="text-xs text-slate-400">AI-Powered Factory Products</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Connecting Kombolcha's industrial factories with buyers through an intelligent digital marketplace.
              Discover textiles, steel, food products, and construction materials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/products', label: 'Browse Products' },
                { to: '/factories', label: 'Our Factories' },
                { to: '/register', label: 'Register' },
                { to: '/login', label: 'Login' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} className="text-primary-400 flex-shrink-0" />
                Kombolcha, Amhara Region, Ethiopia
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} className="text-primary-400 flex-shrink-0" />
                info@kombolcha-showcase.com
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone size={14} className="text-primary-400 flex-shrink-0" />
                +251 33 551 0000
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Kombolcha Showcase Platform.
          </p>
          <p className="text-xs text-slate-500">
            Built with React, Node.js & AI
          </p>
        </div>
      </div>
    </footer>
  );
}
