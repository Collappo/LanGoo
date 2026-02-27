import React, { useState, useEffect } from 'react';
import { WordSet } from '../types';
import { shuffle } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';

interface MemoryModeProps {
  set: WordSet;
  onExit: () => void;
}

interface Card {
  id: string;
  content: string;
  wordId: string;
  type: 'A' | 'B';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMode: React.FC<MemoryModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const gameWords = set.words.slice(0, 8); // Max 8 pairs for memory
    const initialCards: Card[] = [];
    
    gameWords.forEach(w => {
      initialCards.push({
        id: `A-${w.id}`,
        content: w.wordA,
        wordId: w.id,
        type: 'A',
        isFlipped: false,
        isMatched: false
      });
      initialCards.push({
        id: `B-${w.id}`,
        content: w.wordB,
        wordId: w.id,
        type: 'B',
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(shuffle(initialCards));
  }, [set]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].wordId === cards[secondIdx].wordId) {
        // Match!
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;
            return updated;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setIsFinished(true);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      updateStats(set.id, 100, moves, duration, 'memory');
    }
  }, [cards]);

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-surface p-10 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <Trophy size={64} className="text-accent mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Gratulacje!</h2>
        <p className="text-text-muted mb-8">Ukończyłeś grę w {moves} ruchach.</p>
        <button
          onClick={onExit}
          className="w-full py-4 bg-primary text-surface rounded-2xl font-bold hover:opacity-90 transition-all"
        >
          Wróć do panelu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <button onClick={onExit} className="text-text-muted hover:text-text transition-colors flex items-center gap-2">
          <X size={20} /> Wyjdź
        </button>
        <div className="flex gap-6 font-bold text-text-muted">
          <span>Ruchy: {moves}</span>
          <span>Pary: {cards.filter(c => c.isMatched).length / 2} / {cards.length / 2}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-2xl cursor-pointer transition-all duration-500 preserve-3d relative ${
              card.isMatched ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <div className={`absolute inset-0 w-full h-full transition-all duration-500 preserve-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Back (Hidden) */}
              <div className="absolute inset-0 backface-hidden bg-surface border-2 border-border rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
              </div>
              {/* Front (Content) */}
              <div 
                className="absolute inset-0 backface-hidden bg-accent text-white rounded-2xl flex items-center justify-center p-4 text-center font-bold text-sm rotate-y-180"
              >
                {card.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
