import { useState, useEffect } from 'react';
import { InventoryLayout } from '@/layouts';
import { FileText, Plus, Search, ShoppingCart, Trash2, Calculator, User, CreditCard, Printer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService, type Customer as ApiCustomer } from '@/lib/api';
import { type Product } from '@/types/product';
import { useToast } from '@/hooks/useToast';

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  currentStock: number; // Add stock tracking
}

type Customer = ApiCustomer; // Use the API Customer type

export default function Billing() {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  
  // API state management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New customer form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  
  const { toast } = useToast();

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Search products when search term changes
  useEffect(() => {
    if (searchProduct.trim()) {
      searchProducts(searchProduct);
    } else {
      setSearchResults([]);
    }
  }, [searchProduct]);

  const loadCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ limit: 100 });
      if (response.success && response.data) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({ title: 'Error', description: 'Failed to load customers', type: 'error' });
    }
  };

  const searchProducts = async (query: string) => {
    try {
      const response = await apiService.searchProductsForBilling(query);
      if (response.success && response.data) {
        setSearchResults(response.data.products || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  const addItem = (product: Product) => {
    const existingItem = billItems.find(item => item.id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        toast({ 
          title: 'Insufficient Stock', 
          description: `Only ${product.currentStock} items in stock`,
          type: 'error'
        });
        return;
      }
      
      setBillItems(prev => prev.map(item =>
        item.id === product._id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total: (item.quantity + 1) * item.price 
            }
          : item
      ));
    } else {
      if (product.currentStock <= 0) {
        toast({ title: 'Out of Stock', description: 'Product is out of stock', type: 'error' });
        return;
      }
      
      // Determine price based on customer type
      const price = selectedCustomer?.isDealer && product.wholesalePrice 
        ? product.wholesalePrice 
        : product.sellingPrice;
      
      const newItem: BillItem = {
        id: product._id,
        name: product.name,
        price,
        quantity: 1,
        total: price,
        currentStock: product.currentStock
      };
      setBillItems(prev => [...prev, newItem]);
    }
    setSearchProduct('');
  };

  const removeItem = (itemId: string) => {
    setBillItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const item = billItems.find(item => item.id === itemId);
    if (item && quantity > item.currentStock) {
      toast({ 
        title: 'Insufficient Stock', 
        description: `Only ${item.currentStock} items available`,
        type: 'error'
      });
      return;
    }
    
    setBillItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  const createNewCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({ title: 'Error', description: 'Customer name is required', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createCustomer({
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail
      });
      
      if (response.success && response.data) {
        setCustomers(prev => [...prev, response.data!]);
        setSelectedCustomer(response.data);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
        setIsCustomerDialogOpen(false);
        toast({ title: 'Success', description: 'Customer created successfully', type: 'success' });
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to create customer', type: 'error' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create customer', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleBillGeneration = async () => {
    if (billItems.length === 0) {
      toast({ title: 'Error', description: 'Please add items to the bill', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const saleData = {
        customerId: selectedCustomer?._id,
        items: billItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        discountPercentage: discount,
        paymentMethod: paymentMethod as any,
        paymentStatus: 'paid' as any
      };
      
      const response = await apiService.createSale(saleData);
      
      if (response.success && response.data) {
        toast({ 
          title: 'Success', 
          description: `Bill generated successfully! Invoice #${response.data.invoiceNumber}`, 
          type: 'success' 
        });
        
        // Clear the current bill
        setBillItems([]);
        setSelectedCustomer(null);
        setDiscount(0);
        setSearchProduct('');
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to generate bill', type: 'error' });
      }
    } catch (error: any) {
      setError(error.message);
      toast({ title: 'Error', description: error.message || 'Failed to generate bill', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryLayout activeSection="Billing">
      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Billing & Sales
              </h1>
                <p className="text-gray-600 mt-1">Create bills and process sales transactions</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Last Bill
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Selection */}
            <div className="space-y-6">
              {/* Customer Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="flex gap-2">
                  <Select
                    value={selectedCustomer?._id || ""}
                    onValueChange={(value) => {
                      const customer = customers.find(c => c._id === value);
                      setSelectedCustomer(customer || null);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select customer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Enter customer details for the bill</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Customer Name</Label>
                          <Input 
                            placeholder="Enter customer name" 
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input 
                            placeholder="Enter phone number" 
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email (optional)</Label>
                          <Input 
                            placeholder="Enter email" 
                            value={newCustomerEmail}
                            onChange={(e) => setNewCustomerEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createNewCustomer} disabled={loading}>
                          {loading ? 'Creating...' : 'Add Customer'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {selectedCustomer && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add Products
                </h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products to add..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchProduct && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => addItem(product)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Stock: {product.currentStock}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(selectedCustomer?.isDealer && product.wholesalePrice 
                              ? product.wholesalePrice 
                              : product.sellingPrice
                            ).toLocaleString()}
                          </p>
                          <Button size="sm" className="mt-1">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {searchResults.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No products found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Bill Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Bill Summary
              </h3>
              
              {/* Bill Items */}
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {billItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="1"
                      />
                      <div className="text-right min-w-20">
                        <p className="font-semibold">₹{item.total.toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {billItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items added yet</p>
                    <p className="text-sm">Search and add products above</p>
                  </div>
                )}
              </div>

              {/* Discount */}
              {billItems.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                      className="w-20 text-center"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="netbanking">Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bill Totals */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%):</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Generate Bill Button */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleBillGeneration} className="flex-1" disabled={loading}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {loading ? 'Processing...' : 'Generate Bill'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setBillItems([]);
                      setSelectedCustomer(null);
                      setDiscount(0);
                      setError(null);
                    }}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </InventoryLayout>
  );
}
