import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  Tag,
  User,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Store,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Receipt,
  Zap,
  Truck,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, clearAuthData } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  children?: Array<{
    label: string;
    route: string;
  }>;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  color: string;
  description: string;
}

interface InventoryLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

interface User {
  name?: string;
  email?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: Home, route: "/dashboard" },
  {
    label: "Inventory",
    icon: Package,
    route: "/products",
    children: [
      { label: "Stock Management", route: "/products" },
      { label: "Categories", route: "/categories" },
    ],
  },
  { label: "Billing", icon: FileText, route: "/billing" },
  { label: "Customers", icon: Users, route: "/customers" },
  { label: "Suppliers", icon: Truck, route: "/suppliers" },
  { label: "Returns & Refunds", icon: Receipt, route: "/returns" },
  {
    label: "Reports",
    icon: BarChart3,
    route: "/reports",
    children: [
      { label: "Sales Report", route: "/reports/sales" },
      { label: "Inventory Report", route: "/reports/inventory" },
      { label: "Tax Report", route: "/reports/tax" },
    ],
  },
  { label: "Labels & Barcodes", icon: Tag, route: "/labels-barcodes" },
  { label: "Profile", icon: User, route: "/profile" },
  { label: "Settings", icon: Settings, route: "/settings" },
];

const quickActions: QuickAction[] = [
  {
    label: "Add Product",
    icon: PackagePlus,
    route: "/products?action=add",
    color: "bg-green-500 hover:bg-green-600",
    description: "Quickly add new product to inventory",
  },
  {
    label: "New Sale",
    icon: ShoppingCart,
    route: "/billing",
    color: "bg-blue-500 hover:bg-blue-600",
    description: "Create new invoice or sale",
  },
  {
    label: "Add Customer",
    icon: UserPlus,
    route: "/customers?action=add",
    color: "bg-purple-500 hover:bg-purple-600",
    description: "Add new customer to database",
  },
  {
    label: "Quick Report",
    icon: Receipt,
    route: "/reports",
    color: "bg-orange-500 hover:bg-orange-600",
    description: "Generate sales or inventory report",
  },
];

