const accentMap = {
  blue: 'bg-blue-100',
  orange: 'bg-orange-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  red: 'bg-red-100',
  yellow: 'bg-yellow-100'
};

export default function ServiceCard({ icon, title, desc, accent='blue' }) {
  const accentCls = accentMap[accent] || accentMap.blue;
  return (
  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 group hover:scale-105">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors text-3xl ${accentCls}`}>{icon}</div>
  <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
  <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
