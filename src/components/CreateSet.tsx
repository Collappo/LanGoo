import React, { useState } from 'react';
import { WordSet, Word } from '../types';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Save, Trash2, FileText, ArrowDown } from 'lucide-react';

interface CreateSetProps {
  onExit: () => void;
}

export const CreateSet: React.FC<CreateSetProps> = ({ onExit }) => {
  const { setSets } = useData();
  const [name, setName] = useState('');
  const [langA, setLangA] = useState('');
  const [langB, setLangB] = useState('');
  const [words, setWords] = useState<{ id: string; wordA: string; wordB: string }[]>([
    { id: Date.now().toString(), wordA: '', wordB: '' }
  ]);
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const handleAddWord = () => {
    setWords(prev => [...prev, { id: Date.now().toString() + Math.random(), wordA: '', wordB: '' }]);
  };

  const handleRemoveWord = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const handleWordChange = (id: string, field: 'wordA' | 'wordB', value: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    
    const lines = bulkText.split('\n');
    const newWords: { id: string; wordA: string; wordB: string }[] = [];
    
    lines.forEach(line => {
      // Try to split by common separators: tab, dash, comma, semicolon
      let parts = line.split(/\t| - | – | — |,|;/);
      if (parts.length >= 2) {
        newWords.push({
          id: Date.now().toString() + Math.random(),
          wordA: parts[0].trim(),
          wordB: parts[1].trim()
        });
      }
    });

    if (newWords.length > 0) {
      setWords(prev => [...prev, ...newWords]);
      setBulkText('');
      setShowBulk(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !langA.trim() || !langB.trim()) {
      alert('Uzupełnij nazwę zestawu i języki.');
      return;
    }

    const validWords = words.filter(w => w.wordA.trim() && w.wordB.trim());
    if (validWords.length === 0) {
      alert('Dodaj przynajmniej jedno słówko.');
      return;
    }

    const newSet: WordSet = {
      id: Date.now().toString(),
      name: name.trim(),
      langA: langA.trim(),
      langB: langB.trim(),
      words: validWords.map(w => ({
        id: w.id,
        wordA: w.wordA.trim(),
        wordB: w.wordB.trim()
      })),
      createdAt: Date.now()
    };

    setSets(prev => [...prev, newSet]);
    onExit();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-bg/80 backdrop-blur-md py-4 z-10">
        <h2 className="text-3xl font-bold">Nowy Zestaw</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="p-3 bg-primary text-surface rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Save size={20} /> <span className="hidden sm:inline">Zapisz</span>
          </button>
          <button onClick={onExit} className="p-3 bg-surface border border-border rounded-xl hover:bg-border/50 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm">
          <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Nazwa zestawu</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Owoce i Warzywa"
            className="w-full text-2xl font-bold bg-transparent border-b-2 border-border focus:border-accent outline-none py-2 transition-colors placeholder:text-border"
          />
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Język A (Znany)</label>
              <input
                type="text"
                value={langA}
                onChange={(e) => setLangA(e.target.value)}
                placeholder="np. Polski"
                className="w-full bg-bg border border-border rounded-xl p-3 focus:border-accent outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Język B (Obcy)</label>
              <input
                type="text"
                value={langB}
                onChange={(e) => setLangB(e.target.value)}
                placeholder="np. Angielski"
                className="w-full bg-bg border border-border rounded-xl p-3 focus:border-accent outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Słówka <span className="text-sm font-medium px-2 py-1 bg-accent/10 text-accent rounded-full">{words.length}</span>
          </h3>
          <button 
            onClick={() => setShowBulk(!showBulk)}
            className="text-sm font-bold text-accent hover:underline flex items-center gap-1"
          >
            <FileText size={16} /> {showBulk ? 'Ukryj import' : 'Importuj masowo'}
          </button>
        </div>

        <AnimatePresence>
          {showBulk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm mb-6">
                <p className="text-sm text-text-muted mb-4">
                  Wklej listę słówek. Każda linia to nowa para. Oddziel słowa myślnikiem, przecinkiem lub tabulatorem.
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Jabłko - Apple\nGruszka, Pear\nŚliwka\tPlum`}
                  className="w-full h-32 bg-bg border border-border rounded-xl p-4 font-mono text-sm focus:border-accent outline-none resize-none mb-4"
                />
                <button
                  onClick={handleBulkParse}
                  className="w-full py-3 bg-bg border-2 border-dashed border-border hover:border-accent hover:text-accent rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ArrowDown size={18} /> Dodaj do listy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-bg rounded-full text-text-muted text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={word.wordA}
                    onChange={(e) => handleWordChange(word.id, 'wordA', e.target.value)}
                    placeholder="Słowo A"
                    className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 transition-colors"
                  />
                  <input
                    type="text"
                    value={word.wordB}
                    onChange={(e) => handleWordChange(word.id, 'wordB', e.target.value)}
                    placeholder="Słowo B"
                    className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-2 transition-colors"
                  />
                </div>

                <button
                  onClick={() => handleRemoveWord(word.id)}
                  className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
                  title="Usuń"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={handleAddWord}
          className="w-full py-4 bg-bg border-2 border-dashed border-border rounded-2xl text-text-muted font-bold hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2 group"
        >
          <div className="p-1 bg-surface rounded-full group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          Dodaj kolejne słówko
        </button>
      </div>
    </div>
  );
};
