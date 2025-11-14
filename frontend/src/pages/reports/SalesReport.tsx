import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  exportToCSV,
  exportToPDF,
  prepareSalesDataForExport,
} from "@/lib/utils/exportUtils";
import {
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  ArrowUpRight,
  Users,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface SalesData {
  period: string;
  revenue: number;
  transactions: number;
  growth: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
  category: string;
}

export default function SalesReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    totalDiscountGiven: 0,
    growthRate: 0,
  });
  const { toast } = useToast();

  const periods = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 days" },
    { value: "last30days", label: "Last 30 days" },
    { value: "last90days", label: "Last 3 months" },
    { value: "lastyear", label: "Last year" },
    { value: "custom", label: "Custom Range" },
  ];

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getSalesReport({
        period: selectedPeriod,
      });

      if (response.success && response.data) {
        const data = response.data;
        setSalesData(data.salesData);
        setTopProducts(data.topProducts);
        setCategorySales(data.categorySales);
        setSummary(data.summary);
      } else {
        throw new Error(response.message || "Failed to fetch sales data");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch sales data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    toast({
      title: "Export Started",
      description: `Exporting Sales Report as ${format.toUpperCase()}...`,
      type: "info",
    });

    try {
      // Prepare data for export
      const exportData = prepareSalesDataForExport(salesData);
      const headers = [
        "Date",
        "Invoice ID",
        "Customer",
        "Items",
        "Subtotal",
        "Tax",
        "Discount",
        "Total Amount",
        "Payment Method",
        "Status",
      ];

      let result;
      if (format === "excel") {
        // Export as CSV (Excel-compatible)
        result = exportToCSV({
          filename: `sales-report-${selectedPeriod}-${
            new Date().toISOString().split("T")[0]
          }`,
          data: exportData,
          headers,
        });
      } else {
        // Export as PDF
        result = await exportToPDF({
          filename: `Sales Report - ${selectedPeriod}`,
          data: exportData,
          headers,
        });
      }

      if (result.success) {
        toast({
          title: "Export Complete",
          description: result.message,
          type: "success",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export sales report. Please try again.",
        type: "error",
      });
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#F97316",
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <InventoryLayout activeSection="Reports">
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Sales Report
              </h1>
              <p className="text-gray-600 mt-1">
                Track revenue trends and sales performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport("excel")}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={() => handleExport("pdf")}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                disabled={loading}
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">
                Error loading sales report
              </p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button
              onClick={fetchSalesData}
              className="mt-3 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading sales report...</p>
            </div>
          </div>
        )}

        {/* Report Content - Only show when not loading */}
        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />+{summary.growthRate}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +8.4%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold">
                    {summary.totalTransactions}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.1%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.averageOrderValue)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +6.7%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                  <p className="text-2xl font-bold">324</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Label>Period:</Label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPeriod === "custom" && (
                  <div className="flex items-center gap-2">
                    <Input type="date" className="w-auto" />
                    <span className="text-gray-500">to</span>
                    <Input type="date" className="w-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transactions Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Transaction Volume
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sales by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Sales by Category
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySales.map((cat, index) => ({
                          name: cat.category || cat._id,
                          value:
                            Math.round(
                              (cat.revenue / summary.totalRevenue) * 100
                            ) || 0,
                          color: getCategoryColor(index),
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) =>
                          `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categorySales.map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCategoryColor(index)}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Top Selling Products
                </h3>
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.category} • {product.quantity} units
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Sales Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Monthly Sales Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Transactions</th>
                      <th className="text-right py-3 px-4">Avg Order Value</th>
                      <th className="text-right py-3 px-4">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.period}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.transactions}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(item.revenue / item.transactions)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge
                            className={
                              item.growth > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {item.growth > 0 ? "+" : ""}
                            {item.growth}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </InventoryLayout>
  );
}
