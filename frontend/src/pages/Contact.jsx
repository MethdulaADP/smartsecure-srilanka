import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 900);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Heading */}
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-700 to-slate-900 text-transparent bg-clip-text">
        {t('contact.title')}
      </h1>
      <p className="text-lg leading-relaxed mb-12 text-slate-600">
        {t('contact.description')}
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Form */}
        <form
          onSubmit={submit}
          className="space-y-6 bg-white backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.form.name')}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder={t('contact.form.namePlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.form.email')}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t('contact.form.emailPlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">{t('contact.form.message')}</label>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
              placeholder={t('contact.form.messagePlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition"
            />
          </div>
          <button
            disabled={status !== 'idle'}
            className={`w-full py-4 rounded-xl font-bold text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              status === 'idle'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            {status === 'sent' ? t('contact.form.sent') : status === 'sending' ? t('contact.form.sending') : t('contact.form.send')}
          </button>
          {status === 'sent' && (
            <p className="text-sm text-green-600 text-center">
              {t('contact.form.thankYou')}
            </p>
          )}
        </form>

        {/* Info Panel */}
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('contact.info.headOffice')}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t('contact.info.address')}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('contact.info.contact')}</h3>
            <ul className="text-slate-600 text-sm space-y-2">
              <li>📧 info@smartsecure.lk</li>
              <li>📞 +94 11 234 5678</li>
              <li>🌐 www.smartsecure.lk</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('contact.info.support')}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t('contact.info.supportDesc')}
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,#fff,transparent)]" />
            <h4 className="font-semibold mb-2 relative">{t('contact.info.urgent')}</h4>
            <p className="text-blue-100 text-sm mb-3 relative">{t('contact.info.urgentDesc')}</p>
            <div className="text-xs text-blue-200 relative">{t('contact.info.responseTime')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}