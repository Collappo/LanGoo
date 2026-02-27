import React, { useState, useEffect, useMemo } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { shuffle, getRandomItems } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Volume2, Headphones } from 'lucide-react';

interface ListeningModeProps {
  set: WordSet;
  onExit: () => void;
}

const getLangCode = (lang: string) => {
  const l = lang.toLowerCase();
  if (l.includes('ang')) return 'en-US';
  if (l.includes('pol')) return 'pl-PL';
  if (l.includes('niem')) return 'de-DE';
  if (l.includes('hisz')) return 'es-ES';
  if (l.includes('fran')) return 'fr-FR';
  if (l.includes('włos') || l.includes('wlos')) return 'it-IT';
  return 'en-US';
};

export const ListeningMode: React.FC<ListeningModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  const [questions] = useState(() => shuffle(set.words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = questions[currentIndex];
  
  // Always play the foreign language (langB) and ask to translate to langA
  const langCode = getLangCode(set.langB);

  const currentQuestion = useMemo(() => {
    if (!currentWord) return null;
    const correctAnswer = currentWord.wordA;
    const otherWords = set.words.filter(w => w.id !== currentWord.id);
    const wrongOptions = getRandomItems(otherWords.map(w => w.wordA), 3);
    return {
      correctAnswer,
      options: shuffle([correctAnswer, ...wrongOptions]),
    };
  }, [currentWord, set.words]);

  const playAudio = () => {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.wordB);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    window.speechSynthesis.cancel(); // stop any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isFinished && currentWord) {
      playAudio();
    }
  }, [currentIndex, isFinished, currentWord]);

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
    }, 1500);
  };

  useEffect(() => {
    if (isFinished) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const correctCount = answers.filter(a => a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      updateStats(set.id, score, questions.length - correctCount, duration, 'listening');
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
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Headphones size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Trening słuchu ukończony!</h2>
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
          <div className="text-center mb-10 flex flex-col items-center">
            <button 
              onClick={playAudio}
              className="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/30 mb-6"
            >
              <Volume2 size={40} />
            </button>
            <p className="text-text-muted font-medium">Posłuchaj i wybierz poprawne tłumaczenie</p>
            {selectedOption !== null && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mt-4 text-accent"
              >
                {currentWord.wordB}
              </motion.p>
            )}
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
