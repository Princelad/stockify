import { useState, useEffect } from 'react';
import { InventoryLayout } from '@/layouts';
import { SummaryCards } from '@/components/inventory/SummaryCards';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { SalesChart } from '@/components/charts/SalesChart';
import { RevenueMiniChart, OrdersMiniChart, ConversionMiniChart } from '@/components/charts/MiniAnalytics';
import { Home, TrendingUp, Package, Users, Clock } from 'lucide-react';
import { apiService } from '@/lib/api';

interface DashboardStats {
  todaySales?: number;
  todayRevenue?: number;
  todayProductsSold?: number;
  newCustomersToday?: number;
}

interface RecentActivity {
  id: string;
  type: 'sale' | 'customer' | 'stock_alert';
  title: string;
  subtitle: string;
  amount?: string;
  time: string;
  icon: 'package' | 'users' | 'alert';
  bgColor: string;
  iconColor: string;
  amountColor?: string;
}

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesStats, recentSales, recentCustomers, dashboardData] = await Promise.all([
          apiService.getSalesStats(1).catch(() => ({ success: false })), // Get last 1 day stats
          apiService.getSales({ page: 1, limit: 5 }).catch(() => ({ success: false })), // Get recent sales
          apiService.getCustomers({ page: 1, limit: 5 }).catch(() => ({ success: false })), // Get recent customers
          apiService.getDashboardStats() // Get general dashboard stats
        ]);

        // Process sales stats for today's data
        if (salesStats.success && 'data' in salesStats && salesStats.data) {
          const today = new Date().toDateString();
          const todaysSales = salesStats.data.recentSales?.filter((sale: any) => 
            new Date(sale.createdAt).toDateString() === today
          ) || [];
          
          const todayRevenue = todaysSales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);
          const todayProductsSold = todaysSales.reduce((sum: number, sale: any) => 
            sum + sale.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
          );

          setDashboardStats({
            todayRevenue,
            todayProductsSold,
            todaySales: todaysSales.length
          });
        }

        // Build recent activity from various sources
        const activities: RecentActivity[] = [];

        // Add recent sales
        if (recentSales.success && 'data' in recentSales && recentSales.data?.sales) {
          recentSales.data.sales.slice(0, 3).forEach((sale: any) => {
            activities.push({
              id: `sale-${sale._id}`,
              type: 'sale',
              title: `Sale completed`,
              subtitle: `${sale.items.length} items sold${sale.customer ? ` to ${sale.customer.name}` : ''}`,
              amount: `₹${sale.totalAmount.toLocaleString()}`,
              time: formatTimeAgo(sale.createdAt),
              icon: 'package',
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600',
              amountColor: 'text-green-600'
            });
          });
        }

        // Add recent customers
        if (recentCustomers.success && 'data' in recentCustomers && recentCustomers.data?.customers) {
          recentCustomers.data.customers.slice(0, 2).forEach((customer: any) => {
            activities.push({
              id: `customer-${customer._id}`,
              type: 'customer',
              title: 'New customer registered',
              subtitle: customer.name,
              time: formatTimeAgo(customer.createdAt),
              icon: 'users',
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600'
            });
          });
        }

        // Add low stock alerts from dashboard data
        if (dashboardData.success && dashboardData.data) {
          const criticalAlerts = (dashboardData.data as any).criticalAlerts || [];
          criticalAlerts.slice(0, 2).forEach((product: any) => {
            activities.push({
              id: `alert-${product._id}`,
              type: 'stock_alert',
              title: 'Low stock alert',
              subtitle: `${product.name} - Only ${product.currentStock || 0} left`,
              time: 'Just now',
              icon: 'alert',
              bgColor: 'bg-orange-100',
              iconColor: 'text-orange-600'
            });
          });
        }

        // Sort activities by time and take first 5
        activities.sort((a, b) => {
          if (a.time === 'Just now') return -1;
          if (b.time === 'Just now') return 1;
          return 0; // Keep existing order for timestamped items
        });
        
        setRecentActivity(activities.slice(0, 5));
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'package': return Package;
      case 'users': return Users;
      case 'alert': return Package;
      default: return Clock;
    }
  };

  return (
    <InventoryLayout activeSection="Dashboard">
      <div className="p-8 flex flex-col gap-6">
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
                    <p className="text-2xl font-bold text-green-600">
                      {loading ? '...' : `₹${(dashboardStats.todayRevenue || 0).toLocaleString()}`}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {loading ? 'Loading...' : `${dashboardStats.todaySales || 0} transactions`}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Products Sold</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {loading ? '...' : (dashboardStats.todayProductsSold || 0)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-2">Items sold today</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Customers</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {loading ? '...' : (dashboardStats.newCustomersToday || 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600 mt-2">Registered today</p>
              </div>
            </div>

            {/* Mini Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <RevenueMiniChart />
              <OrdersMiniChart />
              <ConversionMiniChart />
            </div>
            
            {/* Business Overview Chart */}
            <SalesChart className="mt-6" />
          </div>
          <LowStockAlert />
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.icon);
                return (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className={`font-medium ${activity.amountColor}`}>{activity.amount}</p>
                      )}
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}