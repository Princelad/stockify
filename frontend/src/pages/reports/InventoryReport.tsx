import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  exportToCSV,
  exportToPDF,
  prepareInventoryDataForExport,
} from "@/lib/utils/exportUtils";
import {
  Package,
  Download,
  Calendar,
  TrendingDown,
  FileText,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  value: number;
  movement: "high" | "medium" | "low";
  lastUpdated: string;
  supplier: string;
}

interface StockMovement {
  period: string;
  inbound: number;
  outbound: number;
  netMovement: number;
}

interface CategoryStock {
  name: string;
  value: number;
  items: number;
  color: string;
  [key: string]: any;
}

export default function InventoryReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalItems: 0,
    totalRetailValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
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
    fetchInventoryData();
  }, [selectedPeriod]);

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getInventoryReport({
        period: selectedPeriod,
      });

      if (response.success && response.data) {
        const data = response.data;
        setInventoryData(data.inventoryData);
        setSummary(data.summary);

        // Transform category stock data to match component needs
        const transformedCategoryStock = data.categoryStock.map(
          (cat: any, index: number) => ({
            name: cat.category || cat._id,
            value: cat.totalValue,
            items: cat.totalItems,
            color: getCategoryColor(index),
          })
        );
        setCategoryStock(transformedCategoryStock);

        // Transform stock movements data
        const transformedMovements = data.stockMovements.map(
          (movement: any) => ({
            period: movement._id,
            inbound: 0, // This would come from purchase data in a complete system
            outbound: movement.totalOutbound,
            netMovement: -movement.totalOutbound, // Negative because we're only tracking outbound
          })
        );
        setStockMovements(transformedMovements);
      } else {
        throw new Error(response.message || "Failed to fetch inventory data");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch inventory data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
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

  const handleExport = async (format: "pdf" | "excel") => {
    toast({
      title: "Export Started",
      description: `Exporting Inventory Report as ${format.toUpperCase()}...`,
      type: "info",
    });

    try {
      // Prepare data for export
      const exportData = prepareInventoryDataForExport(inventoryData);
      const headers = [
        "SKU",
        "Product Name",
        "Category",
        "Brand",
        "Current Stock",
        "Min Stock Level",
        "Cost Price",
        "Selling Price",
        "Wholesale Price",
        "Total Value",
        "Supplier",
        "Last Updated",
      ];

      let result;
      if (format === "excel") {
        // Export as CSV (Excel-compatible)
        result = exportToCSV({
          filename: `inventory-report-${selectedPeriod}-${
            new Date().toISOString().split("T")[0]
          }`,
          data: exportData,
          headers,
        });
      } else {
        // Export as PDF
        result = await exportToPDF({
          filename: `Inventory Report - ${selectedPeriod}`,
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
        description: "Failed to export inventory report. Please try again.",
        type: "error",
      });
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0)
      return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (item.currentStock <= item.minStock)
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const getMovementBadge = (movement: string) => {
    const badges = {
      high: { label: "High Movement", color: "bg-green-100 text-green-800" },
      medium: {
        label: "Medium Movement",
        color: "bg-yellow-100 text-yellow-800",
      },
      low: { label: "Low Movement", color: "bg-red-100 text-red-800" },
    };
    return badges[movement as keyof typeof badges];
  };

  return (
    <InventoryLayout activeSection="Reports">
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Inventory Report
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor stock levels and inventory movements
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
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
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
                Error loading inventory report
              </p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button
              onClick={fetchInventoryData}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading inventory report...</p>
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
                  <div className="p-3 rounded-lg bg-blue-50">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +5.2%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Inventory Value
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalValue)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold">{summary.totalItems}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Alert
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                  <p className="text-2xl font-bold">{summary.lowStockItems}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-50">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" />
                    Critical
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold">
                    {summary.outOfStockItems}
                  </p>
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
              {/* Stock Movement Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Stock Movement Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stockMovements}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="inbound" fill="#10B981" name="Inbound" />
                      <Bar dataKey="outbound" fill="#EF4444" name="Outbound" />
                      <Line
                        type="monotone"
                        dataKey="netMovement"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="Net Movement"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Inventory by Category
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStock}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) =>
                          `${entry.name}: ₹${entry.value.toLocaleString()}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryStock.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Value",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Inventory Value Trend */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Net Stock Movement</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockMovements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="netMovement"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Stock Alerts
              </h3>
              <div className="space-y-3">
                {inventoryData
                  .filter((item) => item.currentStock <= item.minStock)
                  .map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              SKU: {item.sku} • {item.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={status.color}>
                            {status.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Current: {item.currentStock} / Min: {item.minStock}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Detailed Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-right py-3 px-4">Current Stock</th>
                      <th className="text-right py-3 px-4">Min/Max</th>
                      <th className="text-right py-3 px-4">Value</th>
                      <th className="text-center py-3 px-4">Movement</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => {
                      const status = getStockStatus(item);
                      const movement = getMovementBadge(item.movement);

                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.category}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {item.sku}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {item.currentStock}
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-600">
                            {item.minStock} / {item.maxStock}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(item.value)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={movement.color}>
                              {movement.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={status.color}>
                              {status.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
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
