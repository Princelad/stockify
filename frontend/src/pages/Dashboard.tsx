import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import type { DashboardStats } from "@/types/product";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  ShoppingCart,
  DollarSign,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardStats();
        if (response.success) {
          setStats(response.data!);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Monitor your inventory and business metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Products</p>
                <p className="text-3xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
              <Package className="h-10 w-10 text-blue-200" />
            </div>
            <div className="flex items-center mt-2">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm text-blue-100">View all products</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Value</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.totalValue || 0)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-200" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm text-green-100">Inventory worth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Low Stock</p>
                <p className="text-3xl font-bold">{stats?.lowStockProducts || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-200" />
            </div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm text-yellow-100">Need attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Out of Stock</p>
                <p className="text-3xl font-bold">{stats?.outOfStockProducts || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-200" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span className="text-sm text-red-100">Immediate action</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSuppliers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Recent Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.recentSales?.count || 0}</p>
                <p className="text-sm text-gray-500">{formatCurrency(stats?.recentSales?.value || 0)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {stats?.stockAlerts && stats.stockAlerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.stockAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">{alert.product.name}</p>
                      <p className="text-sm text-gray-600">Current stock: {alert.product.stock}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={alert.alertType === 'out' ? 'destructive' : 'default'}
                    className="capitalize"
                  >
                    {alert.alertType === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-600">
                        {category.count} items • {formatCurrency(category.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min((category.count / (stats?.totalProducts || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
        <Button variant="outline">
          <Package className="h-4 w-4 mr-2" />
          Manage Inventory
        </Button>
      </div>
    </DashboardLayout>
  );
}
