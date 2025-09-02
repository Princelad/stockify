import { Bell, Search, Store, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { getCurrentUser, clearAuthData } from '@/lib/api';

export function Topbar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4 w-1/2">
        <Store className="h-6 w-6 text-blue-600" />
        <span className="font-semibold text-lg">Stockify Store</span>
        <div className="flex-1 relative">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search products, invoices..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <hr className="my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </header>
  );
}
