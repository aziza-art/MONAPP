
import React from 'react';
import { 
  Plus, 
  Play, 
  TrendingUp, 
  Award, 
  Calendar,
  ChevronRight,
  Zap,
  FileText
} from 'lucide-react';
import { UserProfile, CorrectionResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  lastCorrections: CorrectionResult[];
  onAction: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, lastCorrections, onAction }) => {
  const chartData = [
    { name: 'Lun', score: 14 },
    { name: 'Mar', score: 12 },
    { name: 'Mer', score: 16 },
    { name: 'Jeu', score: 15 },
    { name: 'Ven', score: 18 },
    { name: 'Sam', score: 14 },
    { name: 'Dim', score: 17 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Bienvenue, {user.name} ! 👋</h2>
          <p className="text-slate-500 mt-1">Tu as déjà accompli de grandes choses aujourd'hui.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAction('correction')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 shadow-md shadow-indigo-50 active:scale-95"
          >
            <Plus size={20} /> Corriger une copie
          </button>
          <button 
             onClick={() => onAction('quiz')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 shadow-md shadow-emerald-50 active:scale-95"
          >
            <Play size={20} /> Lancer un quiz
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Points" value={user.points} subValue="+150 cette semaine" icon={Award} color="text-amber-500" bgColor="bg-amber-50" />
        <StatCard title="Niveau" value={user.level} subValue="240 XP avant le niv. 6" icon={TrendingUp} color="text-indigo-500" bgColor="bg-indigo-50" />
        <StatCard title="Copies" value={user.badges.length + 8} subValue="3 corrigées hier" icon={Calendar} color="text-rose-500" bgColor="bg-rose-50" />
        <StatCard title="Série" value="5 jours" subValue="Ton record est de 12 !" icon={Zap} color="text-cyan-500" bgColor="bg-cyan-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              Progression Hebdomadaire
              <span className="text-sm font-normal text-slate-500">Moyenne: 15.2/20</span>
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis hide domain={[0, 20]} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 15 ? '#10b981' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Dernières corrections</h3>
              <button className="text-indigo-600 text-sm font-semibold hover:underline">Voir tout</button>
            </div>
            <div className="space-y-4">
              {lastCorrections.length > 0 ? lastCorrections.slice(0, 3).map((correction) => (
                <div key={correction.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{correction.title}</h4>
                      <p className="text-sm text-slate-500">{new Date(correction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${correction.score >= 15 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {correction.score}/20
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500" />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  Aucune correction récente. Commence par en ajouter une !
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold mb-2">Défi du jour 🎯</h3>
            <p className="text-indigo-100 text-sm mb-4">Réalise 2 quiz sans fautes pour gagner le badge "Maître de la logique".</p>
            <div className="bg-white/20 h-2 rounded-full mb-6">
              <div className="bg-white h-full rounded-full" style={{ width: '50%' }}></div>
            </div>
            <button className="w-full bg-white text-indigo-700 font-bold py-2 rounded-xl hover:bg-indigo-50 hover:scale-[1.02] transition-all duration-300 shadow-md">
              Relever le défi
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Badges récents</h3>
            <div className="grid grid-cols-3 gap-3">
              {['🌟', '📚', '🔥', '🧠', '🚀', '✅'].map((emoji, i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 shadow-sm hover:scale-110 hover:shadow-md transition cursor-pointer" title="Badge Débloqué !">
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 border-dashed">
            <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
              <Zap size={18} /> Révision express
            </h3>
            <p className="text-emerald-700 text-xs mb-4">Focus sur tes points faibles : l'accord du participe passé.</p>
            <button className="w-full bg-emerald-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-emerald-700 hover:scale-[1.02] transition-all duration-300">
              Démarrer (2 min)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
      <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
    </div>
    <div className={`${bgColor} ${color} p-3 rounded-xl`}>
      <Icon size={22} />
    </div>
  </div>
);

export default Dashboard;
