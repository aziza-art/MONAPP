
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, FileText, Send, Sparkles, AlertCircle, CheckCircle2, RefreshCw, BrainCircuit, Eye, ArrowRight, Check, Trophy, Loader2, X, Lightbulb, HelpCircle } from 'lucide-react';
import { analyzeWork, explainConcept, askCoach } from '../services/geminiService';
import { CorrectionResult, Annotation, CoachInteraction } from '../types';

interface CorrectionRoomProps {
  onAddCorrection: (result: CorrectionResult) => void;
  onGenerateQuiz: (prompt: string) => void;
}

const CorrectionRoom: React.FC<CorrectionRoomProps> = ({ onAddCorrection, onGenerateQuiz }) => {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [coachInteraction, setCoachInteraction] = useState<CoachInteraction | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showAnnotatedView, setShowAnnotatedView] = useState(true);
  const [miniQuizAnswer, setMiniQuizAnswer] = useState<number | null>(null);
  const [showMiniQuizFeedback, setShowMiniQuizFeedback] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const coachPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isExplaining, coachInteraction, showMiniQuizFeedback]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setInputMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (severityPrompt: string = "") => {
    if (!text && !image) return;
    setIsLoading(true);
    setResult(null);
    setActiveAnnotation(null);
    setCoachInteraction(null);
    setChatHistory([]);
    try {
      const finalPrompt = severityPrompt ? `${text}\n\nNOTE: ${severityPrompt}` : text;
      const data = await analyzeWork(finalPrompt, image || undefined);
      setResult(data);
      onAddCorrection(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse. Vérifie ton image ou ton texte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async (anno: Annotation) => {
    if (activeAnnotation === anno && coachInteraction) return;
    
    setActiveAnnotation(anno);
    setIsExplaining(true);
    setCoachInteraction(null);
    setMiniQuizAnswer(null);
    setShowMiniQuizFeedback(false);
    setShowChatInput(false);
    setChatHistory([]);

    if (window.innerWidth < 1024 && coachPanelRef.current) {
      coachPanelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    try {
      const interaction = await explainConcept(anno, text);
      setCoachInteraction(interaction);
    } catch (error) {
      setCoachInteraction({ explanation: "Désolé, je n'ai pas pu générer l'explication interactive." });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleFollowUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followUpQuery.trim() || isAskingFollowUp) return;

    const userMsg = followUpQuery;
    setFollowUpQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAskingFollowUp(true);

    try {
      const context = `Annotation: ${activeAnnotation?.original} -> ${activeAnnotation?.suggested}. Commentaire: ${activeAnnotation?.comment}. Feedback global: ${result?.feedback}`;
      const aiResponse = await askCoach(userMsg, context);
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Désolé, j'ai eu un problème pour te répondre." }]);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const handleMiniQuizSubmit = (index: number) => {
    setMiniQuizAnswer(index);
    setShowMiniQuizFeedback(true);
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-rose-100/50 border-rose-400 text-rose-900 decoration-rose-400';
      case 'spelling': return 'bg-amber-100/50 border-amber-400 text-amber-900 decoration-amber-400';
      case 'style': return 'bg-sky-100/50 border-sky-400 text-sky-900 decoration-sky-400';
      default: return 'bg-slate-100/50 border-slate-400 text-slate-900';
    }
  };

  const renderAnnotatedText = () => {
    if (!text) return <p className="text-slate-400 italic text-center py-10">Pas de texte à afficher.</p>;
    
    let annotationCounter = 0;

    return (
      <div className="prose prose-slate max-w-none font-serif leading-relaxed text-slate-700 bg-amber-50/20 p-8 rounded-[2rem] border border-amber-100 shadow-inner min-h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
             style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }}></div>
        
        <div className="relative z-10">
          {text.split('\n').map((line, i) => (
            <p key={i} className="mb-6 leading-[2.5rem]">
              {line.split(' ').map((word, j) => {
                const annotation = result?.annotations.find(a => word.toLowerCase().includes(a.original.toLowerCase()) || a.original.toLowerCase().includes(word.toLowerCase()));
                if (annotation) {
                  const currentDelay = (annotationCounter++) * 100; 
                  return (
                    <span 
                      key={`${i}-${j}`}
                      onClick={() => handleExplain(annotation)}
                      style={{ 
                        animationDelay: `${currentDelay}ms`,
                        animationName: 'annotationAppear',
                        animationDuration: '600ms',
                        animationFillMode: 'both',
                        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                      className={`cursor-pointer px-1 rounded-sm transition-all duration-300 border-b-2 relative group inline-block ${
                        activeAnnotation === annotation 
                          ? 'bg-indigo-100 border-indigo-600 scale-110 -translate-y-1 shadow-md z-20 font-bold text-indigo-900' 
                          : `${getAnnotationColor(annotation.type)} hover:bg-opacity-80`
                      }`}
                    >
                      {word}
                      {(activeAnnotation === annotation) && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg font-sans font-black whitespace-nowrap shadow-lg animate-in fade-in zoom-in-90 slide-in-from-bottom-2 z-30">
                          Correction : {annotation.suggested}
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45"></span>
                        </span>
                      )}
                    </span>
                  );
                }
                return <span key={`${i}-${j}`}>{word} </span>;
              })}
            </p>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-8 relative">
          <Sparkles className="text-indigo-600 animate-pulse" size={48} />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analyse de ta copie...</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm italic">Gemini prépare tes corrections personnalisées.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700 fill-mode-both">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6">
                <div className={`text-5xl font-black transition-transform duration-500 group-hover:scale-110 ${result.score >= 15 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {result.score}<span className="text-xl">/20</span>
                </div>
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-3">{result.title}</h3>
             <p className="text-slate-600 mb-8 leading-relaxed italic border-l-4 border-indigo-100 pl-4">{result.feedback}</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
               <div className="space-y-3">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2">
                   <CheckCircle2 className="text-emerald-500" size={18} /> Points forts
                 </h4>
                 {result.strengths.map((s, i) => (
                   <div key={i} className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-medium border border-emerald-100 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> {s}
                   </div>
                 ))}
               </div>
               <div className="space-y-3">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2">
                   <AlertCircle className="text-rose-500" size={18} /> À améliorer
                 </h4>
                 {result.weaknesses.map((w, i) => (
                   <div key={i} className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> {w}
                   </div>
                 ))}
               </div>
             </div>

             <div className="flex flex-col gap-3">
               <button 
                onClick={() => onGenerateQuiz(result.quizPrompt || result.title)}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-50 active:scale-95"
               >
                 <BrainCircuit size={20} /> Générer un quiz de remédiation
               </button>
               <button 
                 onClick={() => setResult(null)} 
                 className="w-full py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 hover:shadow-sm hover:scale-[1.005] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 active:bg-slate-100"
               >
                 <RefreshCw size={20} /> Nouvelle correction
               </button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Eye size={20} className="text-indigo-600" /> Travail annoté
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setShowAnnotatedView(true)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showAnnotatedView ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Annoté</button>
                  <button onClick={() => setShowAnnotatedView(false)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!showAnnotatedView ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Original</button>
                </div>
             </div>
             {showAnnotatedView ? renderAnnotatedText() : (
               <div className="prose prose-slate max-w-none font-serif leading-relaxed text-slate-700 p-8 rounded-[2rem] bg-slate-50 min-h-[300px] whitespace-pre-wrap">{text}</div>
             )}
          </div>
        </div>

        <div className="space-y-6 flex flex-col h-full" ref={coachPanelRef}>
          <div className={`bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex-1 flex flex-col relative transition-all duration-500 ${activeAnnotation ? 'ring-4 ring-indigo-500/30' : 'opacity-50 grayscale pointer-events-none'}`}>
             {!activeAnnotation && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-indigo-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <BrainCircuit size={48} className="text-indigo-400" />
                  </div>
                  <p className="font-bold text-lg text-indigo-200">Clique sur une zone surlignée pour activer ton Coach IA.</p>
               </div>
             )}

             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-700 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                    <Sparkles size={28} className="text-indigo-200" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl leading-tight tracking-tight">Coach IA</h4>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Support Interactif</p>
                  </div>
                </div>
                {activeAnnotation && (
                  <button 
                    onClick={() => { setActiveAnnotation(null); setCoachInteraction(null); setChatHistory([]); }}
                    className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-indigo-300 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                )}
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 relative z-10">
                {isExplaining ? (
                  <div className="space-y-6 py-10 flex flex-col items-center">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                       <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                       <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <div className="space-y-3 w-full text-center">
                       <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-4">Le Coach prépare ton explication...</p>
                       <div className="h-4 bg-indigo-800 rounded-full w-full animate-pulse mt-4"></div>
                       <div className="h-4 bg-indigo-800 rounded-full w-5/6 animate-pulse mx-auto"></div>
                    </div>
                  </div>
                ) : coachInteraction && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-indigo-950/40 p-4 rounded-2xl mb-6 border border-white/5 flex items-center justify-between">
                       <div className="text-xs">
                          <span className="text-indigo-400 block font-bold mb-1 uppercase tracking-tighter">Ton texte :</span>
                          <span className="text-rose-300 line-through font-serif italic text-sm">{activeAnnotation?.original}</span>
                       </div>
                       <ArrowRight size={16} className="text-indigo-500" />
                       <div className="text-xs text-right">
                          <span className="text-indigo-400 block font-bold mb-1 uppercase tracking-tighter">Ma suggestion :</span>
                          <span className="text-emerald-400 font-serif font-bold text-sm">{activeAnnotation?.suggested}</span>
                       </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 mb-8 shadow-xl">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="bg-indigo-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                           <Lightbulb size={12} /> Explication Pédagogique
                        </span>
                        <div className="h-px flex-1 bg-white/10"></div>
                      </div>
                      <p className="text-indigo-50 text-base leading-relaxed font-medium">
                        {coachInteraction.explanation}
                      </p>
                    </div>

                    {coachInteraction.miniExercise && (
                      <div className="bg-indigo-800/40 p-6 rounded-[2rem] border border-white/10 shadow-lg animate-in zoom-in-95 duration-700">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase tracking-widest">
                             <Trophy size={14} className="text-indigo-400" /> Défi de compréhension
                           </div>
                           {!showMiniQuizFeedback && <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full font-bold animate-pulse">Bonus +10 pts</span>}
                        </div>
                        
                        <p className="font-bold text-white mb-6 leading-relaxed text-lg border-l-4 border-indigo-500 pl-4">
                          {coachInteraction.miniExercise.question}
                        </p>
                        
                        <div className="space-y-3">
                          {coachInteraction.miniExercise.options.map((opt, idx) => (
                            <button
                              key={idx}
                              disabled={showMiniQuizFeedback}
                              onClick={() => handleMiniQuizSubmit(idx)}
                              className={`w-full text-left p-5 rounded-2xl text-sm font-bold transition-all border flex items-center justify-between group shadow-sm ${
                                showMiniQuizFeedback
                                  ? idx === coachInteraction.miniExercise!.correctAnswer
                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/30 scale-[1.03] z-10'
                                    : miniQuizAnswer === idx
                                      ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-900/30'
                                      : 'bg-indigo-900/40 border-indigo-700/50 text-indigo-300 opacity-40'
                                  : 'bg-indigo-900/40 border-indigo-700/50 text-indigo-100 hover:bg-indigo-700 hover:border-indigo-600 hover:scale-[1.01]'
                              }`}
                            >
                              <span>{opt}</span>
                              {showMiniQuizFeedback && idx === coachInteraction.miniExercise!.correctAnswer && (
                                <div className="bg-white/20 p-1 rounded-full"><Check size={18} className="animate-in zoom-in-50" /></div>
                              )}
                              {showMiniQuizFeedback && miniQuizAnswer === idx && idx !== coachInteraction.miniExercise!.correctAnswer && (
                                <div className="bg-white/20 p-1 rounded-full"><X size={18} className="animate-in zoom-in-50" /></div>
                              )}
                            </button>
                          ))}
                        </div>

                        {showMiniQuizFeedback && (
                          <div className={`mt-6 p-6 rounded-3xl animate-in slide-in-from-top-3 border-2 ${miniQuizAnswer === coachInteraction.miniExercise.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-50' : 'bg-rose-500/20 border-rose-500/50 text-rose-50'}`}>
                             <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-2xl shadow-lg ${miniQuizAnswer === coachInteraction.miniExercise.correctAnswer ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                  {miniQuizAnswer === coachInteraction.miniExercise.correctAnswer ? (
                                    <CheckCircle2 className="text-white shrink-0" size={20} />
                                  ) : (
                                    <AlertCircle className="text-white shrink-0" size={20} />
                                  )}
                                </div>
                                <div>
                                  <h5 className={`font-black text-lg mb-1 ${miniQuizAnswer === coachInteraction.miniExercise.correctAnswer ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    {miniQuizAnswer === coachInteraction.miniExercise.correctAnswer ? 'C\'est exact !' : 'Pas tout à fait...'}
                                  </h5>
                                  <p className="text-sm leading-relaxed italic font-medium">
                                    {coachInteraction.miniExercise.explanation}
                                  </p>
                                </div>
                             </div>
                             
                             {!showChatInput && (
                               <button 
                                 onClick={() => setShowChatInput(true)}
                                 className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2 mx-auto py-2 px-4 rounded-xl hover:bg-white/5"
                               >
                                 <HelpCircle size={14} /> J'ai une autre question sur ce point
                               </button>
                             )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4 my-8">
                        {chatHistory.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-indigo-50 border border-white/5 rounded-tl-none'}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isAskingFollowUp && (
                          <div className="flex justify-start animate-pulse">
                             <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                             </div>
                          </div>
                        )}
                    </div>
                    <div ref={chatEndRef} className="h-4" />
                  </div>
                )}
             </div>

             {activeAnnotation && (coachInteraction && (showChatInput || chatHistory.length > 0)) && (
               <form onSubmit={handleFollowUp} className="mt-6 relative z-10 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="relative group">
                    <input 
                      type="text"
                      className="w-full bg-indigo-950/50 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-indigo-400/60"
                      placeholder="Demande une précision au Coach..."
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      disabled={isAskingFollowUp}
                    />
                    <button 
                      type="submit"
                      disabled={!followUpQuery.trim() || isAskingFollowUp}
                      className="absolute right-2 top-2 p-3 bg-white text-indigo-900 rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-lg"
                    >
                      {isAskingFollowUp ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                 </div>
                 <p className="text-[10px] text-center mt-3 text-indigo-500 font-black uppercase tracking-[0.2em]">Coach assisté par l'IA Gemini</p>
               </form>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Perfectionne ton travail ✨</h2>
        <p className="text-slate-500 text-lg">L'IA analyse ton document et te propose des pistes d'amélioration concrètes.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-2xl relative">
        <div className="absolute -top-4 -right-4 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg animate-bounce">
          <Sparkles size={24} />
        </div>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setInputMode('text')}
            className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-300 ${
              inputMode === 'text' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileText size={22} /> Saisie manuelle
          </button>
          <button 
            onClick={() => setInputMode('image')}
            className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-300 ${
              inputMode === 'image' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Camera size={22} /> Photo / Scan
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {inputMode === 'text' ? (
            <div className="space-y-6">
              <textarea
                className="w-full h-72 p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 font-serif text-lg leading-relaxed shadow-inner"
                placeholder="Rédigez ou collez votre texte ici... L'IA analysera le style, la grammaire et la structure."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {image ? (
                <div className="relative group overflow-hidden rounded-[2rem] border-4 border-slate-100 shadow-2xl">
                  <img src={image} alt="Copie" className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setImage(null)} className="bg-white p-4 rounded-full shadow-xl text-rose-600 hover:scale-110 transition-transform">
                      <RefreshCw size={24} />
                    </button>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                    <p className="text-indigo-900 text-sm font-black flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500" /> Image prête pour l'analyse
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-80 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group shadow-inner"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 mb-6">
                    <Upload className="text-indigo-600" size={36} />
                  </div>
                  <p className="font-black text-xl text-slate-800">Dépose ta copie ici</p>
                  <p className="text-slate-400 font-medium mt-2">Clique ou glisse un fichier (JPG, PNG)</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <button 
            disabled={(!text && !image) || isLoading}
            onClick={() => handleAnalyze()}
            className="w-full bg-indigo-600 text-white font-bold text-lg py-5 rounded-[1.5rem] hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 active:scale-95 group"
          >
            <Sparkles size={28} className="group-hover:rotate-12 transition-transform" /> Corriger une copie
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes annotationAppear {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CorrectionRoom;
