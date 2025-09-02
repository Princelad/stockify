import { useState } from 'react';
import { Sidebar } from '@/components/inventory/Sidebar';
import { Topbar } from '@/components/inventory/Topbar';
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, CreditCard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  totalAmount: number;
  lastPurchase: string;
  status: 'active' | 'inactive';
  type: 'retail' | 'wholesale';
  creditLimit: number;
  outstandingAmount: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@email.com',
      phone: '+91 9876543210',
      address: '123 Main St, Delhi',
      totalPurchases: 15,
      totalAmount: 125000,
      lastPurchase: '2024-01-20',
      status: 'active',
      type: 'retail',
      creditLimit: 50000,
      outstandingAmount: 5000
    },
    {
      id: '2',
      name: 'ABC Electronics Store',
      email: 'abc@electronics.com',
      phone: '+91 8765432109',
      address: '456 Business Park, Mumbai',
      totalPurchases: 45,
      totalAmount: 850000,
      lastPurchase: '2024-01-25',
      status: 'active',
      type: 'wholesale',
      creditLimit: 200000,
      outstandingAmount: 25000
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@email.com',
      phone: '+91 7654321098',
      address: '789 Residential Area, Bangalore',
      totalPurchases: 8,
      totalAmount: 45000,
      lastPurchase: '2024-01-18',
      status: 'active',
      type: 'retail',
      creditLimit: 20000,
      outstandingAmount: 0
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'retail' | 'wholesale'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'retail' as 'retail' | 'wholesale',
    creditLimit: 10000
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesType = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id 
          ? { ...customer, ...formData }
          : customer
      ));
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        totalPurchases: 0,
        totalAmount: 0,
        lastPurchase: new Date().toISOString().split('T')[0],
        status: 'active',
        outstandingAmount: 0
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'retail',
      creditLimit: 10000
    });
    setIsAddDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      creditLimit: customer.creditLimit
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    }
  };

  const stats = {
    total: customers.length,
    retail: customers.filter(c => c.type === 'retail').length,
    wholesale: customers.filter(c => c.type === 'wholesale').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalAmount, 0),
    totalOutstanding: customers.reduce((sum, c) => sum + c.outstandingAmount, 0)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Customers" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Customers
                </h1>
                <p className="text-gray-600 mt-1">Manage customer relationships and track purchase history</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingCustomer(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        type: 'retail',
                        creditLimit: 10000
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCustomer ? 'Update customer information' : 'Create a new customer profile'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Customer Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Customer Type</Label>
                          <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'retail' | 'wholesale' }))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="retail">Retail</option>
                            <option value="wholesale">Wholesale</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                          <Input
                            id="creditLimit"
                            type="number"
                            value={formData.creditLimit}
                            onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: parseInt(e.target.value) || 0 }))}
                            placeholder="Credit limit"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingCustomer ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retail</p>
                  <p className="text-2xl font-bold text-green-600">{stats.retail}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Retail</Badge>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Wholesale</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.wholesale}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Wholesale</Badge>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-lg font-bold text-red-600">₹{stats.totalOutstanding.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'retail' | 'wholesale')}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Customers</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          {/* Customers List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer List</h3>
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{customer.name}</h4>
                          <Badge className={customer.type === 'wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                            {customer.type}
                          </Badge>
                          <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {customer.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {customer.address}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Total Purchases</p>
                            <p className="font-semibold">{customer.totalPurchases}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="font-semibold text-green-600">₹{customer.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Credit Limit</p>
                            <p className="font-semibold">₹{customer.creditLimit.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Outstanding</p>
                            <p className={`font-semibold ${customer.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ₹{customer.outstandingAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'No customers match your search.' : 'Get started by adding your first customer.'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
