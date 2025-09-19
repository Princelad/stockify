import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { apiService } from '@/lib/api';

interface MiniChartData {
  date: string;
  value: number;
}

interface MiniAnalyticsProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  chartType: 'area' | 'bar';
  color: string;
  className?: string;
}

export function MiniAnalytics({
  title,
  value,
  change,
  changeType,
  chartType,
  color,
  className = ''
}: MiniAnalyticsProps) {
  const [chartData, setChartData] = useState<MiniChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMiniChartData();
  }, []);

  const fetchMiniChartData = async () => {
    try {
      // Generate mock mini chart data for the last 7 days
      const mockData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.getDate().toString(),
          value: Math.floor(Math.random() * 100) + 20
        };
      });
      setChartData(mockData);
    } catch (error) {
      console.error('Failed to fetch mini chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        {getTrendIcon()}
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className={`text-xs font-medium flex items-center gap-1 ${getChangeColor()}`}>
          {change}
        </div>
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`${color}20`}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [value, title]}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [value, title]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Pre-configured mini analytics components
export function RevenueMiniChart({ className }: { className?: string }) {
  const [data, setData] = useState({ value: '₹0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const [currentStats, previousStats] = await Promise.all([
          apiService.getSalesStats(7), // Last 7 days
          apiService.getSalesStats(14) // Previous 14 days for comparison
        ]);

        if (currentStats.success && previousStats.success && 
            'data' in currentStats && currentStats.data &&
            'data' in previousStats && previousStats.data) {
          const currentRevenue = currentStats.data.totalRevenue || 0;
          const previousRevenue = previousStats.data.totalRevenue || 0;
          const weeklyPrevious = previousRevenue - currentRevenue; // Approximate previous week
          
          const changePercent = weeklyPrevious > 0 
            ? ((currentRevenue - weeklyPrevious) / weeklyPrevious * 100)
            : 0;
          
          setData({
            value: `₹${(currentRevenue / 1000).toFixed(1)}K`,
            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
            changeType: changePercent >= 0 ? 'increase' : 'decrease'
          });
        }
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
        // Keep default mock data
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-12 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <MiniAnalytics
      title="Weekly Revenue"
      value={data.value}
      change={data.change}
      changeType={data.changeType}
      chartType="area"
      color="#3B82F6"
      className={className}
    />
  );
}

export function OrdersMiniChart({ className }: { className?: string }) {
  const [data, setData] = useState({ value: '0', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const [currentStats, previousStats] = await Promise.all([
          apiService.getSalesStats(7), // Last 7 days
          apiService.getSalesStats(14) // Previous 14 days for comparison
        ]);

        if (currentStats.success && previousStats.success && 
            'data' in currentStats && currentStats.data &&
            'data' in previousStats && previousStats.data) {
          const currentOrders = currentStats.data.totalSales || 0;
          const previousOrders = previousStats.data.totalSales || 0;
          const weeklyPrevious = previousOrders - currentOrders; // Approximate previous week
          
          const changePercent = weeklyPrevious > 0 
            ? ((currentOrders - weeklyPrevious) / weeklyPrevious * 100)
            : 0;
          
          setData({
            value: currentOrders.toString(),
            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
            changeType: changePercent >= 0 ? 'increase' : 'decrease'
          });
        }
      } catch (error) {
        console.error('Failed to fetch orders data:', error);
        // Keep default mock data
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-8 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <MiniAnalytics
      title="Weekly Orders"
      value={data.value}
      change={data.change}
      changeType={data.changeType}
      chartType="bar"
      color="#10B981"
      className={className}
    />
  );
}

export function ConversionMiniChart({ className }: { className?: string }) {
  const [data, setData] = useState({ value: '0%', change: '+0%', changeType: 'neutral' as 'increase' | 'decrease' | 'neutral' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversionData = async () => {
      try {
        const [salesStats, dashboardStats] = await Promise.all([
          apiService.getSalesStats(7), // Last 7 days
          apiService.getDashboardStats()
        ]);

        if (salesStats.success && dashboardStats.success && 
            'data' in salesStats && salesStats.data && dashboardStats.data) {
          const totalSales = salesStats.data.totalSales || 0;
          const totalProducts = (dashboardStats.data as any).overview?.totalProducts || 1;
          
          // Mock conversion rate calculation (sales/products ratio)
          const conversionRate = totalProducts > 0 ? (totalSales / totalProducts * 100) : 0;
          const mockPreviousRate = conversionRate * 0.9; // Mock previous period
          const changePercent = mockPreviousRate > 0 
            ? ((conversionRate - mockPreviousRate) / mockPreviousRate * 100)
            : 0;
          
          setData({
            value: `${conversionRate.toFixed(1)}%`,
            change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
            changeType: changePercent >= 0 ? 'increase' : 'decrease'
          });
        }
      } catch (error) {
        console.error('Failed to fetch conversion data:', error);
        // Keep default mock data
      } finally {
        setLoading(false);
      }
    };

    fetchConversionData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-12 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <MiniAnalytics
      title="Sales Rate"
      value={data.value}
      change={data.change}
      changeType={data.changeType}
      chartType="area"
      color="#F59E0B"
      className={className}
    />
  );
}