import { createContext, useContext } from 'react';
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
  success: string;
  warning: string;
}
export const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    bg: '#14151B',
    surface: '#202129',
    surface2: '#292A34',
    text: '#F4F0E8',
    muted: '#B5B3C1',
    border: '#373844',
    accent: '#B7A1F8',
    accentText: '#211638',
    danger: '#FF9B9D',
    success: '#C9E89A',
    warning: '#F4CF91',
  },
  light: {
    bg: '#F6F3EC',
    surface: '#FFFFFF',
    surface2: '#EAE6F2',
    text: '#23202C',
    muted: '#625D70',
    border: '#D6D0DE',
    accent: '#6B43B5',
    accentText: '#FFFFFF',
    danger: '#AD3542',
    success: '#3F651F',
    warning: '#795213',
  },
};
export const tokens = {
  space: [0, 4, 8, 12, 16, 24, 32, 48],
  radius: { sm: 12, md: 20, lg: 28 },
  duration: { short: 180, reveal: 450 },
  maxWidth: 520,
};
export const PaletteContext = createContext<Palette>(palettes.dark);
export const MotionContext = createContext(false);
export const usePalette = () => useContext(PaletteContext);
export const useReducedMotion = () => useContext(MotionContext);
