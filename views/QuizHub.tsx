
import React, { useState } from 'react';
import { BrainCircuit, Play, CheckCircle2, XCircle, ArrowRight, Home, RefreshCw, Star, Info } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { Quiz, QuizQuestion } from '../types';

interface QuizHubProps {
  onQuizComplete: (score: number) => void;
  initialTopic?: string;
}

const QuizHub: React.FC<QuizHubProps> = ({ onQuizComplete, initialTopic }) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [difficulty, setDifficulty] = useState('Intermédiaire');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleStartQuiz = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const data = await generateQuiz(topic, difficulty);
      setQuiz(data);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResults(false);
    } catch (error) {
      alert("Erreur lors de la génération du quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === quiz?.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      onQuizComplete(score);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative">
          <BrainCircuit size={64} className="text-emerald-500 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-2xl font-bold mt-8 text-slate-800">Génération de ton quiz sur mesure...</h2>
        <p className="text-slate-500 mt-2">L'IA prépare des questions adaptées à ton niveau.</p>
      </div>
    );
  }

  if (showResults && quiz) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          {percentage >= 70 ? <Star size={48} fill="currentColor" /> : <RefreshCw size={48} />}
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Terminé !</h2>
        <p className="text-slate-500 mt-2">Tu as obtenu un score de</p>
        <div className="text-6xl font-black text-indigo-600 my-6">{score} <span className="text-2xl text-slate-300">/ {quiz.questions.length}</span></div>
        <p className="text-lg font-medium text-slate-700 mb-8">
          {percentage >= 80 ? "Excellent travail ! Tu maîtrises bien le sujet." : 
           percentage >= 50 ? "Pas mal, mais tu peux encore progresser !" : 
           "Besoin de révisions. Refais un quiz pour t'améliorer."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setQuiz(null)}
            className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Refaire un quiz
          </button>
          <button 
             onClick={() => setQuiz(null)}
            className="px-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition"
          >
            <Home size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (quiz) {
    const q = quiz.questions[currentQuestionIndex];
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-black">QUESTION {currentQuestionIndex + 1}/{quiz.questions.length}</span>
            <span className="text-slate-400 text-sm font-medium">{quiz.title}</span>
          </div>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative">
          <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-8">{q.question}</h3>
          
          <div className="space-y-4">
            {q.options.map((option, i) => (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(i)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                  isAnswered 
                    ? i === q.correctAnswer 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                      : i === selectedOption ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-100 text-slate-400 opacity-60'
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700'
                }`}
              >
                <span className="font-semibold text-lg">{option}</span>
                {isAnswered && i === q.correctAnswer && <CheckCircle2 className="text-emerald-500" />}
                {isAnswered && i === selectedOption && i !== q.correctAnswer && <XCircle className="text-rose-500" />}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Info size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">Pourquoi ?</h4>
                  <p className="text-indigo-800/80 text-sm leading-relaxed">{q.explanation}</p>
                </div>
              </div>
              <button 
                onClick={handleNextQuestion}
                className="w-full mt-6 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? "Voir les résultats" : "Question suivante"} <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-800">Lance un quiz sur mesure 🎯</h2>
        <p className="text-slate-500">Choisis un thème et teste tes connaissances.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Sujet ou Chapitre</label>
          <input 
            type="text"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ex: Les fractions, la Révolution française, présent du subjonctif..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Niveau de difficulté</label>
          <div className="grid grid-cols-3 gap-3">
            {['Débutant', 'Intermédiaire', 'Expert'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${
                  difficulty === level ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleStartQuiz}
          disabled={!topic}
          className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-100 mt-4"
        >
          <Play size={24} /> GÉNÉRER MON QUIZ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl hover:shadow-md transition cursor-pointer group">
          <h4 className="font-bold text-emerald-800 mb-1">Quiz de révision Rapide</h4>
          <p className="text-emerald-700 text-xs mb-4">Basé sur tes 5 dernières erreurs de grammaire.</p>
          <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Démarrer maintenant <ArrowRight size={14} /></span>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl hover:shadow-md transition cursor-pointer group">
          <h4 className="font-bold text-amber-800 mb-1">Défi de la semaine</h4>
          <p className="text-amber-700 text-xs mb-4">Quiz spécial "Littérature Classique" - Bonus 500 XP.</p>
          <span className="text-amber-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Participer <ArrowRight size={14} /></span>
        </div>
      </div>
    </div>
  );
};

export default QuizHub;
