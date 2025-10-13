import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  const milestones = [
    { year: '2024', text: t('about.milestones.2024') },
    { year: '2025 Q1', text: t('about.milestones.2025q1') },
    { year: '2025 Q2', text: t('about.milestones.2025q2') },
    { year: '2025 Q3', text: t('about.milestones.2025q3') }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-700 to-slate-900 text-transparent bg-clip-text">
        {t('about.title')}
      </h1>
      <p className="text-lg leading-relaxed mb-10 text-slate-600">
        {t('about.description')}
      </p>

      <div className="grid md:grid-cols-3 gap-10 mb-20">
        {[
          { title: t('about.mission'), body: t('about.missionDesc') },
          { title: t('about.vision'), body: t('about.visionDesc') },
          { title: t('about.values'), body: t('about.valuesDesc') }
        ].map((c) => (
          <div
            key={c.title}
            className="p-6 rounded-2xl bg-white backdrop-blur-sm border border-slate-200 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-2 text-slate-900">{c.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-slate-900">{t('about.milestonesTitle')}</h2>
      <div className="relative border-l border-slate-300 pl-6 space-y-8 mb-20">
        {milestones.map((m) => (
          <div key={m.year} className="relative group">
            <div className="absolute -left-3 top-1.5 w-5 h-5 rounded-full bg-blue-600 border-4 border-slate-50 shadow group-hover:scale-110 transition" />
            <div className="text-sm font-semibold text-blue-700 mb-1">{m.year}</div>
            <div className="text-slate-600 text-sm leading-relaxed">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-10 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,#fff,transparent)]" />
        <h3 className="text-2xl font-bold mb-3 relative">{t('about.whatsNext')}</h3>
        <p className="text-blue-100 text-sm leading-relaxed mb-4 relative">
          {t('about.whatsNextDesc')}
        </p>
        <p className="text-sm text-blue-200 relative">{t('about.thanksMessage')}</p>
      </div>
    </div>
  );
}