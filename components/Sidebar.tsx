
import React from 'react';
import { LayoutDashboard, FileText, BrainCircuit, LineChart, Settings, Trophy } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'correction', label: 'Correction', icon: FileText },
    { id: 'quiz', label: 'Quiz & Exos', icon: BrainCircuit },
    { id: 'progress', label: 'Progression', icon: LineChart },
    { id: 'challenges', label: 'Défis', icon: Trophy },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
        <h1 className="font-bold text-xl text-slate-800 tracking-tight">EduCorrect</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeView === item.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-600 mb-1">PROGRES DU JOUR</p>
        <div className="w-full bg-indigo-200 h-2 rounded-full mb-2">
          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }}></div>
        </div>
        <p className="text-xs text-indigo-700">65% de l'objectif atteint !</p>
      </div>
    </div>
  );
};

export default Sidebar;
