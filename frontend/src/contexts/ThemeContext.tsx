import { createContext, useContext, useCallback, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  // Keep API shape for compatibility, but dark/system are no-ops.
  theme: Theme;
  actualTheme: "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  isSystemPreference: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Simplified ThemeProvider: strips dark-mode behavior and always uses light theme.
 * This preserves the public API to avoid touching many components.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "stockify-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch {}
      }
      // intentionally do not modify documentElement or color-scheme
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    // no-op: dark mode removed; keep API surface
    return;
  }, []);

  const value: ThemeContextType = {
    theme,
    actualTheme: "light",
    setTheme,
    toggleTheme,
    isDarkMode: false,
    isSystemPreference: false,
    isLoading: false,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook for easy dark mode detection (keeps compatibility)
export const useDarkMode = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};

// Utility function to get theme-aware classes (dark removed)
export const getThemeClasses = (
  lightClasses: string,
  _darkClasses?: string
) => {
  return `${lightClasses}`;
};

// Theme color tokens reduced to light-only classes
export const themeColors = {
  // Backgrounds
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    tertiary: "bg-gray-100",
    card: "bg-white",
    sidebar: "bg-white",
    header: "bg-white",
  },

  // Text colors
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    tertiary: "text-gray-500",
    muted: "text-gray-400",
    accent: "text-blue-600",
  },

  // Borders
  border: {
    primary: "border-gray-200",
    secondary: "border-gray-300",
    accent: "border-blue-200",
  },

  // Interactive elements
  interactive: {
    hover: "hover:bg-gray-50",
    active: "active:bg-gray-100",
    focus: "focus:ring-blue-500",
  },

  // Status colors
  status: {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  },
};
