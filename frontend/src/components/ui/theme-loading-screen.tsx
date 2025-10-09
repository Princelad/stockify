import { useTheme } from "@/contexts/ThemeContext";
import { Package } from "lucide-react";

export function ThemeLoadingScreen() {
  const { isLoading } = useTheme();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 animate-pulse">
          <Package className="size-6 text-white" />
        </div>
        <div className="text-lg font-semibold text-foreground">
          Loading Stockify...
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
