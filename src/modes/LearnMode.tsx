import React, { useState, useEffect, useMemo } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { shuffle, getRandomItems } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, ArrowRight, Trophy, Clock, AlertCircle } from 'lucide-react';

interface LearnModeProps {
  set: WordSet;
  onExit: () => void;
}

interface Question {
  word: Word;
  correctAnswer: string;
  options: string[];
  isReverse: boolean; // if true, wordB is shown, wordA is target
}

export const LearnMode: React.FC<LearnModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [queue, setQueue] = useState<Word[]>(() => shuffle(set.words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Word[]>([]);
  const [history, setHistory] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalRepetitions, setTotalRepetitions] = useState(0);

  const currentWord = queue[currentIndex];
  
  // Generate question for current word
  const question = useMemo<Question | null>(() => {
    if (!currentWord || isFinished) return null;
    
    const isReverse = Math.random() > 0.5;
    const correctAnswer = isReverse ? currentWord.wordA : currentWord.wordB;
    
    // Get 3 random wrong answers from the same set
    const otherWords = set.words.filter(w => w.id !== currentWord.id);
    const wrongOptions = getRandomItems(
      otherWords.map(w => isReverse ? w.wordA : w.wordB),
      3
    );
    
    return {
      word: currentWord,
      correctAnswer,
      options: shuffle([correctAnswer, ...wrongOptions]),
      isReverse
    };
  }, [currentWord, isFinished, set.words]);

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === question?.correctAnswer;
    setIsCorrect(correct);

    if (!correct) {
      // Add to end of queue if wrong
      setQueue(prev => [...prev, currentWord]);
      setWrongAnswers(prev => [...prev, currentWord]);
      setTotalRepetitions(prev => prev + 1);
    }

    setHistory(prev => [...prev, { wordId: currentWord.id, correct }]);

    setTimeout(() => {
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  useEffect(() => {
    if (isFinished) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const correctCount = history.filter(h => h.correct).length;
      const score = Math.round((correctCount / history.length) * 100);
      updateStats(set.id, score, wrongAnswers.length, duration, 'learn');
    }
  }, [isFinished]);

  if (isFinished) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = history.filter(h => h.correct).length;
    const score = Math.round((correctCount / history.length) * 100);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-surface p-10 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Świetna robota!</h2>
        <p className="text-text-muted mb-10">Ukończyłeś sesję nauki zestawu: {set.name}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Skuteczność</p>
            <p className="text-2xl font-bold text-accent">{score}%</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Błędy</p>
            <p className="text-2xl font-bold text-error">{wrongAnswers.length}</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Czas</p>
            <p className="text-2xl font-bold">{Math.floor(duration / 60)}m {duration % 60}s</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Powtórzenia</p>
            <p className="text-2xl font-bold">{totalRepetitions}</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="w-full py-4 bg-primary text-surface rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          Wróć do panelu <ArrowRight size={20} />
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
        <div className="flex items-center gap-4">
          <div className="h-2 w-48 bg-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / queue.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-text-muted">{currentIndex + 1} / {queue.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg"
        >
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-accent uppercase tracking-widest mb-4 block">
              Przetłumacz na {question?.isReverse ? set.langA : set.langB}
            </span>
            <h3 className="text-4xl font-bold text-text">
              {question?.isReverse ? currentWord.wordB : currentWord.wordA}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {question?.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === question.correctAnswer;
              
              let btnClass = "bg-bg border-border text-text hover:border-accent";
              if (selectedOption !== null) {
                if (isCorrectOption) btnClass = "bg-success/10 border-success text-success";
                else if (isSelected) btnClass = "bg-error/10 border-error text-error";
                else btnClass = "opacity-50 border-border";
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedOption !== null}
                  className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all flex justify-between items-center ${btnClass}`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isCorrectOption && <Check size={20} />}
                  {selectedOption !== null && isSelected && !isCorrectOption && <X size={20} />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {isCorrect === false && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-error/5 border border-error/20 rounded-2xl flex items-center gap-3 text-error"
        >
          <AlertCircle size={20} />
          <p className="text-sm font-medium">Błędna odpowiedź. Słówko wróci na koniec tury.</p>
        </motion.div>
      )}
    </div>
  );
};
