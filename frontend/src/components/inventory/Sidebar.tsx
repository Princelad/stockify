import { Home, Package, Users, FileText, BarChart3, Settings, Printer, Tag, User, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard', icon: Home, route: '/dashboard' },
  { label: 'Inventory', icon: Package, route: '/products', children: [
    { label: 'Stock Management', route: '/products' },
    { label: 'Categories', route: '/categories' },
  ]},
  { label: 'Billing', icon: FileText, route: '/billing' },
  { label: 'Customers', icon: Users, route: '/customers' },
  { label: 'Suppliers', icon: Users, route: '/suppliers' },
  { label: 'Reports', icon: BarChart3, route: '/reports', children: [
    { label: 'Sales Report', route: '/reports/sales' },
    { label: 'Inventory Report', route: '/reports/inventory' },
    { label: 'Tax Report', route: '/reports/tax' },
  ]},
  { label: 'Barcode Generator', icon: Tag, route: '/barcode' },
  { label: 'Label Printing', icon: Printer, route: '/labels' },
  { label: 'Profile', icon: User, route: '/profile' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

export function Sidebar({ activeSection = 'Inventory' }: { activeSection?: string }) {
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

  const handleNavigation = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(item => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

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
                activeSection === item.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
}
