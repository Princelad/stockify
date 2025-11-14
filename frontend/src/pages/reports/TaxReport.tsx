import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  exportToCSV,
  exportToPDF,
  prepareTaxDataForExport,
} from "@/lib/utils/exportUtils";
import {
  Receipt,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  DollarSign,
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
} from "recharts";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface TaxSummary {
  period: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  taxableAmount: number;
  totalAmount: number;
}

interface GstRate {
  rate: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  transactions: number;
  color: string;
  [key: string]: any;
}

interface TaxReturn {
  month: string;
  gstr1Filed: boolean;
  gstr3bFiled: boolean;
  dueDate: string;
  status: "filed" | "pending" | "overdue";
}

export default function TaxReport() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [taxData, setTaxData] = useState<TaxSummary[]>([]);
  const [gstRates, setGstRates] = useState<GstRate[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalTaxCollected: 0,
    totalTaxableAmount: 0,
    totalTransactions: 0,
    pendingReturns: 0,
    complianceScore: 0,
  });

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
    fetchTaxData();
  }, [selectedPeriod]);

  const fetchTaxData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTaxReport({
        period: selectedPeriod,
      });

      if (response.success && response.data) {
        const data = response.data;
        setTaxData(data.taxData);

        // Transform GST rates data
        const transformedGstRates = data.gstRates.map(
          (rate: any, index: number) => ({
            ...rate,
            color: getGstRateColor(index),
          })
        );
        setGstRates(transformedGstRates);

        setTaxReturns(data.taxReturns);
        setSummary(data.summary);
      } else {
        throw new Error(response.message || "Failed to fetch tax data");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch tax data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
      console.error("Error fetching tax data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGstRateColor = (index: number) => {
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
      description: `Exporting Tax Report as ${format.toUpperCase()}...`,
      type: "info",
    });

    try {
      // Prepare data for export
      const exportData = prepareTaxDataForExport(gstRates);
      const headers = [
        "Period",
        "GST Rate",
        "Taxable Amount",
        "CGST",
        "SGST",
        "IGST",
        "Total Tax",
        "Transactions",
      ];

      let result;
      if (format === "excel") {
        // Export as CSV (Excel-compatible)
        result = exportToCSV({
          filename: `tax-report-${selectedPeriod}-${
            new Date().toISOString().split("T")[0]
          }`,
          data: exportData,
          headers,
        });
      } else {
        // Export as PDF
        result = await exportToPDF({
          filename: `Tax Report - ${selectedPeriod}`,
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
        description: "Failed to export tax report. Please try again.",
        type: "error",
      });
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getStatusBadge = (status: string) => {
    const badges = {
      filed: { label: "Filed", color: "bg-green-100 text-green-800" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      overdue: { label: "Overdue", color: "bg-red-100 text-red-800" },
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <InventoryLayout activeSection="Reports">
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-purple-600" />
                Tax Report
              </h1>
              <p className="text-gray-600 mt-1">
                GST analysis and tax compliance tracking
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
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
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
                Error loading tax report
              </p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button
              onClick={fetchTaxData}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Loading tax report...</p>
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
                  <div className="p-3 rounded-lg bg-purple-50">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.3%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Tax Collected
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalTaxCollected)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +8.7%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taxable Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalTaxableAmount)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    {summary.complianceScore}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
                  <p className="text-2xl font-bold">
                    {summary.complianceScore}%
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Returns</p>
                  <p className="text-2xl font-bold">{summary.pendingReturns}</p>
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

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Tax Collection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Monthly Tax Collection
                  </h3>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taxData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Bar
                      dataKey="cgst"
                      stackId="a"
                      fill="#3B82F6"
                      name="CGST"
                    />
                    <Bar
                      dataKey="sgst"
                      stackId="a"
                      fill="#10B981"
                      name="SGST"
                    />
                    <Bar
                      dataKey="igst"
                      stackId="a"
                      fill="#F59E0B"
                      name="IGST"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* GST Rate Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    GST Rate Distribution
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gstRates}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        `${entry.rate}: ${formatCurrency(entry.totalTax)}`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalTax"
                    >
                      {gstRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GST Rates Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">GST Rates Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">GST Rate</th>
                      <th className="text-right py-3 px-4">Taxable Amount</th>
                      <th className="text-right py-3 px-4">CGST</th>
                      <th className="text-right py-3 px-4">SGST</th>
                      <th className="text-right py-3 px-4">IGST</th>
                      <th className="text-right py-3 px-4">Total Tax</th>
                      <th className="text-right py-3 px-4">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstRates.map((rate, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: rate.color }}
                            />
                            <span className="font-medium">{rate.rate}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(rate.taxableAmount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(rate.cgst)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(rate.sgst)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(rate.igst)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(rate.totalTax)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {rate.transactions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Returns Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Tax Returns Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Month</th>
                      <th className="text-center py-3 px-4">GSTR-1</th>
                      <th className="text-center py-3 px-4">GSTR-3B</th>
                      <th className="text-center py-3 px-4">Due Date</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReturns.map((return_, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {return_.month}
                        </td>
                        <td className="text-center py-3 px-4">
                          {return_.gstr1Filed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {return_.gstr3bFiled ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {return_.dueDate}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            className={getStatusBadge(return_.status).color}
                          >
                            {getStatusBadge(return_.status).label}
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
