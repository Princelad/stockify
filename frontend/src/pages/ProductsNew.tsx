import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import type { Product, ProductFilters, Category, Supplier } from "@/types/product";
import { 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Eye,
  X
} from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
          apiService.getProducts(filters),
          apiService.getCategories(),
          apiService.getSuppliers()
        ]);

        if (productsResponse.success) {
          // Handle the nested response structure from API
          const responseData = productsResponse.data as any;
          if (responseData && responseData.products) {
            setProducts(responseData.products);
          } else if (Array.isArray(responseData)) {
            setProducts(responseData);
          } else {
            setProducts([]);
          }
        }
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data!);
        }
        if (suppliersResponse.success) {
          setSuppliers(suppliersResponse.data!);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [filters]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing other filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    const currentStock = product.currentStock || product.stock || 0;
    const minLevel = product.minStockLevel || 0;
    if (currentStock === 0) return { status: 'Out of Stock', variant: 'danger' as const };
    if (currentStock <= minLevel) return { status: 'Low Stock', variant: 'warning' as const };
    return { status: 'In Stock', variant: 'success' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar currentPage="products" />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar currentPage="products" onAddProduct={() => setShowAddProduct(true)} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
            <p className="text-gray-600 mt-1">Manage your product catalog and inventory levels</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.supplier || 'all'} onValueChange={(value) => handleFilterChange('supplier', value === 'all' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier._id} value={supplier.name}>
                        {supplier.name} ({supplier.productCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Button
                    variant={filters.lowStock ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Low Stock
                  </Button>
                  <Button
                    variant={filters.outOfStock ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('outOfStock', !filters.outOfStock)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Out of Stock
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {products.length} products
                </div>
                <div className="flex space-x-2">
                  <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="sellingPrice-asc">Price (Low to High)</SelectItem>
                      <SelectItem value="sellingPrice-desc">Price (High to Low)</SelectItem>
                      <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                      <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <Package className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No products found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or add your first product</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => {
                        const stockStatus = getStockStatus(product);
                        return (
                          <TableRow key={product._id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{product.category}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium ${
                                  (product.currentStock || product.stock || 0) === 0 ? 'text-red-600' : 
                                  (product.currentStock || product.stock || 0) <= (product.minStockLevel || 0) ? 'text-yellow-600' : 
                                  'text-green-600'
                                }`}>
                                  {product.currentStock || product.stock || 0}
                                </span>
                                <span className="text-sm text-gray-500">/ {product.minStockLevel || 0} min</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatCurrency(product.sellingPrice)}</div>
                                {product.costPrice && (
                                  <div className="text-sm text-gray-500">
                                    Cost: {formatCurrency(product.costPrice)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {typeof product.supplier === 'string' ? product.supplier : (product.supplier?.name || 'Unknown')}
                                </div>
                                {typeof product.supplier === 'object' && product.supplier?.contact && (
                                  <div className="text-gray-500">{product.supplier.contact}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.variant}>
                                {stockStatus.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {/* Handle edit */}}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {/* Handle delete */}}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {filters.page || 1} of {Math.ceil(products.length / (filters.limit || 10))}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                  disabled={(filters.page || 1) <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                  disabled={products.length < (filters.limit || 10)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onClose={() => setShowAddProduct(false)} />
        </DialogContent>
      </Dialog>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// Product Form Component
function ProductForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStockLevel: 5,
    supplier: {
      name: '',
      contact: '',
      email: '',
      phone: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createProduct(formData);
      onClose();
      // Refresh products list
      window.location.reload();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            required
            value={formData.sku}
            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="sellingPrice">Selling Price *</Label>
          <Input
            id="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.sellingPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            required
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
          <Input
            id="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Supplier Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplierName">Supplier Name *</Label>
            <Input
              id="supplierName"
              required
              value={formData.supplier.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                supplier: { ...prev.supplier, name: e.target.value } 
              }))}
            />
          </div>
          <div>
            <Label htmlFor="supplierContact">Contact Person</Label>
            <Input
              id="supplierContact"
              value={formData.supplier.contact}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                supplier: { ...prev.supplier, contact: e.target.value } 
              }))}
            />
          </div>
          <div>
            <Label htmlFor="supplierEmail">Email</Label>
            <Input
              id="supplierEmail"
              type="email"
              value={formData.supplier.email}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                supplier: { ...prev.supplier, email: e.target.value } 
              }))}
            />
          </div>
          <div>
            <Label htmlFor="supplierPhone">Phone</Label>
            <Input
              id="supplierPhone"
              value={formData.supplier.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                supplier: { ...prev.supplier, phone: e.target.value } 
              }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Create Product
        </Button>
      </div>
    </form>
  );
}

// Product Details Modal
function ProductDetailsModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    const currentStock = product.currentStock || product.stock || 0;
    const minLevel = product.minStockLevel || 0;
    if (currentStock === 0) return { status: 'Out of Stock', variant: 'danger' as const };
    if (currentStock <= minLevel) return { status: 'Low Stock', variant: 'warning' as const };
    return { status: 'In Stock', variant: 'success' as const };
  };

  const stockStatus = getStockStatus(product);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>{product.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">SKU</label>
              <p className="font-mono">{product.sku}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p>{product.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Brand</label>
              <p>{product.brand || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1">{product.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Pricing Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Cost Price</label>
                <p className="text-lg font-semibold">{formatCurrency(product.costPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Selling Price</label>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(product.sellingPrice)}</p>
              </div>
              {product.wholesalePrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Wholesale Price</label>
                  <p className="text-lg font-semibold">{formatCurrency(product.wholesalePrice)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Profit Margin</label>
                <p className="text-lg font-semibold text-blue-600">
                  {((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Stock Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Stock</label>
                <p className={`text-2xl font-bold ${
                  (product.currentStock || product.stock || 0) === 0 ? 'text-red-600' : 
                  (product.currentStock || product.stock || 0) <= (product.minStockLevel || 0) ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {product.currentStock || product.stock || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Minimum Level</label>
                <p className="text-xl font-semibold">{product.minStockLevel}</p>
              </div>
              {product.maxStockLevel && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Maximum Level</label>
                  <p className="text-xl font-semibold">{product.maxStockLevel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="font-medium">
                  {typeof product.supplier === 'string' ? product.supplier : (product.supplier?.name || 'Unknown')}
                </p>
              </div>
              {typeof product.supplier === 'object' && product.supplier?.contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p>{product.supplier.contact}</p>
                </div>
              )}
              {typeof product.supplier === 'object' && product.supplier?.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{product.supplier.email}</p>
                </div>
              )}
              {typeof product.supplier === 'object' && product.supplier?.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p>{product.supplier.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <div className="flex justify-between">
              <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
