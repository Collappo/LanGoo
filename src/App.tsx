import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { StatCard } from './components/StatCard';
import { LearnMode } from './modes/LearnMode';
import { FlashcardsMode } from './modes/FlashcardsMode';
import { MemoryMode } from './modes/MemoryMode';
import { Settings } from './components/Settings';
import { WordSet } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { TestMode } from './modes/TestMode';
import { TimeAttackMode } from './modes/TimeAttackMode';
import { ListeningMode } from './modes/ListeningMode';
import { CreateSet } from './components/CreateSet';
import {
  BookOpen,
  Brain,
  Layers,
  Gamepad2,
  Settings as SettingsIcon,
  Plus,
  Clock,
  Target,
  BarChart3,
  Search,
  ChevronRight,
  ClipboardCheck,
  Timer as TimerIcon,
  Headphones,
  Pencil,
  Trash2,
  Github
} from 'lucide-react';

const Dashboard: React.FC<{
  onSelectSet: (set: WordSet, mode: string) => void;
  onOpenSettings: () => void;
  onCreateSet: () => void;
  onEditSet: (set: WordSet) => void;
  onDeleteSet: (set: WordSet) => void;
}> = ({ onSelectSet, onOpenSettings, onCreateSet, onEditSet, onDeleteSet }) => {
  const { sets, globalStats, stats } = useData();
  const [search, setSearch] = useState('');

  const filteredSets = sets.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.langA.toLowerCase().includes(search.toLowerCase()) ||
    s.langB.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">LanGoo</h1>
          <p className="text-text-muted font-medium">Witaj z powrotem! Kontynuuj swoją naukę.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/Collappo" target="_blank"
            className="p-3 bg-surface border border-border rounded-2xl text-text-muted hover:text-text transition-colors shadow-sm"
          >
            <Github />
          </a>

          <button
            onClick={onOpenSettings}
            className="p-3 bg-surface border border-border rounded-2xl text-text-muted hover:text-text transition-colors shadow-sm"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Ukończone sesje" value={globalStats.totalSetsCompleted} icon={BookOpen} />
        <StatCard label="Skuteczność" value={`${Math.round(globalStats.overallAccuracy)}%`} icon={Target} color="text-success" />
        <StatCard label="Czas nauki" value={formatDuration(globalStats.totalTimeSpent)} icon={Clock} color="text-accent" />
        <StatCard label="Wszystkie odpowiedzi" value={globalStats.totalAnswers} icon={BarChart3} color="text-secondary" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Twoje zestawy <span className="text-sm font-medium px-3 py-1 bg-accent/10 text-accent rounded-full">{sets.length}</span>
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Szukaj zestawów..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSets.map((set) => {
          const setStat = stats[set.id];
          return (
            <motion.div
              layoutId={set.id}
              key={set.id}
              className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm card-hover flex flex-col h-full relative group"
            >
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onEditSet(set); }}
                  className="p-2 bg-bg border border-border rounded-xl text-text-muted hover:text-text hover:border-accent transition-all"
                  title="Edytuj"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSet(set); }}
                  className="p-2 bg-bg border border-border rounded-xl text-text-muted hover:text-error hover:border-error transition-all"
                  title="Usuń"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Layers size={24} />
                </div>
                {setStat && (
                  <div className="text-right mr-16 group-hover:mr-24 transition-all">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Skuteczność</p>
                    <p className="text-lg font-bold text-success">{Math.round(setStat.averageScore)}%</p>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-1 pr-16">{set.name}</h3>
              <p className="text-text-muted text-sm font-medium mb-8">
                {set.langA} → {set.langB} • {set.words.length} słówek
              </p>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => onSelectSet(set, 'learn')}
                  className="flex items-center justify-center gap-2 py-3 bg-primary text-surface rounded-xl font-bold hover:opacity-90 transition-all col-span-2"
                >
                  <Brain size={18} /> Ucz się
                </button>
                <button
                  onClick={() => onSelectSet(set, 'test')}
                  className="flex items-center justify-center gap-2 py-3 bg-bg border border-border rounded-xl font-bold hover:border-accent transition-all"
                >
                  <ClipboardCheck size={18} /> Test
                </button>
                <button
                  onClick={() => onSelectSet(set, 'flashcards')}
                  className="flex items-center justify-center gap-2 py-3 bg-bg border border-border rounded-xl font-bold hover:border-accent transition-all"
                >
                  Fiszki
                </button>
                <button
                  onClick={() => onSelectSet(set, 'time_attack')}
                  className="flex items-center justify-center gap-2 py-3 bg-bg border border-border rounded-xl font-bold hover:border-accent transition-all"
                >
                  <TimerIcon size={18} /> Na Czas
                </button>
                <button
                  onClick={() => onSelectSet(set, 'listening')}
                  className="flex items-center justify-center gap-2 py-3 bg-bg border border-border rounded-xl font-bold hover:border-accent transition-all"
                >
                  <Headphones size={18} /> Ze Słuchu
                </button>
                <button
                  onClick={() => onSelectSet(set, 'memory')}
                  className="flex items-center justify-center gap-2 py-3 bg-bg border border-border rounded-xl font-bold hover:border-accent transition-all col-span-2"
                >
                  <Gamepad2 size={18} /> Memory
                </button>
              </div>
            </motion.div>
          );
        })}

        <button
          onClick={onCreateSet}
          className="bg-bg border-2 border-dashed border-border p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-text-muted hover:border-accent hover:text-accent transition-all group min-h-[300px]"
        >
          <div className="p-4 bg-surface rounded-full group-hover:scale-110 transition-transform shadow-sm">
            <Plus size={32} />
          </div>
          <span className="font-bold">Dodaj nowy zestaw</span>
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { setSets } = useData();
  const [activeSet, setActiveSet] = useState<WordSet | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [editingSet, setEditingSet] = useState<WordSet | undefined>(undefined);

  const handleSelectSet = (set: WordSet, mode: string) => {
    setActiveSet(set);
    setActiveMode(mode);
  };

  const handleExit = () => {
    setActiveSet(null);
    setActiveMode(null);
    setShowSettings(false);
    setShowCreateSet(false);
    setEditingSet(undefined);
  };

  const handleEditSet = (set: WordSet) => {
    setEditingSet(set);
    setShowCreateSet(true);
  };

  const handleDeleteSet = (set: WordSet) => {
    if (confirm(`Czy na pewno chcesz usunąć zestaw "${set.name}"?`)) {
      setSets(prev => prev.filter(s => s.id !== set.id));
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-accent/30">
      <AnimatePresence mode="wait">
        {!activeSet && !showSettings && !showCreateSet && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard
              onSelectSet={handleSelectSet}
              onOpenSettings={() => setShowSettings(true)}
              onCreateSet={() => { setEditingSet(undefined); setShowCreateSet(true); }}
              onEditSet={handleEditSet}
              onDeleteSet={handleDeleteSet}
            />
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-6xl mx-auto px-4 py-10"
          >
            <Settings onExit={handleExit} />
          </motion.div>
        )}

        {showCreateSet && (
          <motion.div
            key="createSet"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-6xl mx-auto px-4 py-10"
          >
            <CreateSet onExit={handleExit} initialSet={editingSet} />
          </motion.div>
        )}

        {activeSet && activeMode === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="px-4 py-10"
          >
            <LearnMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}

        {activeSet && activeMode === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="px-4 py-10"
          >
            <TestMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}

        {activeSet && activeMode === 'flashcards' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="px-4 py-10"
          >
            <FlashcardsMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}

        {activeSet && activeMode === 'time_attack' && (
          <motion.div
            key="time_attack"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="px-4 py-10"
          >
            <TimeAttackMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}

        {activeSet && activeMode === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="px-4 py-10"
          >
            <ListeningMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}

        {activeSet && activeMode === 'memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-10"
          >
            <MemoryMode set={activeSet} onExit={handleExit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}
