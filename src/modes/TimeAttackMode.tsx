import React, { useState, useEffect, useMemo } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { shuffle, getRandomItems } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Timer as TimerIcon, Zap } from 'lucide-react';

interface TimeAttackModeProps {
  set: WordSet;
  onExit: () => void;
}

export const TimeAttackMode: React.FC<TimeAttackModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentWord, setCurrentWord] = useState<Word>(() => getRandomItems(set.words, 1)[0]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = useMemo(() => {
    if (!currentWord) return null;
    const isReverse = Math.random() > 0.5;
    const correctAnswer = isReverse ? currentWord.wordA : currentWord.wordB;
    const otherWords = set.words.filter(w => w.id !== currentWord.id);
    const wrongOptions = getRandomItems(
      otherWords.map(w => isReverse ? w.wordA : w.wordB),
      3
    );
    return {
      correctAnswer,
      options: shuffle([correctAnswer, ...wrongOptions]),
      isReverse
    };
  }, [currentWord, set.words]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (isFinished) {
      // In time attack, score is absolute number of correct answers.
      // We'll save it as a percentage of a "good" score (e.g., 30 is 100%) just for stats,
      // or just pass the raw score. Let's pass a normalized score.
      const normalizedScore = Math.min(Math.round((score / 30) * 100), 100);
      updateStats(set.id, normalizedScore, 0, 60, 'time_attack');
    }
  }, [isFinished]);

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    
    if (option === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 1);
    } else {
      // Penalty for wrong answer? Let's just not give a point.
    }

    setTimeout(() => {
      setCurrentWord(getRandomItems(set.words, 1)[0]);
      setSelectedOption(null);
    }, 400); // Fast transition for time attack
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-surface p-10 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Czas minął!</h2>
        <p className="text-text-muted mb-8">Twój wynik to <span className="text-2xl font-bold text-accent">{score}</span> poprawnych odpowiedzi w 60 sekund.</p>
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
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <button onClick={onExit} className="text-text-muted hover:text-text transition-colors flex items-center gap-2">
          <X size={20} /> Przerwij
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-bold text-accent">
            <Zap size={24} /> {score}
          </div>
          <div className={`flex items-center gap-2 text-xl font-bold ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-text'}`}>
            <TimerIcon size={24} /> 0:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id + score}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg"
        >
          <div className="text-center mb-10">
            <h3 className="text-4xl font-bold">
              {currentQuestion?.isReverse ? currentWord.wordB : currentWord.wordA}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null}
                className={`w-full p-6 rounded-2xl border-2 text-center font-bold text-lg transition-all ${
                  selectedOption === null 
                    ? 'bg-bg border-border hover:border-accent' 
                    : option === currentQuestion.correctAnswer
                      ? 'bg-success/10 border-success text-success'
                      : selectedOption === option
                        ? 'bg-error/10 border-error text-error'
                        : 'opacity-50 border-border'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
