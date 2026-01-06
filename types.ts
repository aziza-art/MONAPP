
export interface UserProfile {
  name: string;
  email: string;
  role: 'admin' | 'user';
  points: number;
  level: number;
  badges: string[];
}

export interface Annotation {
  original: string;
  suggested: string;
  comment: string;
  type: 'grammar' | 'spelling' | 'style' | 'content';
}

export interface CorrectionResult {
  id: string;
  date: string;
  title: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  annotations: Annotation[];
  concepts: { name: string; score: number }[];
  quizPrompt?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  questions: QuizQuestion[];
}

export interface ProgressStats {
  averageScore: number;
  quizzesCompleted: number;
  copiesCorrected: number;
  subjectMastery: { subject: string; value: number }[];
}

export interface CoachInteraction {
  explanation: string;
  miniExercise?: QuizQuestion;
}
