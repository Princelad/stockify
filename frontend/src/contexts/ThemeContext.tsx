import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light" | "dark";
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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "stockify-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Calculate actual theme based on current theme setting
  const calculateActualTheme = (currentTheme: Theme): "light" | "dark" => {
    if (currentTheme === "system") {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document with smooth transition
  const applyTheme = useCallback(
    (newActualTheme: "light" | "dark", skipTransition = false) => {
      const root = window.document.documentElement;

      // Add transition class for smooth theme switching
      if (!skipTransition) {
        root.style.transition =
          "color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease";
      }

      // Remove existing theme classes
      root.classList.remove("light", "dark");

      // Add new theme class
      root.classList.add(newActualTheme);

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          newActualTheme === "dark" ? "#1f2937" : "#ffffff"
        );
      }

      // Update theme-color for mobile Safari
      const metaThemeColorSafari = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]'
      );
      if (metaThemeColorSafari) {
        metaThemeColorSafari.setAttribute(
          "content",
          newActualTheme === "dark" ? "black-translucent" : "default"
        );
      }

      // Remove transition after animation completes
      if (!skipTransition) {
        setTimeout(() => {
          root.style.transition = "";
        }, 300);
      }
    },
    []
  );

  // Set theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme);
      }

      const newActualTheme = calculateActualTheme(newTheme);
      setActualTheme(newActualTheme);
      applyTheme(newActualTheme);

      // Sync with backend if user is logged in
      syncThemeWithBackend(newTheme);
    },
    [applyTheme, storageKey]
  );

  // Toggle between light and dark (respects system if currently system)
  const toggleTheme = useCallback(() => {
    if (theme === "system") {
      // If currently system, toggle to opposite of current actual theme
      const newTheme = actualTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    } else {
      // If explicitly set, toggle between light and dark
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    }
  }, [theme, actualTheme, setTheme]);

  // Sync theme preference with backend
  const syncThemeWithBackend = useCallback(async (newTheme: Theme) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/users/preferences", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            theme: newTheme,
            darkMode:
              newTheme === "dark" ||
              (newTheme === "system" && getSystemTheme() === "dark"),
          }),
        });
      }
    } catch (error) {
      console.warn("Failed to sync theme with backend:", error);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(newActualTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  // Initialize theme on mount with loading state
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Load user preferences first if available
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await fetch("/api/users/profile", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const userData = await response.json();
              if (userData.data?.preferences?.theme) {
                const userTheme = userData.data.preferences.theme as Theme;
                setThemeState(userTheme);
                localStorage.setItem(storageKey, userTheme);
                const newActualTheme = calculateActualTheme(userTheme);
                setActualTheme(newActualTheme);
                applyTheme(newActualTheme, true); // Skip transition on initial load
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.warn("Failed to load user theme preferences:", error);
          }
        }

        // Fallback to stored theme or default
        const newActualTheme = calculateActualTheme(theme);
        setActualTheme(newActualTheme);
        applyTheme(newActualTheme, true); // Skip transition on initial load
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [theme, storageKey, applyTheme]);

  // Prevent flash of wrong theme
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      const root = window.document.documentElement;
      root.style.colorScheme = actualTheme;
    }
  }, [actualTheme, isLoading]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    isDarkMode: actualTheme === "dark",
    isSystemPreference: theme === "system",
    isLoading,
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
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800",
    tertiary: "bg-gray-100 dark:bg-gray-700",
    card: "bg-white dark:bg-gray-800",
    sidebar: "bg-white dark:bg-gray-900",
    header: "bg-white dark:bg-gray-800",
  },

  // Text colors
  text: {
    primary: "text-gray-900 dark:text-white",
    secondary: "text-gray-600 dark:text-gray-300",
    tertiary: "text-gray-500 dark:text-gray-400",
    muted: "text-gray-400 dark:text-gray-500",
    accent: "text-blue-600 dark:text-blue-400",
  },

  // Borders
  border: {
    primary: "border-gray-200 dark:border-gray-700",
    secondary: "border-gray-300 dark:border-gray-600",
    accent: "border-blue-200 dark:border-blue-700",
  },

  // Interactive elements
  interactive: {
    hover: "hover:bg-gray-50 dark:hover:bg-gray-700",
    active: "active:bg-gray-100 dark:active:bg-gray-600",
    focus: "focus:ring-blue-500 dark:focus:ring-blue-400",
  },

  // Status colors (these work well in both themes)
  status: {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  },
};
