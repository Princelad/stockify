import { useState } from 'react';
import { Sidebar } from '@/components/inventory/Sidebar';
import { Topbar } from '@/components/inventory/Topbar';
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, FileText, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [reportType, setReportType] = useState('sales');

  // Mock data for different report types
  const reportData = {
    sales: {
      title: 'Sales Report',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: [
        { period: 'Jan 2024', value: 125000, count: 45 },
        { period: 'Feb 2024', value: 135000, count: 52 },
        { period: 'Mar 2024', value: 142000, count: 48 },
        { period: 'Apr 2024', value: 158000, count: 65 }
      ]
    },
    inventory: {
      title: 'Inventory Report',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: [
        { item: 'iPhone 13', stock: 15, value: 675000, movement: 'high' },
        { item: 'Samsung Galaxy S21', stock: 8, value: 280000, movement: 'medium' },
        { item: 'MacBook Air', stock: 3, value: 255000, movement: 'low' },
        { item: 'OnePlus 9', stock: 12, value: 360000, movement: 'high' }
      ]
    },
    customers: {
      title: 'Customer Report',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: [
        { name: 'John Doe', purchases: 15, amount: 125000, type: 'retail' },
        { name: 'ABC Electronics', purchases: 45, amount: 850000, type: 'wholesale' },
        { name: 'Jane Smith', purchases: 8, amount: 45000, type: 'retail' }
      ]
    }
  };

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: '₹4,58,000',
      change: '+15.2%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Sales',
      value: '210',
      change: '+8.4%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Products',
      value: '1,245',
      change: '+2.1%',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Customers',
      value: '324',
      change: '+12.5%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
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

  const reports = [
    { value: 'sales', label: 'Sales Report', icon: DollarSign },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'customers', label: 'Customer Report', icon: Users }
  ];

  const currentReport = reportData[reportType as keyof typeof reportData];

  const handleExport = (format: 'pdf' | 'excel') => {
    // Implementation for export functionality
    alert(`Exporting ${currentReport.title} as ${format.toUpperCase()}...`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Reports" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 mt-1">Track business performance and generate insights</p>
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
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <Badge className="bg-green-100 text-green-800">{card.change}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Label>Report Type:</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {reports.map((report) => (
                    <option key={report.value} value={report.value}>
                      {report.label}
                    </option>
                  ))}
                </select>
              </div>
              
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

          {/* Report Content */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <currentReport.icon className={`h-5 w-5 ${currentReport.color}`} />
                {currentReport.title}
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Generated on</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Sales Report */}
            {reportType === 'sales' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Monthly Sales Trends</h3>
                    <div className="space-y-3">
                      {currentReport.data.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.period}</p>
                            <p className="text-sm text-gray-600">{item.count} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₹{item.value.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Sales Analytics</h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-center text-gray-400">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Report */}
            {reportType === 'inventory' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Stock Analysis</h3>
                <div className="grid grid-cols-1 gap-3">
                  {currentReport.data.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.item}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            item.movement === 'high' ? 'bg-green-100 text-green-800' :
                            item.movement === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {item.movement} movement
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Stock: {item.stock}</p>
                        <p className="text-sm text-gray-600">₹{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Report */}
            {reportType === 'customers' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Top Customers</h3>
                <div className="grid grid-cols-1 gap-3">
                  {currentReport.data.map((customer: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={customer.type === 'wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                            {customer.type}
                          </Badge>
                          <span className="text-sm text-gray-600">{customer.purchases} purchases</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{customer.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => setReportType('sales')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Sales Analysis</p>
                    <p className="text-sm text-gray-600">View revenue trends</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => setReportType('inventory')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Stock Report</p>
                    <p className="text-sm text-gray-600">Monitor inventory levels</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => setReportType('customers')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Customer Insights</p>
                    <p className="text-sm text-gray-600">Analyze customer behavior</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
