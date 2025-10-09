import { useState } from "react";
import { useTheme, themeColors } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Monitor, Palette, Eye, Settings } from "lucide-react";

interface ThemeSettingsProps {
  className?: string;
}

export function ThemeSettings({ className = "" }: ThemeSettingsProps) {
  const { theme, setTheme, actualTheme, isSystemPreference } = useTheme();
  const [autoSync, setAutoSync] = useState(true);

  const themeOptions = [
    {
      key: "light" as const,
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
      preview: "bg-white border-gray-200",
    },
    {
      key: "dark" as const,
      label: "Dark",
      description: "Easy on the eyes",
      icon: Moon,
      preview: "bg-gray-900 border-gray-700",
    },
    {
      key: "system" as const,
      label: "System",
      description: "Follows your system preference",
      icon: Monitor,
      preview: "bg-gradient-to-r from-white to-gray-900 border-gray-400",
    },
  ];

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
  };

  return (
    <Card
      className={`${themeColors.bg.card} ${themeColors.border.primary} ${className}`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${themeColors.text.primary}`}
        >
          <Palette className="h-5 w-5" />
          Theme Preferences
        </CardTitle>
        <CardDescription className={themeColors.text.secondary}>
          Customize the appearance to match your preference
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div>
          <Label className={`text-sm font-medium ${themeColors.text.primary}`}>
            Appearance
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {themeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleThemeChange(option.key)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${
                    theme === option.key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : `${themeColors.border.primary} ${themeColors.bg.card} ${themeColors.interactive.hover}`
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <option.icon
                    className={`h-4 w-4 ${
                      theme === option.key
                        ? "text-blue-600 dark:text-blue-400"
                        : themeColors.text.secondary
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      theme === option.key
                        ? "text-blue-600 dark:text-blue-400"
                        : themeColors.text.primary
                    }`}
                  >
                    {option.label}
                  </span>
                  {theme === option.key && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className={`text-xs ${themeColors.text.tertiary}`}>
                  {option.description}
                </p>

                {/* Theme Preview */}
                <div className="mt-3 flex gap-1">
                  <div
                    className={`w-3 h-3 rounded-sm border ${option.preview}`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-sm ${themeColors.bg.secondary}`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-sm ${themeColors.bg.tertiary}`}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Status */}
        <div
          className={`p-3 rounded-lg ${themeColors.bg.secondary} ${themeColors.border.primary} border`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className={`text-sm font-medium ${themeColors.text.primary}`}>
              Current Theme
            </span>
          </div>
          <p className={`text-xs ${themeColors.text.secondary}`}>
            {isSystemPreference
              ? `System (Currently ${actualTheme})`
              : `${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          </p>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                className={`text-sm font-medium ${themeColors.text.primary}`}
              >
                Sync with Account
              </Label>
              <p className={`text-xs ${themeColors.text.tertiary} mt-0.5`}>
                Save theme preference to your account
              </p>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={setAutoSync}
              aria-label="Sync theme with account"
            />
          </div>

          {/* Reset to Defaults */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme("system")}
              className={`${themeColors.text.secondary} text-xs`}
            >
              <Settings className="h-3 w-3 mr-1" />
              Reset to System Default
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
