import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

interface AppNavbarProps {
  currentPage?: 'dashboard' | 'products' | 'sales';
  onAddProduct?: () => void;
}

export function AppNavbar({ currentPage, onAddProduct }: AppNavbarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'products', label: 'Products', href: '/products' },
    { key: 'sales', label: 'Sales', href: '#' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <Package className="size-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">Stockify</h1>
            <nav className="hidden md:flex ml-8 space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === item.key
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {onAddProduct && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
