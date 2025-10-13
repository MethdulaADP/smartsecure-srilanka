import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Services() {
  const { t } = useTranslation();
  const offerings = [
    { 
      icon:'🏠', 
      title: 'Home Security', 
      detail: 'Smart monitoring systems for residential protection with 24/7 surveillance. Protect your family and property with advanced AI-powered security solutions designed specifically for Sri Lankan homes.'
    },
    { 
      icon:'🏢', 
      title: 'Business Protection', 
      detail: 'Commercial security solutions for Sri Lankan enterprises. Comprehensive protection for offices, shops, and businesses with integrated access control, monitoring, and emergency response systems.'
    },
    { 
      icon:'�', 
      title: 'Mobile Alerts', 
      detail: 'Real-time notifications to mobile devices. Instant alerts for security events, intrusion detection, and emergency situations directly to your smartphone wherever you are.'
    },
    { 
      icon:'🔐', 
      title: 'Access Control', 
      detail: 'Digital key management and secure access systems. Control who enters your property with biometric scanners, smart locks, and automated access logging for enhanced security.'
    },
    { 
      icon:'�', 
      title: 'CCTV Systems', 
      detail: '24/7 surveillance with HD recording and remote monitoring. Professional-grade cameras with night vision, motion detection, and cloud storage to keep your property secure around the clock.'
    },
    { 
      icon:'🚨', 
      title: 'Emergency Response', 
      detail: 'Instant alert systems with emergency services connection. Direct connection to local police, fire department, and medical services for rapid response in critical situations.'
    }
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 bg-transparent">
      <div className="text-center mb-16">
  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-slate-900 text-transparent bg-clip-text">{t('services.title')}</h1>
  <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t('services.subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {offerings.map(o => (
          <div key={o.title} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">{o.icon}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{o.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">{o.detail}</p>
            <button className="text-sm font-semibold text-blue-700 hover:text-blue-900">Learn more →</button>
          </div>
        ))}
      </div>
  <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 rounded-3xl p-12 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">{t('services.customPackage')}</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">{t('services.customDesc')}</p>
        <Link to="/contact" className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-transform inline-block">{t('services.talkToUs')}</Link>
      </div>
    </div>
  );
}