// Internal Sidebar Component
const Sidebar: React.FC<{
  activeSection: string;
  isCollapsed: boolean;
  isHoverExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({
  activeSection,
  isCollapsed,
  isHoverExpanded,
  onMouseEnter,
  onMouseLeave,
}) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand section if user is on a child page
  useEffect(() => {
    navItems.forEach((item) => {
      if (
        item.children &&
        item.children.some((child) => window.location.pathname === child.route)
      ) {
        setExpandedItems((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, []);

  const handleNavigation = useCallback(
    (route?: string) => {
      if (route) {
        navigate(route);
      }
    },
    [navigate]
  );

  const toggleExpanded = useCallback((itemLabel: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemLabel)
        ? prev.filter((item) => item !== itemLabel)
        : [...prev, itemLabel]
    );
  }, []);

  const isExpanded = (itemLabel: string) => expandedItems.includes(itemLabel);

  // Determine if sidebar should show expanded content (either manually expanded or hover expanded)
  const shouldShowExpandedContent = !isCollapsed || isHoverExpanded;
  const shouldShowText = shouldShowExpandedContent; // Show text immediately when expanding
  const sidebarWidth = shouldShowExpandedContent ? "w-64" : "w-16";
  const sidebarPadding = shouldShowExpandedContent ? "px-4" : "px-2";

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col py-6 shadow-sm transition-all duration-300 ease-in-out overflow-hidden",
        "fixed lg:relative z-50 lg:z-auto",
        isCollapsed
          ? `${sidebarWidth} ${sidebarPadding} -translate-x-full lg:translate-x-0`
          : `${sidebarWidth} ${sidebarPadding} translate-x-0`
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "font-bold mb-8 tracking-tight text-sidebar-foreground hover:text-sidebar-primary transition-colors duration-200 flex items-center justify-center min-h-[32px]",
          shouldShowExpandedContent ? "text-2xl" : "text-lg text-center"
        )}
      >
        {shouldShowText ? (
          "Stockify"
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white drop-shadow-sm"
            >
              {/* 3D Cube with isometric perspective */}
              {/* Top face */}
              <path
                d="M12 2L20 6L12 10L4 6L12 2Z"
                fill="currentColor"
                fillOpacity="1"
              />
              {/* Left face */}
              <path
                d="M4 6V18L12 22V10L4 6Z"
                fill="currentColor"
                fillOpacity="0.7"
              />
              {/* Right face */}
              <path
                d="M12 10V22L20 18V6L12 10Z"
                fill="currentColor"
                fillOpacity="0.8"
              />
              {/* Edge highlights for 3D effect */}
              <path
                d="M12 2L20 6L12 10L4 6L12 2Z"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                fill="none"
              />
              <path
                d="M4 6L12 10V22"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              <path
                d="M20 6L12 10V22"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            </svg>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <div key={item.label}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 min-h-[40px]",
                activeSection === item.label
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !shouldShowText ? "justify-center" : undefined
              )}
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.label);
                } else {
                  handleNavigation(item.route);
                }
              }}
              title={!shouldShowText ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {shouldShowText && (
                <>
                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200">
                    {item.label}
                  </span>
                  {item.children && (
                    <div className="transition-transform duration-200 flex-shrink-0">
                      {isExpanded(item.label) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {shouldShowText && item.children && (
              <div
                className={cn(
                  "ml-8 overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded(item.label)
                    ? "max-h-96 opacity-100 mt-1"
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-1">
                  {item.children.map((child) => (
                    <div
                      key={child.label}
                      className="text-sidebar-foreground/70 text-sm px-2 py-1 rounded hover:bg-sidebar-accent cursor-pointer transition-all duration-150 hover:text-sidebar-accent-foreground hover:translate-x-1 whitespace-nowrap overflow-hidden text-ellipsis"
                      onClick={() => handleNavigation(child.route)}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Quick Actions Section */}
      {shouldShowExpandedContent && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {shouldShowText && (
            <div className="flex items-center gap-2 px-3 mb-4">
              <Zap className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                Quick Actions
              </span>
            </div>
          )}
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleNavigation(action.route)}
                className={cn(
                  "w-full flex items-center rounded-lg text-white text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-sm min-h-[40px]",
                  shouldShowText ? "gap-3 px-3 py-2" : "justify-center p-2",
                  action.color
                )}
                title={
                  shouldShowText
                    ? action.description
                    : `${action.label} - ${action.description}`
                }
              >
                <action.icon className="h-4 w-4 flex-shrink-0" />
                {shouldShowText && (
                  <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200">
                    {action.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - Fully Collapsed State */}
      {!shouldShowExpandedContent && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleNavigation(action.route)}
                className={cn(
                  "w-full flex items-center justify-center p-2 rounded-lg text-white transition-all duration-200 transform hover:scale-105 hover:shadow-sm min-h-[40px]",
                  action.color
                )}
                title={`${action.label} - ${action.description}`}
              >
                <action.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

// Internal Topbar Component
const Topbar: React.FC<{
  onSidebarToggle: () => void;
  isCollapsed: boolean;
  toggleTheme: () => void;
  isDarkMode: boolean;
}> = ({ onSidebarToggle, isCollapsed, toggleTheme, isDarkMode }) => {
  const [showProfileDropdown, setShowProfileDropdown] =
    useState<boolean>(false);
  const user = getCurrentUser() as User | null;

  const handleLogout = useCallback(() => {
    clearAuthData();
    window.location.href = "/login";
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown((prev) => !prev);
  }, []);

  const closeProfileDropdown = useCallback(() => {
    setShowProfileDropdown(false);
  }, []);

  const getUserInitial = (name?: string): string => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shadow-sm">
      <div className="flex items-center gap-4 w-1/2">
        {/* Hamburger Menu Button */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 lg:hidden"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-foreground" />
          ) : (
            <X className="h-5 w-5 text-foreground" />
          )}
        </button>

        {/* Desktop hamburger (always visible) */}
        <button
          onClick={onSidebarToggle}
          className="hidden lg:block p-2 rounded-lg hover:bg-accent transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        <Store className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg text-foreground">
          Stockify Store
        </span>
        <div className="flex-1 relative">
          <input
            type="search"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="Search products, invoices..."
            aria-label="Search products and invoices"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
          title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-accent transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200"
            onClick={toggleProfileDropdown}
            aria-expanded={showProfileDropdown}
            aria-haspopup="menu"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {getUserInitial(user?.name)}
            </div>
            <span className="hidden md:block font-medium text-foreground">
              {user?.name || "User"}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <div className="font-medium text-foreground">
                  {user?.name || "User"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email || "user@example.com"}
                </div>
              </div>
              <div className="py-1" role="menu">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2 transition-colors duration-150 text-foreground"
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2 transition-colors duration-150 text-foreground"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors duration-150"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside overlay to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeProfileDropdown}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

// Main Layout Component
export const InventoryLayout: React.FC<InventoryLayoutProps> = ({
  children,
  activeSection = "Dashboard",
}) => {
  const navigate = useNavigate();
  const { toggleTheme, isDarkMode } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Check localStorage for saved preference, fallback to mobile detection
    const savedPreference = localStorage.getItem("sidebar-collapsed");
    if (savedPreference !== null) {
      return JSON.parse(savedPreference);
    }
    // Check if screen is mobile on initial load
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    return isMobile;
  });

  const [isHoverExpanded, setIsHoverExpanded] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileRef = useRef<boolean>(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 1024;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar collapse state
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      // Save preference to localStorage
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
      // Clear hover state when manually toggling
      setIsHoverExpanded(false);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      return newState;
    });
  }, []);

  // Handle sidebar hover to expand
  const handleSidebarMouseEnter = useCallback(() => {
    // Only enable hover expansion on desktop and when sidebar is collapsed
    if (isMobileRef.current || !isCollapsed) return;

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set timeout to expand after delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoverExpanded(true);
    }, 300); // 300ms delay
  }, [isCollapsed]);

  // Handle sidebar hover leave
  const handleSidebarMouseLeave = useCallback(() => {
    // Only on desktop
    if (isMobileRef.current) return;

    // Clear expand timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set timeout to collapse after delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoverExpanded(false);
    }, 200); // Shorter delay for collapse
  }, []);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle navigation for quick actions
  const handleNavigation = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate]
  );

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        isCollapsed={isCollapsed}
        isHoverExpanded={isHoverExpanded}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out h-screen",
          // Adjust margin for desktop collapsed sidebar
          "lg:ml-0",
          !isCollapsed ? "lg:ml-0" : undefined // Sidebar is already in flow on desktop
        )}
      >
        {/* Top Navigation */}
        <Topbar
          onSidebarToggle={toggleSidebar}
          isCollapsed={isCollapsed}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>

      {/* Mobile overlay when sidebar is expanded */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Quick Action FAB */}
      {isCollapsed && (
        <div className="fixed bottom-6 right-6 lg:hidden z-30">
          <div className="relative">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              aria-label="Quick Actions"
            >
              <Zap className="h-6 w-6" />
            </button>
            {/* Quick access to most important action */}
            <button
              onClick={() => handleNavigation("/billing")}
              className="absolute -top-16 right-0 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="New Sale"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
