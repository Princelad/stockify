import { useState } from 'react';
import { InventoryLayout } from '@/layouts';
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Package, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  productCount: number;
  totalValue: number;
  lastOrder: string;
  status: 'active' | 'inactive';
  paymentTerms: string;
  category: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Apple Distributors Pvt Ltd',
      email: 'orders@appledist.com',
      phone: '+91 9876543210',
      address: '123 Electronics Hub, Delhi',
      contactPerson: 'Rajesh Kumar',
      productCount: 25,
      totalValue: 2500000,
      lastOrder: '2024-01-20',
      status: 'active',
      paymentTerms: '30 days',
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Samsung Wholesale Co.',
      email: 'business@samsung-wholesale.com',
      phone: '+91 8765432109',
      address: '456 Business Park, Mumbai',
      contactPerson: 'Priya Sharma',
      productCount: 32,
      totalValue: 1800000,
      lastOrder: '2024-01-25',
      status: 'active',
      paymentTerms: '45 days',
      category: 'Electronics'
    },
    {
      id: '3',
      name: 'Fashion Forward Supplies',
      email: 'info@fashionforward.com',
      phone: '+91 7654321098',
      address: '789 Textile Market, Bangalore',
      contactPerson: 'Amit Patel',
      productCount: 18,
      totalValue: 450000,
      lastOrder: '2024-01-18',
      status: 'active',
      paymentTerms: '15 days',
      category: 'Clothing'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    paymentTerms: '30 days',
    category: 'Electronics'
  });

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === editingSupplier.id 
          ? { ...supplier, ...formData }
          : supplier
      ));
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData,
        productCount: 0,
        totalValue: 0,
        lastOrder: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      paymentTerms: '30 days',
      category: 'Electronics'
    });
    setIsAddDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactPerson: supplier.contactPerson,
      paymentTerms: supplier.paymentTerms,
      category: supplier.category
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (supplierId: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
    }
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    totalProducts: suppliers.reduce((sum, s) => sum + s.productCount, 0),
    totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0)
  };

  return (
    <InventoryLayout activeSection="Suppliers">
      <div className="p-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Suppliers
                </h1>
                <p className="text-gray-600 mt-1">Manage supplier relationships and procurement</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingSupplier(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        address: '',
                        contactPerson: '',
                        paymentTerms: '30 days',
                        category: 'Electronics'
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSupplier ? 'Update supplier information' : 'Create a new supplier profile'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                          placeholder="Enter contact person name"
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
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentTerms">Payment Terms</Label>
                          <select
                            id="paymentTerms"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="15 days">15 days</option>
                            <option value="30 days">30 days</option>
                            <option value="45 days">45 days</option>
                            <option value="60 days">60 days</option>
                            <option value="Cash on delivery">Cash on delivery</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingSupplier ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-bold text-blue-600">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier List</h3>
              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{supplier.name}</h4>
                          <Badge className="bg-blue-100 text-blue-800">
                            {supplier.category}
                          </Badge>
                          <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {supplier.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {supplier.contactPerson}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {supplier.email}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <MapPin className="h-4 w-4" />
                          {supplier.address}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Products</p>
                            <p className="font-semibold">{supplier.productCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Value</p>
                            <p className="font-semibold text-green-600">₹{supplier.totalValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Payment Terms</p>
                            <p className="font-semibold">{supplier.paymentTerms}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Order</p>
                            <p className="font-semibold">{supplier.lastOrder}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(supplier.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'No suppliers match your search.' : 'Get started by adding your first supplier.'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Supplier
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    </InventoryLayout>
  );
}
