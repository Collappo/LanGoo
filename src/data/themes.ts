export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  PASTEL = 'pastel',
  OCEAN = 'ocean',
  FOREST = 'forest'
}

export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  error: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  [ThemeType.LIGHT]: {
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
  },
  [ThemeType.DARK]: {
    bg: '#0F172A',
    surface: '#1E293B',
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    text: '#F8FAFC',
    textMuted: '#64748B',
    border: '#334155',
    accent: '#60A5FA',
    success: '#34D399',
    error: '#F87171',
  },
  [ThemeType.PASTEL]: {
    bg: '#FFF9F5',
    surface: '#FFFFFF',
    primary: '#5D5D5D',
    secondary: '#8E8E8E',
    text: '#4A4A4A',
    textMuted: '#A0A0A0',
    border: '#F3E5F5',
    accent: '#CE93D8',
    success: '#A5D6A7',
    error: '#EF9A9A',
  },
  [ThemeType.OCEAN]: {
    bg: '#F0F9FF',
    surface: '#FFFFFF',
    primary: '#075985',
    secondary: '#0369A1',
    text: '#0C4A6E',
    textMuted: '#7DD3FC',
    border: '#BAE6FD',
    accent: '#0EA5E9',
    success: '#2DD4BF',
    error: '#FB7185',
  },
  [ThemeType.FOREST]: {
    bg: '#F0FDF4',
    surface: '#FFFFFF',
    primary: '#166534',
    secondary: '#15803D',
    text: '#064E3B',
    textMuted: '#86EFAC',
    border: '#BBF7D0',
    accent: '#22C55E',
    success: '#4ADE80',
    error: '#F87171',
  }
};
