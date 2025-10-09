import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

// Simple theme toggle that cycles through light -> dark -> system
export function ThemeToggle({
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, actualTheme, isSystemPreference } = useTheme();

  const cycleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("system");
        break;
      case "system":
        setTheme("light");
        break;
      default:
        setTheme("light");
    }
  };

  const getCurrentIcon = () => {
    if (isSystemPreference) {
      return <Monitor className="h-4 w-4" />;
    }
    return actualTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={cycleTheme}
      className="relative gap-2"
      aria-label={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
      title={`Current: ${getThemeLabel()}`}
    >
      {getCurrentIcon()}
      {showLabel && <span>{getThemeLabel()}</span>}
    </Button>
  );
}

// Simple toggle button for quick light/dark switching (ignores system)
export function SimpleThemeToggle({
  variant = "ghost",
  size = "icon",
}: Pick<ThemeToggleProps, "variant" | "size">) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label="Toggle between light and dark theme"
      className="relative overflow-hidden"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
