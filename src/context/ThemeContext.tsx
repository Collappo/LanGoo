import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType, themes } from '../data/themes';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('linguist-theme');
    return (saved as ThemeType) || ThemeType.LIGHT;
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('linguist-theme', newTheme);
  };

  useEffect(() => {
    const colors = themes[theme];
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value as string);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
