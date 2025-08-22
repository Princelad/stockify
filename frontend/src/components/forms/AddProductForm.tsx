import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToastContainer } from '@/components/ui/toast';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { CreateProductRequest, Category, Supplier } from '@/types/product';
import { 
  Package, 
  DollarSign, 
  User, 
  Hash, 
  BarChart3, 
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface AddProductFormProps {
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
}

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const { toast, toasts, removeToast } = useToast();
  
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    barcode: '',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    stock: 0, // This will be mapped to currentStock in the API call
    minStockLevel: 10,
    maxStockLevel: 1000,
    supplier: {
      name: '',
      contact: '',
      email: '',
      address: ''
    },
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    // tags: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profitMargin, setProfitMargin] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    // Calculate profit margin when prices change
    if (formData.costPrice > 0 && formData.sellingPrice > 0) {
      const margin = ((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100;
      setProfitMargin(Math.round(margin * 100) / 100);
    } else {
      setProfitMargin(0);
    }
  }, [formData.costPrice, formData.sellingPrice]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        const categoryData = response.data as any;
        setCategories(categoryData.categoriesWithCount || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateProductRequest] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSupplierSelect = (supplierName: string) => {
    const selectedSupplier = suppliers.find(s => s.name === supplierName);
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplier: {
          name: selectedSupplier.name,
          contact: selectedSupplier.contact || '',
          email: selectedSupplier.email || '',
          address: selectedSupplier.address || ''
        }
      }));
    }
  };

  const generateSKU = () => {
    const categoryCode = formData.category.substring(0, 3).toUpperCase();
    const brandCode = formData.brand ? formData.brand.substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-4);
    const sku = `${categoryCode}${brandCode}${timestamp}`;
    handleInputChange('sku', sku);
  };

//   const addTag = () => {
//     if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...(prev.tags || []), tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   };

//   const removeTag = (tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
//     }));
//   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name || !formData.category || !formData.sku) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.sellingPrice <= formData.costPrice) {
        throw new Error('Selling price must be higher than cost price');
      }

      // Map form data to backend format
      const productData = {
        ...formData,
        currentStock: formData.stock, // Map stock to currentStock
      };
      delete (productData as any).stock; // Remove the original stock field

      const response = await apiService.createProduct(productData as any);
      
      if (response.success) {
        // Show success toast
        toast({
          type: 'success',
          title: 'Product Created Successfully!',
          description: `${formData.name} has been added to your inventory.`,
          duration: 5000
        });

        if (onSuccess) {
          onSuccess(response.data);
        }
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          brand: '',
          sku: '',
          barcode: '',
          costPrice: 0,
          sellingPrice: 0,
          wholesalePrice: 0,
          stock: 0,
          minStockLevel: 10,
          maxStockLevel: 1000,
          supplier: {
            name: '',
            contact: '',
            email: '',
            address: ''
          },
          weight: 0,
          dimensions: {
            length: 0,
            width: 0,
            height: 0
          },
        //   tags: []
        });
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setError(errorMessage);
      
      // Show error toast
      toast({
        type: 'error',
        title: 'Failed to Create Product',
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-6 w-6 mr-2" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category._id} ({category.count} items)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <Label htmlFor="sku" className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  SKU *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                    required
                  />
                  <Button type="button" onClick={generateSKU} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Cost Price *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellingPrice">Selling Price *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => handleInputChange('wholesalePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {profitMargin !== 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">
                      Profit Margin: 
                      <span className={`ml-2 ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin}%
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock">Initial Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Select value={formData.supplier.name} onValueChange={handleSupplierSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing supplier or enter new" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier.name}>
                            {supplier.name} ({supplier.productCount} products)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="mt-2"
                      placeholder="Or enter new supplier name"
                      value={formData.supplier.name}
                      onChange={(e) => handleInputChange('supplier.name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierContact">Contact Person</Label>
                      <Input
                        id="supplierContact"
                        value={formData.supplier.contact}
                        onChange={(e) => handleInputChange('supplier.contact', e.target.value)}
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="supplierEmail">Email</Label>
                      <Input
                        id="supplierEmail"
                        type="email"
                        value={formData.supplier.email}
                        onChange={(e) => handleInputChange('supplier.email', e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="supplierAddress">Address</Label>
                    <Textarea
                      id="supplierAddress"
                      value={formData.supplier.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('supplier.address', e.target.value)}
                      placeholder="Supplier address"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {/* <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div> */}
              {/* <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div> */}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}