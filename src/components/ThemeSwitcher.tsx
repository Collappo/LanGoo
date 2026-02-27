import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeType } from '../data/themes';
import { Sun, Moon, Palette, Droplets, TreePine } from 'lucide-react';
import { motion } from 'motion/react';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { type: ThemeType.LIGHT, icon: Sun, label: 'Jasny' },
    { type: ThemeType.DARK, icon: Moon, label: 'Ciemny' },
    { type: ThemeType.PASTEL, icon: Palette, label: 'Pastel' },
    { type: ThemeType.OCEAN, icon: Droplets, label: 'Ocean' },
    { type: ThemeType.FOREST, icon: TreePine, label: 'Las' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-surface rounded-2xl border border-border shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.type}
          onClick={() => setTheme(opt.type)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
            theme === opt.type
              ? 'bg-accent text-white shadow-md'
              : 'hover:bg-bg text-text-muted'
          }`}
        >
          <opt.icon size={16} />
          <span className="text-sm font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
