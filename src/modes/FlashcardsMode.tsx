import React, { useState } from 'react';
import { WordSet, Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

interface FlashcardsModeProps {
  set: WordSet;
  onExit: () => void;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const currentWord = set.words[currentIndex];

  const handleMark = (known: boolean) => {
    if (known) {
      setKnownWords(prev => [...new Set([...prev, currentWord.id])]);
    }
    
    if (currentIndex < set.words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
    } else {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.round((knownWords.length / set.words.length) * 100);
      updateStats(set.id, score, set.words.length - knownWords.length, duration, 'flashcards');
      onExit();
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <button onClick={onExit} className="text-text-muted hover:text-text transition-colors flex items-center gap-2">
          <X size={20} /> Wyjdź
        </button>
        <span className="text-sm font-bold text-text-muted">{currentIndex + 1} / {set.words.length}</span>
      </div>

      <div className="perspective-1000 h-[400px] w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-full h-full transition-all duration-500 preserve-3d"
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-surface border border-border rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-10 text-center">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4">{set.langA}</span>
            <h3 className="text-4xl font-bold">{currentWord.wordA}</h3>
            <p className="mt-10 text-text-muted text-sm animate-pulse">Kliknij, aby odwrócić</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden bg-surface border border-border rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-10 text-center"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4">{set.langB}</span>
            <h3 className="text-4xl font-bold text-accent">{currentWord.wordB}</h3>
            {currentWord.extra && <p className="mt-4 text-text-muted italic">{currentWord.extra}</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleMark(false); }}
          className="py-4 bg-error/10 text-error rounded-2xl font-bold hover:bg-error/20 transition-all flex items-center justify-center gap-2"
        >
          <X size={20} /> Nie umiem
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleMark(true); }}
          className="py-4 bg-success/10 text-success rounded-2xl font-bold hover:bg-success/20 transition-all flex items-center justify-center gap-2"
        >
          <Check size={20} /> Umiem
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};
