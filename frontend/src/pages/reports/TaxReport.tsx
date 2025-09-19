import { useState, useEffect } from 'react';
import { InventoryLayout } from '@/layouts';
import { 
  Receipt, 
  Download, 
  Calendar, 
  TrendingUp,
  FileText,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Line,
  ComposedChart
} from 'recharts';

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
  status: 'filed' | 'pending' | 'overdue';
}

export default function TaxReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [taxData, setTaxData] = useState<TaxSummary[]>([]);
  const [gstRates, setGstRates] = useState<GstRate[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [summary, setSummary] = useState({
    totalTaxCollected: 0,
    totalTaxableAmount: 0,
    pendingReturns: 0,
    complianceScore: 0
  });

  // Sample data for demo
  const sampleTaxData: TaxSummary[] = [
    {
      period: 'Jan 2024',
      cgst: 12500,
      sgst: 12500,
      igst: 8000,
      totalTax: 33000,
      taxableAmount: 185000,
      totalAmount: 218000
    },
    {
      period: 'Feb 2024',
      cgst: 13800,
      sgst: 13800,
      igst: 9200,
      totalTax: 36800,
      taxableAmount: 205000,
      totalAmount: 241800
    },
    {
      period: 'Mar 2024',
      cgst: 15200,
      sgst: 15200,
      igst: 10600,
      totalTax: 41000,
      taxableAmount: 228000,
      totalAmount: 269000
    },
    {
      period: 'Apr 2024',
      cgst: 16900,
      sgst: 16900,
      igst: 11800,
      totalTax: 45600,
      taxableAmount: 254000,
      totalAmount: 299600
    }
  ];

  const sampleGstRates: GstRate[] = [
    {
      rate: '18%',
      taxableAmount: 450000,
      cgst: 40500,
      sgst: 40500,
      igst: 0,
      totalTax: 81000,
      transactions: 125,
      color: '#3B82F6'
    },
    {
      rate: '12%',
      taxableAmount: 280000,
      cgst: 16800,
      sgst: 16800,
      igst: 0,
      totalTax: 33600,
      transactions: 78,
      color: '#10B981'
    },
    {
      rate: '5%',
      taxableAmount: 150000,
      cgst: 3750,
      sgst: 3750,
      igst: 0,
      totalTax: 7500,
      transactions: 45,
      color: '#F59E0B'
    },
    {
      rate: '28%',
      taxableAmount: 92000,
      cgst: 12880,
      sgst: 12880,
      igst: 0,
      totalTax: 25760,
      transactions: 15,
      color: '#EF4444'
    }
  ];

  const sampleTaxReturns: TaxReturn[] = [
    {
      month: 'Dec 2023',
      gstr1Filed: true,
      gstr3bFiled: true,
      dueDate: '2024-01-11',
      status: 'filed'
    },
    {
      month: 'Jan 2024',
      gstr1Filed: true,
      gstr3bFiled: true,
      dueDate: '2024-02-11',
      status: 'filed'
    },
    {
      month: 'Feb 2024',
      gstr1Filed: true,
      gstr3bFiled: false,
      dueDate: '2024-03-11',
      status: 'pending'
    },
    {
      month: 'Mar 2024',
      gstr1Filed: false,
      gstr3bFiled: false,
      dueDate: '2024-04-11',
      status: 'overdue'
    }
  ];

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 3 months' },
    { value: 'lastyear', label: 'Last year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    fetchTaxData();
  }, [selectedPeriod]);

  const fetchTaxData = async () => {
    try {
      // TODO: Replace with actual API calls
      setTaxData(sampleTaxData);
      setGstRates(sampleGstRates);
      setTaxReturns(sampleTaxReturns);
      
      const totalTaxCollected = sampleTaxData.reduce((sum, item) => sum + item.totalTax, 0);
      const totalTaxableAmount = sampleTaxData.reduce((sum, item) => sum + item.taxableAmount, 0);
      const pendingReturns = sampleTaxReturns.filter(item => item.status !== 'filed').length;
      
      setSummary({
        totalTaxCollected,
        totalTaxableAmount,
        pendingReturns,
        complianceScore: 85
      });
      
    } catch (error) {
      console.error('Error fetching tax data:', error);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Exporting Tax Report as ${format.toUpperCase()}...`);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getReturnStatus = (status: string) => {
    const statuses = {
      filed: { label: 'Filed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return statuses[status as keyof typeof statuses];
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
              <p className="text-gray-600 mt-1">GST analysis and tax compliance tracking</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button 
                onClick={() => handleExport('pdf')}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12.5%
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tax Collected</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalTaxCollected)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8.2%
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Taxable Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalTaxableAmount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <Badge className={summary.pendingReturns > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                {summary.pendingReturns > 0 ? 'Action Required' : 'Up to Date'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Returns</p>
              <p className="text-2xl font-bold">{summary.pendingReturns}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Good
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
              <p className="text-2xl font-bold">{summary.complianceScore}%</p>
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

            {selectedPeriod === 'custom' && (
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
          {/* Tax Collection Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Tax Collection</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={taxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="cgst" stackId="tax" fill="#3B82F6" name="CGST" />
                  <Bar dataKey="sgst" stackId="tax" fill="#10B981" name="SGST" />
                  <Bar dataKey="igst" stackId="tax" fill="#F59E0B" name="IGST" />
                  <Line 
                    type="monotone" 
                    dataKey="totalTax" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="Total Tax"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GST Rate Wise Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Tax by GST Rate</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gstRates}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.rate}: ${formatCurrency(entry.totalTax)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalTax"
                  >
                    {gstRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Tax Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Taxable vs Total Amount */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Taxable vs Total Amount</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Bar dataKey="taxableAmount" fill="#3B82F6" name="Taxable Amount" />
                <Bar dataKey="totalTax" fill="#8B5CF6" name="Tax Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GST Returns Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            GST Returns Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taxReturns.map((returnItem, index) => {
              const status = getReturnStatus(returnItem.status);
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{returnItem.month}</h4>
                    <Badge className={status.color}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>GSTR-1:</span>
                      <span className={returnItem.gstr1Filed ? 'text-green-600' : 'text-red-600'}>
                        {returnItem.gstr1Filed ? 'Filed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>GSTR-3B:</span>
                      <span className={returnItem.gstr3bFiled ? 'text-green-600' : 'text-red-600'}>
                        {returnItem.gstr3bFiled ? 'Filed' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Due: {new Date(returnItem.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Tax Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">GST Rate Wise Breakdown</h3>
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
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: rate.color }}
                        ></div>
                        <span className="font-semibold">{rate.rate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{formatCurrency(rate.taxableAmount)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(rate.cgst)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(rate.sgst)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(rate.igst)}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(rate.totalTax)}</td>
                    <td className="py-3 px-4 text-right">{rate.transactions}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold bg-gray-50">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(gstRates.reduce((sum, rate) => sum + rate.taxableAmount, 0))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(gstRates.reduce((sum, rate) => sum + rate.cgst, 0))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(gstRates.reduce((sum, rate) => sum + rate.sgst, 0))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(gstRates.reduce((sum, rate) => sum + rate.igst, 0))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(gstRates.reduce((sum, rate) => sum + rate.totalTax, 0))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {gstRates.reduce((sum, rate) => sum + rate.transactions, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}