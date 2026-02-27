export interface Word {
  id: string;
  wordA: string; // Source language
  wordB: string; // Target language
  extra?: string;
}

export interface WordSet {
  id: string;
  name: string;
  langA: string;
  langB: string;
  words: Word[];
  createdAt: number;
}

export interface SessionResult {
  date: number;
  score: number; // Percentage
  errors: number;
  duration: number; // Seconds
  mode: 'learn' | 'test' | 'flashcards' | 'memory';
}

export interface SetStats {
  setId: string;
  attempts: number;
  averageScore: number;
  wordsLearned: number;
  history: SessionResult[];
}

export interface GlobalStats {
  totalSetsCompleted: number;
  totalAnswers: number;
  overallAccuracy: number;
  totalTimeSpent: number; // Seconds
}

export interface AppData {
  sets: WordSet[];
  stats: {
    sets: Record<string, SetStats>;
    global: GlobalStats;
  };
}
