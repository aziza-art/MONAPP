
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CorrectionRoom from './views/CorrectionRoom';
import QuizHub from './views/QuizHub';
import Login from './components/Login';
import { UserProfile, CorrectionResult } from './types';
import { Menu, X, Bell, ShieldCheck, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [corrections, setCorrections] = useState<CorrectionResult[]>([]);
  const [quizTopic, setQuizTopic] = useState<string | undefined>();
  const [highContrast, setHighContrast] = useState(false);
  const [isDyslexic, setIsDyslexic] = useState(false);

  // Vérifier la session au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (email: string) => {
    const isAdmin = email.toLowerCase() === 'aziza@iup.e-una.mr';
    const newUser: UserProfile = {
      name: email.split('@')[0].toUpperCase(),
      email: email.toLowerCase(),
      role: isAdmin ? 'admin' : 'user',
      points: 1240,
      level: 5,
      badges: ['Premier Pas', 'Rapide', 'Persévérant']
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('edu_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('edu_user');
  };

  const handleAddCorrection = (result: CorrectionResult) => {
    setCorrections(prev => [result, ...prev]);
    if (user) {
      const updatedUser = { ...user, points: user.points + 50 };
      setUser(updatedUser);
      localStorage.setItem('edu_user', JSON.stringify(updatedUser));
    }
  };

  const handleQuizComplete = (score: number) => {
    if (user) {
      const updatedUser = { ...user, points: user.points + score * 10 };
      setUser(updatedUser);
      localStorage.setItem('edu_user', JSON.stringify(updatedUser));
    }
  };

  const handleActionFromDashboard = (view: string) => {
    setActiveView(view);
  };

  const startQuizFromCorrection = (prompt: string) => {
    setQuizTopic(prompt);
    setActiveView('quiz');
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen flex ${highContrast ? 'contrast-125 saturate-150' : ''} ${isDyslexic ? 'font-dyslexic' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative z-50 transform lg:transform-none transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar activeView={activeView} setActiveView={(v) => { setActiveView(v); setIsSidebarOpen(false); }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-slate-50 overflow-x-hidden p-4 lg:p-8">
        {/* Top bar for mobile and alerts */}
        <div className="flex items-center justify-between mb-8 lg:mb-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 bg-white rounded-lg border border-slate-200 text-slate-600"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            {user.role === 'admin' && (
              <div className="hidden md:flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <ShieldCheck size={14} className="text-amber-600" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Administrateur</span>
              </div>
            )}
            
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
               <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Session Active</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2"
              title="Déconnexion"
            >
              <LogOut size={20} />
              <span className="hidden lg:inline text-xs font-bold">Quitter</span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[120px]">{user.email}</p>
              </div>
              <img src={`https://picsum.photos/seed/${user.name}/100/100`} className="w-10 h-10 rounded-xl border border-white shadow-sm ring-2 ring-indigo-50" alt="Avatar" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 pb-20">
          {activeView === 'dashboard' && <Dashboard user={user} lastCorrections={corrections} onAction={handleActionFromDashboard} />}
          {activeView === 'correction' && <CorrectionRoom onAddCorrection={handleAddCorrection} onGenerateQuiz={startQuizFromCorrection} />}
          {activeView === 'quiz' && <QuizHub onQuizComplete={handleQuizComplete} initialTopic={quizTopic} />}
          
          {activeView === 'progress' && (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
               <div className="text-6xl mb-4">📈</div>
               <h3 className="text-2xl font-bold text-slate-800">Module de progression en cours</h3>
               <p className="text-slate-500 max-w-md mx-auto mt-2">Nous analysons tes données pour te fournir des graphiques précis de ton évolution.</p>
             </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
               <h2 className="text-2xl font-bold text-slate-800 mb-6">Accessibilité & Préférences</h2>
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-800">Contraste élevé</h4>
                      <p className="text-sm text-slate-500">Améliore la lisibilité des textes et boutons.</p>
                    </div>
                    <button 
                      onClick={() => setHighContrast(!highContrast)}
                      className={`w-14 h-8 rounded-full transition-all relative ${highContrast ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${highContrast ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-slate-800">Police Dyslexie</h4>
                      <p className="text-sm text-slate-500">Utilise la police OpenDyslexic pour faciliter la lecture.</p>
                    </div>
                    <button 
                      onClick={() => setIsDyslexic(!isDyslexic)}
                      className={`w-14 h-8 rounded-full transition-all relative ${isDyslexic ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDyslexic ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>
               </div>
               
               <div className="pt-8 border-t border-slate-100">
                 <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-black transition">
                   Enregistrer les préférences
                 </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
