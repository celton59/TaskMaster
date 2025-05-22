import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Intenta obtener el tema del localStorage o usa "dark" como predeterminado
  const [theme, setThemeState] = useState<Theme>(() => {
    // Comprueba si estamos en el navegador
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Guarda el tema actual en localStorage
    localStorage.setItem('theme', theme);
    
    // Aplica las clases CSS al elemento HTML
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      
      // Variables CSS para el tema oscuro neón
      root.style.setProperty('--neon-darker', '#0a0b10');
      root.style.setProperty('--neon-dark', '#10121e');
      root.style.setProperty('--neon-medium', '#1a1e35');
      root.style.setProperty('--neon-accent', '#00E1FF');
      root.style.setProperty('--neon-text', '#e1e7f7');
      root.style.setProperty('--neon-purple', '#bb00ff');
      root.style.setProperty('--neon-green', '#00FF9D');
      root.style.setProperty('--neon-yellow', '#FFEA00');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      
      // Variables CSS para el tema claro tradicional
      root.style.setProperty('--neon-darker', '#f5f5f7');
      root.style.setProperty('--neon-dark', '#ffffff');
      root.style.setProperty('--neon-medium', '#eaeaea');
      root.style.setProperty('--neon-accent', '#0080ff');
      root.style.setProperty('--neon-text', '#333333');
      root.style.setProperty('--neon-purple', '#8855d7');
      root.style.setProperty('--neon-green', '#38a169');
      root.style.setProperty('--neon-yellow', '#d69e2e');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}