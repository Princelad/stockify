import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Printer, 
  Tag, 
  User, 
  ChevronDown, 
  ChevronRight,
  Bell,
  Search,
  Store,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentUser, clearAuthData } from '@/lib/api';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  children?: Array<{
    label: string;
    route: string;
  }>;
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
  { label: 'Dashboard', icon: Home, route: '/dashboard' },
  { 
    label: 'Inventory', 
    icon: Package, 
    route: '/products', 
    children: [
      { label: 'Stock Management', route: '/products' },
      { label: 'Categories', route: '/categories' },
    ]
  },
  { label: 'Billing', icon: FileText, route: '/billing' },
  { label: 'Customers', icon: Users, route: '/customers' },
  { label: 'Suppliers', icon: Users, route: '/suppliers' },
  { 
    label: 'Reports', 
    icon: BarChart3, 
    route: '/reports', 
    children: [
      { label: 'Sales Report', route: '/reports/sales' },
      { label: 'Inventory Report', route: '/reports/inventory' },
      { label: 'Tax Report', route: '/reports/tax' },
    ]
  },
  { label: 'Barcode Generator', icon: Tag, route: '/barcode' },
  { label: 'Label Printing', icon: Printer, route: '/labels' },
  { label: 'Profile', icon: User, route: '/profile' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

// Internal Sidebar Component
const Sidebar: React.FC<{ activeSection: string }> = ({ activeSection }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Auto-expand section if user is on a child page
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children && item.children.some(child => 
        window.location.pathname === child.route
      )) {
        setExpandedItems(prev => 
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, []);

  const handleNavigation = useCallback((route?: string) => {
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  const toggleExpanded = useCallback((itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(item => item !== itemLabel)
        : [...prev, itemLabel]
    );
  }, []);

  const isExpanded = (itemLabel: string) => expandedItems.includes(itemLabel);

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col py-6 px-4 shadow-sm">
      <div className="text-2xl font-bold mb-8 tracking-tight text-gray-800 hover:text-blue-600 transition-colors duration-200">
        Stockify
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <div key={item.label}>
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
                activeSection === item.label 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              )}
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.label);
                } else {
                  handleNavigation(item.route);
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.children && (
                <div className="transition-transform duration-200">
                  {isExpanded(item.label) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              )}
            </div>
            {item.children && (
              <div className={cn(
                "ml-8 overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded(item.label) 
                  ? "max-h-96 opacity-100 mt-1" 
                  : "max-h-0 opacity-0"
              )}>
                <div className="space-y-1">
                  {item.children.map((child) => (
                    <div 
                      key={child.label} 
                      className="text-gray-500 text-sm px-2 py-1 rounded hover:bg-blue-50 cursor-pointer transition-all duration-150 hover:text-blue-600 hover:translate-x-1"
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
    </aside>
  );
};

// Internal Topbar Component
const Topbar: React.FC = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const user = getCurrentUser() as User | null;

  const handleLogout = useCallback(() => {
    clearAuthData();
    window.location.href = '/login';
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const closeProfileDropdown = useCallback(() => {
    setShowProfileDropdown(false);
  }, []);

  const getUserInitial = (name?: string): string => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4 w-1/2">
        <Store className="h-6 w-6 text-blue-600" />
        <span className="font-semibold text-lg">Stockify Store</span>
        <div className="flex-1 relative">
          <input
            type="search"
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Search products, invoices..."
            aria-label="Search products and invoices"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleProfileDropdown}
            aria-expanded={showProfileDropdown}
            aria-haspopup="menu"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
              {getUserInitial(user?.name)}
            </div>
            <span className="hidden md:block font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b">
                <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
              </div>
              <div className="py-1" role="menu">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150" 
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150" 
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <hr className="my-1" />
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
  activeSection = 'Dashboard',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Topbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};