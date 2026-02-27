import React, { useState, useMemo, useEffect } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { shuffle, getRandomItems } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ArrowRight, Trophy, Clock } from 'lucide-react';

interface TestModeProps {
  set: WordSet;
  onExit: () => void;
}

export const TestMode: React.FC<TestModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [questions] = useState(() => shuffle(set.words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = questions[currentIndex];

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

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    const correct = option === currentQuestion?.correctAnswer;
    
    setAnswers(prev => [...prev, { wordId: currentWord.id, correct }]);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
      }
    }, 1000);
  };

  useEffect(() => {
    if (isFinished) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const correctCount = answers.filter(a => a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      updateStats(set.id, score, questions.length - correctCount, duration, 'test');
    }
  }, [isFinished]);

  if (isFinished) {
    const correctCount = answers.filter(a => a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-surface p-10 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <Trophy size={64} className="text-accent mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Test ukończony!</h2>
        <p className="text-text-muted mb-8">Twój wynik to {score}% ({correctCount}/{questions.length})</p>
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
        <span className="text-sm font-bold text-text-muted">{currentIndex + 1} / {questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold">
              {currentQuestion?.isReverse ? currentWord.wordB : currentWord.wordA}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null}
                className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all ${
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
