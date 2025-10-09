import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Package, Plus, User } from "lucide-react";
import { themeColors } from "@/contexts/ThemeContext";

interface AppNavbarProps {
  currentPage?: "dashboard" | "products" | "sales" | "categories";
  onAddProduct?: () => void;
}

export function AppNavbar({ currentPage, onAddProduct }: AppNavbarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "products", label: "Products", href: "/products" },
    { key: "categories", label: "Categories", href: "/categories" },
    { key: "sales", label: "Sales", href: "#" },
  ];

  return (
    <nav
      className={`${themeColors.bg.header} shadow-sm ${themeColors.border.primary} border-b transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600">
              <Package className="size-5 text-white" />
            </div>
            <h1
              className={`ml-3 text-xl font-bold ${themeColors.text.primary}`}
            >
              Stockify
            </h1>
            <nav className="hidden md:flex ml-8 space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.key
                      ? `${themeColors.text.accent} border-b-2 border-blue-500`
                      : `${themeColors.text.secondary} ${themeColors.interactive.hover}`
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            {onAddProduct && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                onClick={onAddProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}

            {/* User info and actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <span
                  className={`text-sm ${themeColors.text.primary} hidden sm:inline`}
                >
                  Welcome, {user?.name}
                </span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle variant="ghost" size="icon" />

              {/* Logout Button */}
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className={`${themeColors.text.secondary} hover:${themeColors.text.primary} transition-colors`}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
