import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Simple utility function for combining class names
export function cn(...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(" ");
}
