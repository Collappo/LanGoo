import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { shuffle, getRandomItems } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ArrowRight, Trophy, AlertCircle, Type, Brain, ListOrdered, Shuffle } from 'lucide-react';

interface LearnModeProps {
  set: WordSet;
  onExit: () => void;
}

interface QueueItem {
  word: Word;
  isReverse: boolean;
  stage: number; // 0 = multiple choice, 1 = typing
  id: string; // unique id for the queue item
}

export const LearnMode: React.FC<LearnModeProps> = ({ set, onExit }) => {
  const { updateStats } = useData();
  
  const [isStarted, setIsStarted] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [wordProgress, setWordProgress] = useState<Record<string, number>>({});
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    expected?: string;
    actual?: string;
    selectedOption?: string;
  } | null>(null);

  // Typing state
  const [typedAnswer, setTypedAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStart = (random: boolean) => {
    const initialWords = random ? shuffle<Word>(set.words) : [...set.words];
    setQueue(initialWords.map((w, i) => ({
      word: w,
      isReverse: Math.random() > 0.5,
      stage: 0,
      id: `${w.id}-${i}`
    })));
    
    const initialProgress: Record<string, number> = {};
    set.words.forEach(w => initialProgress[w.id] = 0);
    setWordProgress(initialProgress);
    
    setIsStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const currentItem = queue[currentIndex];
  
  const currentProgress = Object.values(wordProgress).reduce((a: number, b: number) => a + b, 0);
  const totalProgress = set.words.length * 2;
  const progressPercent = (Number(currentProgress) / totalProgress) * 100;
  const masteredCount = Object.values(wordProgress).filter(v => v === 2).length;

  // Generate multiple choice options
  const currentOptions = useMemo(() => {
    if (!currentItem || currentItem.stage !== 0) return [];
    
    const correctAnswer = currentItem.isReverse ? currentItem.word.wordA : currentItem.word.wordB;
    const otherWords = set.words.filter(w => w.id !== currentItem.word.id);
    const wrongOptions = getRandomItems(
      otherWords.map(w => currentItem.isReverse ? w.wordA : w.wordB),
      3
    );
    return shuffle([correctAnswer, ...wrongOptions]);
  }, [currentItem, set.words]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setTypedAnswer('');
    setShowFeedback(false);
    setFeedbackData(null);
    if (currentItem?.stage === 1 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, currentItem]);

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const processAnswer = (isCorrect: boolean, actual?: string, expected?: string, selectedOption?: string) => {
    const timeTaken = Date.now() - questionStartTime;
    
    setFeedbackData({ isCorrect, actual, expected, selectedOption });
    setShowFeedback(true);

    if (!isCorrect) {
      setWrongAnswers(prev => new Set(prev).add(currentItem.word.id));
    } else {
      if (currentItem.stage === 0) {
        if (timeTaken <= 6000) {
          setWordProgress(prev => ({ ...prev, [currentItem.word.id]: Math.max(prev[currentItem.word.id] || 0, 1) }));
        }
      } else if (currentItem.stage === 1) {
        if (timeTaken <= 12000) {
          setWordProgress(prev => ({ ...prev, [currentItem.word.id]: Math.max(prev[currentItem.word.id] || 0, 2) }));
        }
      }
    }

    // Queue logic
    setQueue(prev => {
      const newQueue = [...prev];
      if (isCorrect) {
        if (currentItem.stage === 0) {
          if (timeTaken > 6000) {
            // Took too long, repeat stage 0 later, then stage 1
            newQueue.push({ ...currentItem, isReverse: !currentItem.isReverse, id: Date.now().toString() });
          } else {
            // Fast enough, move to stage 1 (typing)
            newQueue.push({ ...currentItem, stage: 1, isReverse: !currentItem.isReverse, id: Date.now().toString() });
          }
        } else if (currentItem.stage === 1) {
          if (timeTaken > 12000) {
            // Took too long typing, repeat stage 1
            newQueue.push({ ...currentItem, isReverse: !currentItem.isReverse, id: Date.now().toString() });
          }
          // Else mastered! Don't add to queue.
        }
      } else {
        // Wrong answer
        if (currentItem.stage === 0) {
          // Repeat stage 0
          newQueue.push({ ...currentItem, isReverse: !currentItem.isReverse, id: Date.now().toString() });
        } else {
          // Demote to stage 0
          newQueue.push({ ...currentItem, stage: 0, isReverse: !currentItem.isReverse, id: Date.now().toString() });
        }
      }
      return newQueue;
    });

    // If correct, auto-advance after a short delay. If wrong, wait for user to click Next.
    if (isCorrect) {
      setTimeout(handleNext, 1000);
    }
  };

  const handleChoiceClick = (option: string) => {
    if (showFeedback) return;
    const expected = currentItem.isReverse ? currentItem.word.wordA : currentItem.word.wordB;
    const isCorrect = option === expected;
    processAnswer(isCorrect, option, expected, option);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback || !typedAnswer.trim()) return;
    
    const expected = currentItem.isReverse ? currentItem.word.wordA : currentItem.word.wordB;
    // Simple normalization for comparison (trim, lowercase)
    const normalizedActual = typedAnswer.trim().toLowerCase();
    const normalizedExpected = expected.trim().toLowerCase();
    
    const isCorrect = normalizedActual === normalizedExpected;
    processAnswer(isCorrect, typedAnswer.trim(), expected);
  };

  useEffect(() => {
    if (isFinished) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.round(((set.words.length - wrongAnswers.size) / set.words.length) * 100);
      updateStats(set.id, score, wrongAnswers.size, duration, 'learn');
    }
  }, [isFinished]);

  const renderDiff = (expected: string, actual: string) => {
    const maxLength = Math.max(expected.length, actual.length);
    const chars = [];
    for (let i = 0; i < maxLength; i++) {
      const expectedChar = expected[i] || '';
      const actualChar = actual[i] || '';
      const isCorrect = expectedChar.toLowerCase() === actualChar.toLowerCase();

      if (isCorrect) {
        chars.push(<span key={i} className="text-success">{actualChar}</span>);
      } else {
        chars.push(
          <span key={i} className="text-error bg-error/20 rounded-sm px-[2px] mx-[1px] border-b-2 border-error">
            {actualChar || '_'}
          </span>
        );
      }
    }
    return <div className="text-3xl font-mono tracking-widest bg-bg p-4 rounded-xl inline-block mb-4">{chars}</div>;
  };

  if (!isStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-surface p-10 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Tryb nauki</h2>
        <p className="text-text-muted mb-8">Jak chcesz wyświetlać słówka w tym zestawie?</p>
        
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleStart(false)}
            className="p-5 bg-bg border-2 border-border rounded-2xl font-bold hover:border-accent transition-all flex items-center justify-center gap-3 text-lg"
          >
            <ListOrdered size={24} /> Po kolei
          </button>
          <button
            onClick={() => handleStart(true)}
            className="p-5 bg-bg border-2 border-border rounded-2xl font-bold hover:border-accent transition-all flex items-center justify-center gap-3 text-lg"
          >
            <Shuffle size={24} /> Losowo
          </button>
        </div>
        
        <button onClick={onExit} className="mt-8 text-text-muted hover:text-text font-medium">
          Anuluj
        </button>
      </motion.div>
    );
  }

  if (isFinished) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.round(((set.words.length - wrongAnswers.size) / set.words.length) * 100);

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
        <p className="text-text-muted mb-10">Opanowałeś wszystkie słówka z tego zestawu.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Skuteczność</p>
            <p className="text-2xl font-bold text-accent">{score}%</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Słówka z błędem</p>
            <p className="text-2xl font-bold text-error">{wrongAnswers.size}</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Czas</p>
            <p className="text-2xl font-bold">{Math.floor(duration / 60)}m {duration % 60}s</p>
          </div>
          <div className="bg-bg p-6 rounded-3xl">
            <p className="text-text-muted text-sm mb-1">Wszystkie pytania</p>
            <p className="text-2xl font-bold">{queue.length}</p>
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
              animate={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-text-muted">{masteredCount} / {set.words.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface p-10 rounded-[2.5rem] border border-border shadow-lg"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm font-bold text-accent uppercase tracking-widest">
                Przetłumacz na {currentItem.isReverse ? set.langA : set.langB}
              </span>
              {currentItem.stage === 1 && (
                <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-bold flex items-center gap-1">
                  <Type size={12} /> Pisanie
                </span>
              )}
            </div>
            <h3 className="text-4xl font-bold text-text">
              {currentItem.isReverse ? currentItem.word.wordB : currentItem.word.wordA}
            </h3>
          </div>

          {currentItem.stage === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {currentOptions.map((option, idx) => {
                const isSelected = feedbackData?.selectedOption === option;
                const isCorrectOption = option === feedbackData?.expected;
                
                let btnClass = "bg-bg border-border text-text hover:border-accent";
                if (showFeedback) {
                  if (isCorrectOption) btnClass = "bg-success/10 border-success text-success";
                  else if (isSelected) btnClass = "bg-error/10 border-error text-error";
                  else btnClass = "opacity-50 border-border";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleChoiceClick(option)}
                    disabled={showFeedback}
                    className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all flex justify-between items-center ${btnClass}`}
                  >
                    <span>{option}</span>
                    {showFeedback && isCorrectOption && <Check size={20} />}
                    {showFeedback && isSelected && !isCorrectOption && <X size={20} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              {!showFeedback ? (
                <form onSubmit={handleTypeSubmit} className="flex flex-col gap-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Wpisz tłumaczenie..."
                    className="w-full p-6 text-xl bg-bg border-2 border-border rounded-2xl focus:outline-none focus:border-accent transition-colors text-center font-medium"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim()}
                    className="w-full py-4 bg-primary text-surface rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    Sprawdź
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  {feedbackData?.isCorrect ? (
                    <div className="p-6 bg-success/10 border-2 border-success rounded-2xl text-success flex flex-col items-center gap-2">
                      <Check size={40} />
                      <p className="text-xl font-bold">Idealnie!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-text-muted mb-2 font-medium">Twoja odpowiedź:</p>
                      {renderDiff(feedbackData?.expected || '', feedbackData?.actual || '')}
                      
                      <p className="text-text-muted mb-2 mt-4 font-medium">Poprawna odpowiedź:</p>
                      <div className="text-3xl font-bold text-success bg-success/10 p-4 rounded-xl inline-block border border-success/30">
                        {feedbackData?.expected}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showFeedback && !feedbackData?.isCorrect && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <button
                onClick={handleNext}
                className="w-full py-4 bg-primary text-surface rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Dalej <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
