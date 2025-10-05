import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'stockify-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on current theme setting
  const calculateActualTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document
  const applyTheme = (newActualTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newActualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newActualTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }

    const newActualTheme = calculateActualTheme(newTheme);
    setActualTheme(newActualTheme);
    applyTheme(newActualTheme);
  };

  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(newActualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const newActualTheme = calculateActualTheme(theme);
    setActualTheme(newActualTheme);
    applyTheme(newActualTheme);
  }, []);

  // Sync with user preferences from backend
  useEffect(() => {
    const syncWithUserPreferences = async () => {
      try {
        // Check if user is logged in and has preferences
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          // If user has dark mode preference and it differs from current theme
          if (user.preferences && typeof user.preferences.darkMode === 'boolean') {
            const preferredTheme = user.preferences.darkMode ? 'dark' : 'light';
            if (theme !== preferredTheme) {
              setTheme(preferredTheme);
            }
          }
        }
      } catch (error) {
        console.error('Error syncing theme with user preferences:', error);
      }
    };

    syncWithUserPreferences();
  }, []);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    isDarkMode: actualTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for easy dark mode detection
export const useDarkMode = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};

// Utility function to get theme-aware classes
export const getThemeClasses = (lightClasses: string, darkClasses: string) => {
  return `${lightClasses} dark:${darkClasses}`;
};

// Common theme-aware color classes
export const themeColors = {
  // Backgrounds
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    card: 'bg-white dark:bg-gray-800',
    sidebar: 'bg-white dark:bg-gray-900',
    header: 'bg-white dark:bg-gray-800',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  
  // Borders
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    accent: 'border-blue-200 dark:border-blue-700',
  },
  
  // Interactive elements
  interactive: {
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    active: 'active:bg-gray-100 dark:active:bg-gray-600',
    focus: 'focus:ring-blue-500 dark:focus:ring-blue-400',
  },
  
  // Status colors (these work well in both themes)
  status: {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }
};