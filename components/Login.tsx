
import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulation de délai réseau
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Validation du domaine professionnel
      const allowedDomains = ['iup.e-una.mr', 'e-una.mr'];
      const emailDomain = normalizedEmail.split('@')[1];
      
      const isAdmin = normalizedEmail === 'aziza@iup.e-una.mr';
      const isStudent = allowedDomains.includes(emailDomain);

      if (isAdmin || isStudent) {
        onLogin(normalizedEmail);
      } else {
        setError("Accès refusé. Veuillez utiliser votre adresse e-mail professionnelle (@iup.e-una.mr).");
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] -ml-64 -mb-64 opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-100 mb-6 rotate-3">
            E
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">EduCorrect AI</h1>
          <p className="text-slate-500 mt-2 font-medium text-center">Portail d'accès sécurisé IUP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Adresse Professionnelle</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="nom@iup.e-una.mr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-in shake-in duration-300">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!email || isLoading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-slate-200"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Se connecter <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <ShieldCheck className="text-emerald-500" size={16} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accès Etudiant & Admin</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium text-center">
            En vous connectant, vous acceptez les conditions d'utilisation académiques de la plateforme IUP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
