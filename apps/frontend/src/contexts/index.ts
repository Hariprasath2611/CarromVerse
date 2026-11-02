import React, { createContext, useContext, ReactNode } from 'react';
import { THEME } from '../constants/theme.js';

export interface ThemeContextValue {
  theme: typeof THEME;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: THEME,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return React.createElement(ThemeContext.Provider, { value: { theme: THEME } }, children);
};

export const useTheme = () => useContext(ThemeContext);

