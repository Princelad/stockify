import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { themeColors } from "@/contexts/ThemeContext";

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "ghost"
    | "outline";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  children: React.ReactNode;
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isActive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      const baseClasses =
        "transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

      switch (variant) {
        case "primary":
          return isActive
            ? `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600`
            : `${baseClasses} ${themeColors.bg.card} ${themeColors.text.secondary} ${themeColors.interactive.hover} ${themeColors.border.primary} border`;

        case "secondary":
          return `${baseClasses} ${themeColors.bg.secondary} ${themeColors.text.primary} hover:opacity-80`;

        case "success":
          return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600`;

        case "warning":
          return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600`;

        case "error":
          return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600`;

        case "ghost":
          return `${baseClasses} ${themeColors.interactive.hover} ${themeColors.text.secondary}`;

        case "outline":
          return `${baseClasses} ${themeColors.border.primary} border ${themeColors.bg.card} ${themeColors.text.primary} ${themeColors.interactive.hover}`;

        default:
          return baseClasses;
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "px-3 py-1.5 text-xs rounded-md";
        case "lg":
          return "px-6 py-3 text-base rounded-lg";
        case "md":
        default:
          return "px-4 py-2 text-sm rounded-md";
      }
    };

    return (
      <button
        ref={ref}
        className={cn(getVariantClasses(), getSizeClasses(), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ThemedButton.displayName = "ThemedButton";
