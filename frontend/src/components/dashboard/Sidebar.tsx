import { Home, Package, Users, FileText, BarChart3, Settings, Printer, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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

  const handleNavigation = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col py-6 px-4 shadow-sm">
      <div className="text-2xl font-bold mb-8 tracking-tight">StockMaster</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <div key={item.label}>
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition',
                activeSection === item.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => handleNavigation(item.route)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <div 
                    key={child.label} 
                    className="text-gray-500 text-sm px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleNavigation(child.route)}
                  >
                    {child.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
