import React, { useState } from 'react';
import { WordSet } from '../types';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import { X, Save, Download, Upload, Trash2, Plus, Info, Palette } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Settings: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { sets, setSets, importData, exportData } = useData();
  const [importValue, setImportValue] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(data);
    setStatus({ type: 'success', msg: 'Skopiowano do schowka!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImport = () => {
    if (importData(importValue)) {
      setStatus({ type: 'success', msg: 'Dane zaimportowane pomyślnie!' });
      setImportValue('');
    } else {
      setStatus({ type: 'error', msg: 'Błędny format JSON.' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const clearAll = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie zestawy?')) {
      setSets([]);
      localStorage.removeItem('linguist-sets');
      localStorage.removeItem('linguist-stats');
      localStorage.removeItem('linguist-global-stats');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Ustawienia i Dane</h2>
        <button onClick={onExit} className="p-2 hover:bg-surface rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Section */}
        <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <Palette size={20} />
            </div>
            <h3 className="text-xl font-bold">Wygląd aplikacji</h3>
          </div>
          <p className="text-text-muted text-sm mb-6">Wybierz motyw kolorystyczny, który najbardziej Ci odpowiada.</p>
          <ThemeSwitcher />
        </div>

        {/* Export Section */}
        <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <Download size={20} />
            </div>
            <h3 className="text-xl font-bold">Eksportuj dane</h3>
          </div>
          <p className="text-text-muted text-sm mb-6">Pobierz swoje zestawy słówek w formacie JSON, aby zachować kopię zapasową lub przenieść je na inne urządzenie.</p>
          <button
            onClick={handleExport}
            className="w-full py-4 bg-bg border border-border rounded-2xl font-bold hover:border-accent transition-all flex items-center justify-center gap-2"
          >
            Kopiuj JSON do schowka
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <Upload size={20} />
            </div>
            <h3 className="text-xl font-bold">Importuj dane</h3>
          </div>
          <textarea
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            placeholder="Wklej tutaj kod JSON..."
            className="w-full h-32 bg-bg border border-border rounded-2xl p-4 text-sm font-mono mb-4 focus:outline-none focus:border-accent transition-colors resize-none"
          />
          <button
            onClick={handleImport}
            className="w-full py-4 bg-primary text-surface rounded-2xl font-bold hover:opacity-90 transition-all"
          >
            Importuj zestawy
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-error/10 text-error rounded-xl">
              <Trash2 size={20} />
            </div>
            <h3 className="text-xl font-bold">Strefa niebezpieczna</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-text-muted text-sm">Usunięcie wszystkich danych jest nieodwracalne. Upewnij się, że masz kopię zapasową.</p>
            <button
              onClick={clearAll}
              className="px-8 py-4 bg-error text-white rounded-2xl font-bold hover:opacity-90 transition-all"
            >
              Wyczyść wszystko
            </button>
          </div>
        </div>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg border ${
            status.type === 'success' ? 'bg-success text-white border-success' : 'bg-error text-white border-error'
          }`}
        >
          {status.msg}
        </motion.div>
      )}
    </div>
  );
};
