import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/services', label: t('nav.services') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') }
  ];

  const baseLink = 'py-2 px-3 rounded-md font-medium transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-white">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-blue-700">
            <span className="text-2xl">🛡️</span><span>SmartSecure</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(i => (
              <NavLink key={i.to} to={i.to} end className={({isActive}) => `${baseLink} ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>{i.label}</NavLink>
            ))}
            <LanguageSwitcher />
            {!user && (
              <>
                <Link to="/login" className="text-blue-700 font-semibold hover:text-blue-800 px-3 py-2 rounded-md">{t('nav.login')}</Link>
                <Link to="/register" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-semibold shadow">{t('nav.register')}</Link>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-blue-700">{t('nav.dashboard')}</Link>
                <Link to="/files" className="text-slate-600 hover:text-blue-700">📁 Files</Link>
                <Link to="/security" className="text-slate-600 hover:text-blue-700">🛡️ Security</Link>
                <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium">{t('nav.logout')}</button>
              </>
            )}
          </nav>
          <button onClick={() => setMobileOpen(o=>!o)} className="md:hidden p-2 rounded hover:bg-slate-100">
            <div className="w-6 space-y-1.5">
              <span className="block h-0.5 bg-slate-800"></span>
              <span className="block h-0.5 bg-slate-800"></span>
              <span className="block h-0.5 bg-slate-800"></span>
            </div>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-6 pb-4 space-y-2">
            {navItems.map(i => (
              <NavLink key={i.to} to={i.to} end onClick={()=>setMobileOpen(false)} className={({isActive}) => `block ${baseLink} ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>{i.label}</NavLink>
            ))}
            <div className="py-2">
              <LanguageSwitcher className="w-full" />
            </div>
            {!user && (
              <div className="pt-2 space-y-2">
                <Link to="/login" onClick={()=>setMobileOpen(false)} className="block w-full text-center text-blue-700 font-semibold bg-blue-50 py-2 rounded-md">{t('nav.login')}</Link>
                <Link to="/register" onClick={()=>setMobileOpen(false)} className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md font-semibold shadow">{t('nav.register')}</Link>
              </div>
            )}
            {user && (
              <div className="pt-2 space-y-2">
                <Link to="/dashboard" onClick={()=>setMobileOpen(false)} className="block w-full text-center text-slate-600 hover:text-blue-700 py-2 rounded-md">{t('nav.dashboard')}</Link>
                <Link to="/files" onClick={()=>setMobileOpen(false)} className="block w-full text-center text-slate-600 hover:text-blue-700 py-2 rounded-md">📁 Files</Link>
                <Link to="/security" onClick={()=>setMobileOpen(false)} className="block w-full text-center text-slate-600 hover:text-blue-700 py-2 rounded-md">🛡️ Security</Link>
                <button onClick={()=>{logout(); setMobileOpen(false);}} className="block w-full text-center text-red-600 hover:text-red-700 font-medium py-2 rounded-md">{t('nav.logout')}</button>
              </div>
            )}
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <span className="font-bold text-lg">SmartSecure</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.services')}</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>{t('footer.homeSecurity')}</li>
              <li>{t('footer.businessProtection')}</li>
              <li>{t('footer.cctvSystems')}</li>
              <li>{t('footer.accessControl')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>info@smartsecure.lk</li>
              <li>+94 11 234 5678</li>
              <li>Colombo 03, Sri Lanka</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.follow')}</h4>
            <div className="flex space-x-3 text-xl">
              <span>📘</span><span>🐦</span><span>📺</span>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-slate-500">{t('footer.copyright', { year: new Date().getFullYear() })}</div>
      </footer>
    </div>
  );
}
