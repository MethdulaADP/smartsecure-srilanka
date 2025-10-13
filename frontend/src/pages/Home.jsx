import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
  <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-400/25 via-yellow-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/25 to-transparent rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="text-slate-900">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-blue-100 text-slate-700 border border-transparent">
                <span className="text-orange-500 mr-2">🇱🇰</span>
                <span className="text-sm font-semibold">{t('home.hero.badge')}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('home.hero.title')}
                <span className="block text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
                  {t('home.hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed text-slate-600">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  {t('home.hero.getStarted')}
                </Link>
                <Link
                  to="/about"
                  className="border-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  {t('home.hero.learnMore')}
                </Link>
              </div>
            </div>
            {/* Image */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl p-8 shadow-2xl bg-white/80 backdrop-blur-lg border border-slate-200/70">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=720&q=80"
                  alt="Security Dashboard"
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  ✅ 99.9% Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
  <section className="py-20 bg-slate-50" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.services.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('home.services.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {([
              { icon:'🏠', title: t('home.services.homeSecurity.title'), desc: t('home.services.homeSecurity.desc'), accent:'blue' },
              { icon:'🏢', title: t('home.services.businessProtection.title'), desc: t('home.services.businessProtection.desc'), accent:'orange' },
              { icon:'📱', title: t('home.services.mobileAlerts.title'), desc: t('home.services.mobileAlerts.desc'), accent:'green' },
              { icon:'🔒', title: t('home.services.accessControl.title'), desc: t('home.services.accessControl.desc'), accent:'purple' },
              { icon:'📹', title: t('home.services.cctvSystems.title'), desc: t('home.services.cctvSystems.desc'), accent:'red' },
              { icon:'🚨', title: t('home.services.emergencyResponse.title'), desc: t('home.services.emergencyResponse.desc'), accent:'yellow' }
            ]).map(card => (
              <ServiceCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-gray-600">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {([
              { icon:'⚡', title: t('home.features.monitoring.title'), desc: t('home.features.monitoring.desc') },
              { icon:'🇱🇰', title: t('home.features.localSupport.title'), desc: t('home.features.localSupport.desc') },
              { icon:'🛡️', title: t('home.features.advancedProtection.title'), desc: t('home.features.advancedProtection.desc') }
            ]).map(f => (
              <div key={f.title} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 text-3xl text-white">{f.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{f.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">{t('home.cta.title')}</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">{t('home.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">{t('home.cta.getStarted')}</Link>
            <Link to="/contact" className="border-2 border-white/50 text-white hover:bg-white/10 px-10 py-4 rounded-xl font-bold text-lg backdrop-blur-sm transition-all duration-200">{t('home.cta.contactUs')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
