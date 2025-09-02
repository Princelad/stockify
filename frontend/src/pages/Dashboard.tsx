import { Sidebar } from '@/components/inventory/Sidebar';
import { Topbar } from '@/components/inventory/Topbar';
import { SummaryCards } from '@/components/inventory/SummaryCards';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { Home, TrendingUp, Package, Users } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 flex flex-col gap-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="h-6 w-6 text-blue-600" />
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <SummaryCards />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Sales</p>
                      <p className="text-2xl font-bold text-green-600">₹12,450</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+15% from yesterday</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Products Sold</p>
                      <p className="text-2xl font-bold text-blue-600">47</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">+8% from yesterday</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">New Customers</p>
                      <p className="text-2xl font-bold text-purple-600">5</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">+2 from yesterday</p>
                </div>
              </div>
              
              {/* Business Overview Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6 min-h-[260px]">
                <div className="font-semibold mb-2">Sales Overview</div>
                <div className="flex gap-4 mb-4">
                  <button className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-medium">Last 7 Days</button>
                  <button className="px-3 py-1 rounded hover:bg-gray-100">Last 30 Days</button>
                  <button className="px-3 py-1 rounded hover:bg-gray-100">Last Year</button>
                </div>
                <div className="h-40 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div>Sales Chart Coming Soon</div>
                    <div className="text-xs text-gray-400">Business analytics visualization will be implemented here</div>
                  </div>
                </div>
              </div>
            </div>
            <LowStockAlert />
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">iPhone 13 sold</p>
                    <p className="text-sm text-gray-500">Sold to John Doe</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">₹45,000</p>
                  <p className="text-xs text-gray-500">2 min ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New customer registered</p>
                    <p className="text-sm text-gray-500">Jane Smith</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">5 min ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Low stock alert</p>
                    <p className="text-sm text-gray-500">Samsung Galaxy S21 - Only 3 left</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">10 min ago</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
