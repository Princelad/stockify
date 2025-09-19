import { useState } from 'react';
import { InventoryLayout } from '@/layouts';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, TrendingUp, Package, Users, DollarSign, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

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
    {
      title: 'Sales Report',
      description: 'Track revenue trends and sales performance',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      route: '/reports/sales',
      metrics: [
        { label: 'Monthly Revenue', value: '₹1,56,400' },
        { label: 'Transactions', value: '89' },
        { label: 'Growth', value: '+15.2%' }
      ]
    },
    {
      title: 'Inventory Report',
      description: 'Monitor stock levels and inventory movements',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      route: '/reports/inventory',
      metrics: [
        { label: 'Total Value', value: '₹9,41,000' },
        { label: 'Low Stock', value: '12 items' },
        { label: 'Movement', value: 'High' }
      ]
    },
    {
      title: 'Tax Report',
      description: 'GST analysis and tax compliance tracking',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      route: '/reports/tax',
      metrics: [
        { label: 'Tax Collected', value: '₹1,56,400' },
        { label: 'Pending Returns', value: '2' },
        { label: 'Compliance', value: '85%' }
      ]
    }
  ];

  return (
    <InventoryLayout activeSection="Reports">
      <div className="p-8">
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
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
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
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Report Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Detailed Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-sm border-2 ${report.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate(report.route)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${report.bgColor}`}>
                        <report.icon className={`h-6 w-6 ${report.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                    
                    <div className="space-y-2">
                      {report.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{metric.label}:</span>
                          <span className="font-semibold">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(report.route);
                      }}
                    >
                      View Detailed Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => navigate('/reports/sales')}
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
                onClick={() => navigate('/reports/inventory')}
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
                onClick={() => navigate('/reports/tax')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Tax Reports</p>
                    <p className="text-sm text-gray-600">GST and compliance</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
    </InventoryLayout>
  );
}
