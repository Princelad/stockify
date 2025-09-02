import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { apiService } from '@/lib/api';

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response.success && response.data) {
          // Extract critical alerts from dashboard stats
          const data = response.data as any;
          const alerts = data.criticalAlerts || [];
          setLowStockItems(alerts.slice(0, 4)); // Show only first 4 items
        }
      } catch (error) {
        console.error('Failed to fetch low stock items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl p-5 shadow-sm bg-white w-80 min-w-[320px]">
        <div className="font-semibold text-lg mb-4 flex justify-between items-center">
          Low Stock Alert
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg p-3 bg-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-2 bg-gray-300 rounded"></div>
                </div>
                <div className="h-4 w-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 shadow-sm bg-white w-80 min-w-[320px]">
      <div className="font-semibold text-lg mb-4 flex justify-between items-center">
        Low Stock Alert
        <a href="#" className="text-blue-600 text-sm font-medium">View All</a>
      </div>
      <div className="space-y-4">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item, index) => {
            const stockLevel = Math.min(item.currentStock || 0, 10);
            const isVeryLow = stockLevel <= 1;
            const isLow = stockLevel <= 3;
            
            return (
              <div 
                key={index} 
                className={`rounded-lg p-3 flex items-center gap-3 ${
                  isVeryLow ? 'bg-red-100' : isLow ? 'bg-orange-100' : 'bg-yellow-100'
                }`}
              >
                <Package className={`h-5 w-5 ${
                  isVeryLow ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="w-full h-2 rounded bg-gray-200 mt-1">
                    <div 
                      className={`h-2 rounded ${
                        isVeryLow ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-yellow-400'
                      }`} 
                      style={{ width: `${Math.max(10, stockLevel * 10)}%` }} 
                    />
                  </div>
                </div>
                <div className={`text-xs font-semibold ${
                  isVeryLow ? 'text-red-700' : isLow ? 'text-orange-700' : 'text-yellow-700'
                }`}>
                  {stockLevel} left
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No low stock items</p>
          </div>
        )}
      </div>
    </div>
  );
}
