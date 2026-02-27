import React, { createContext, useContext, useState, useEffect } from 'react';
import { WordSet, SetStats, GlobalStats } from '../types';
import { initialData } from '../data/initialData';

interface DataContextType {
  sets: WordSet[];
  setSets: React.Dispatch<React.SetStateAction<WordSet[]>>;
  stats: Record<string, SetStats>;
  globalStats: GlobalStats;
  updateStats: (setId: string, score: number, errors: number, duration: number, mode: any) => void;
  importData: (json: string) => boolean;
  exportData: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sets, setSets] = useState<WordSet[]>(() => {
    const saved = localStorage.getItem('linguist-sets');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [stats, setStats] = useState<Record<string, SetStats>>(() => {
    const saved = localStorage.getItem('linguist-stats');
    return saved ? JSON.parse(saved) : {};
  });

  const [globalStats, setGlobalStats] = useState<GlobalStats>(() => {
    const saved = localStorage.getItem('linguist-global-stats');
    return saved ? JSON.parse(saved) : {
      totalSetsCompleted: 0,
      totalAnswers: 0,
      overallAccuracy: 0,
      totalTimeSpent: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('linguist-sets', JSON.stringify(sets));
  }, [sets]);

  useEffect(() => {
    localStorage.setItem('linguist-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('linguist-global-stats', JSON.stringify(globalStats));
  }, [globalStats]);

  const updateStats = (setId: string, score: number, errors: number, duration: number, mode: any) => {
    const newResult = { date: Date.now(), score, errors, duration, mode };
    
    setStats(prev => {
      const current = prev[setId] || {
        setId,
        attempts: 0,
        averageScore: 0,
        wordsLearned: 0,
        history: []
      };

      const newHistory = [newResult, ...current.history].slice(0, 50);
      const newAttempts = current.attempts + 1;
      const newAvg = (current.averageScore * current.attempts + score) / newAttempts;

      return {
        ...prev,
        [setId]: {
          ...current,
          attempts: newAttempts,
          averageScore: newAvg,
          history: newHistory
        }
      };
    });

    setGlobalStats(prev => {
      const totalAnswers = prev.totalAnswers + (sets.find(s => s.id === setId)?.words.length || 0);
      const newAccuracy = (prev.overallAccuracy * prev.totalAnswers + score * (sets.find(s => s.id === setId)?.words.length || 0)) / totalAnswers;

      return {
        ...prev,
        totalSetsCompleted: prev.totalSetsCompleted + 1,
        totalAnswers,
        overallAccuracy: isNaN(newAccuracy) ? score : newAccuracy,
        totalTimeSpent: prev.totalTimeSpent + duration
      };
    });
  };

  const importData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        setSets(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportData = () => JSON.stringify(sets, null, 2);

  return (
    <DataContext.Provider value={{ sets, setSets, stats, globalStats, updateStats, importData, exportData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
