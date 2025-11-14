/**
 * Theme Utilities for Stockify
 * Centralized theme-aware helper functions and class generators
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Theme-aware status colors
 */
export const statusColors = {
  success: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    icon: "text-success",
    badge: "bg-success/10 text-success border border-success/20",
  },
  error: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: "text-destructive",
    badge: "bg-destructive/10 text-destructive border border-destructive/20",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: "text-warning",
    badge: "bg-warning/10 text-warning-foreground border border-warning/20",
  },
  info: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    icon: "text-primary",
    badge: "bg-primary/10 text-primary border border-primary/20",
  },
  neutral: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border border-border",
  },
} as const;

/**
 * Get status color classes
 */
export function getStatusClasses(
  status: "success" | "error" | "warning" | "info" | "neutral",
  variant: "text" | "bg" | "border" | "icon" | "badge" = "text"
) {
  return statusColors[status][variant];
}

/**
 * Theme-aware button variants
 */
export const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  outline:
    "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

/**
 * Theme-aware card classes
 */
export const cardClasses = {
  base: "bg-card text-card-foreground rounded-lg border border-border shadow-sm",
  hover: "hover:border-primary/50 hover:shadow-md transition-all duration-200",
  interactive: "cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200",
  gradient: "bg-gradient-to-br from-card to-muted",
} as const;

/**
 * Theme-aware text classes
 */
export const textClasses = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  muted: "text-muted-foreground/70",
  accent: "text-primary",
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
} as const;

/**
 * Theme-aware background classes
 */
export const bgClasses = {
  primary: "bg-background",
  secondary: "bg-secondary",
  muted: "bg-muted",
  card: "bg-card",
  accent: "bg-accent",
} as const;

/**
 * Generate skeleton loader classes
 */
export function getSkeletonClasses(className?: string) {
  return cn(
    "animate-pulse bg-muted rounded-md",
    className
  );
}

/**
 * Generate badge classes with theme awareness
 */
export function getBadgeClasses(
  variant: "default" | "success" | "error" | "warning" | "info" = "default"
) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";

  const variantClasses = {
    default: "bg-primary/10 text-primary border border-primary/20",
    success: statusColors.success.badge,
    error: statusColors.error.badge,
    warning: statusColors.warning.badge,
    info: statusColors.info.badge,
  };

  return cn(baseClasses, variantClasses[variant]);
}

/**
 * Generate input classes with theme awareness
 */
export function getInputClasses(error?: boolean, className?: string) {
  return cn(
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error && "border-destructive focus-visible:ring-destructive",
    className
  );
}

/**
 * Generate hover classes
 */
export const hoverClasses = {
  lift: "hover:-translate-y-1 hover:shadow-lg transition-all duration-200",
  scale: "hover:scale-105 transition-transform duration-200",
  glow: "hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-200",
  opacity: "hover:opacity-80 transition-opacity duration-200",
} as const;

/**
 * Generate focus classes
 */
export function getFocusClasses() {
  return "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
}

/**
 * Chart color palette (theme-aware)
 */
export const chartColors = {
  1: "var(--chart-1)",
  2: "var(--chart-2)",
  3: "var(--chart-3)",
  4: "var(--chart-4)",
  5: "var(--chart-5)",
} as const;

/**
 * Get chart color by index
 */
export function getChartColor(index: number): string {
  const colorIndex = ((index % 5) + 1) as keyof typeof chartColors;
  return chartColors[colorIndex];
}

/**
 * Stock status badge helper
 */
export function getStockStatusBadge(
  currentStock: number,
  minStock: number = 10
) {
  if (currentStock === 0) {
    return {
      label: "Out of Stock",
      variant: "error" as const,
    };
  } else if (currentStock <= minStock) {
    return {
      label: "Low Stock",
      variant: "warning" as const,
    };
  } else {
    return {
      label: "In Stock",
      variant: "success" as const,
    };
  }
}

/**
 * Format currency with theme-aware color
 */
export function getCurrencyClasses(amount: number) {
  if (amount > 0) {
    return "text-success font-semibold";
  } else if (amount < 0) {
    return "text-destructive font-semibold";
  }
  return "text-muted-foreground";
}

/**
 * Generate table row hover classes
 */
export function getTableRowClasses(clickable: boolean = false) {
  return cn(
    "border-b border-border transition-colors",
    clickable && "hover:bg-accent/50 cursor-pointer"
  );
}

/**
 * Sidebar item classes
 */
export function getSidebarItemClasses(isActive: boolean, isCollapsed: boolean = false) {
  return cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 min-h-[40px]",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    !isCollapsed ? undefined : "justify-center"
  );
}

/**
 * Get priority badge
 */
export function getPriorityBadge(priority: "low" | "medium" | "high" | "urgent") {
  const badges = {
    low: { label: "Low", variant: "info" as const },
    medium: { label: "Medium", variant: "warning" as const },
    high: { label: "High", variant: "error" as const },
    urgent: { label: "Urgent", variant: "error" as const },
  };
  return badges[priority];
}

/**
 * Responsive container classes
 */
export const containerClasses = {
  page: "p-4 md:p-6 lg:p-8",
  section: "space-y-4 md:space-y-6",
  grid: "grid gap-4 md:gap-6",
} as const;
