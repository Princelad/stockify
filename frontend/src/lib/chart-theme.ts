import { useTheme } from "@/contexts/ThemeContext";

export interface ChartTheme {
  // Colors
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // Chart elements
  grid: string;
  axis: string;
  text: string;

  // Tooltip
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;

  // Background
  background: string;
  cardBackground: string;
}

export function useChartTheme(): ChartTheme {
  const { isDarkMode } = useTheme();

  return {
    // Main colors
    primary: isDarkMode ? "#60A5FA" : "#3B82F6",
    secondary: isDarkMode ? "#34D399" : "#10B981",
    success: isDarkMode ? "#34D399" : "#10B981",
    warning: isDarkMode ? "#FBBF24" : "#F59E0B",
    error: isDarkMode ? "#F87171" : "#EF4444",
    info: isDarkMode ? "#60A5FA" : "#3B82F6",

    // Chart elements
    grid: isDarkMode ? "#374151" : "#E5E7EB",
    axis: isDarkMode ? "#9CA3AF" : "#6B7280",
    text: isDarkMode ? "#F9FAFB" : "#111827",

    // Tooltip
    tooltipBg: isDarkMode ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDarkMode ? "#374151" : "#E5E7EB",
    tooltipText: isDarkMode ? "#F9FAFB" : "#111827",

    // Background
    background: isDarkMode ? "#111827" : "#FFFFFF",
    cardBackground: isDarkMode ? "#1F2937" : "#FFFFFF",
  };
}

export const chartColorPalette = {
  light: [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
  ],
  dark: [
    "#60A5FA", // Blue
    "#34D399", // Green
    "#FBBF24", // Amber
    "#F87171", // Red
    "#A78BFA", // Purple
    "#22D3EE", // Cyan
    "#FB923C", // Orange
    "#A3E635", // Lime
  ],
};

export function getChartColors(isDarkMode: boolean): string[] {
  return isDarkMode ? chartColorPalette.dark : chartColorPalette.light;
}

// Common chart component props for consistent theming
export function getCommonChartProps(isDarkMode: boolean) {
  return {
    grid: {
      strokeDasharray: "3 3",
      stroke: isDarkMode ? "#374151" : "#E5E7EB",
    },
    xAxis: {
      stroke: isDarkMode ? "#9CA3AF" : "#6B7280",
      fontSize: 12,
      tickLine: false,
    },
    yAxis: {
      stroke: isDarkMode ? "#9CA3AF" : "#6B7280",
      fontSize: 12,
      tickLine: false,
    },
    tooltip: {
      contentStyle: {
        backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
        border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        color: isDarkMode ? "#F9FAFB" : "#111827",
      },
    },
    legend: {
      wrapperStyle: {
        color: isDarkMode ? "#F9FAFB" : "#111827",
      },
    },
  };
}
