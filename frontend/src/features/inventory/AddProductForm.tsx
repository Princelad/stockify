import React, { useState, useEffect } from 'react';
import { 
  Package, 
  DollarSign, 
  Truck, 
  Archive,
  Plus,
  Minus,
  Check,
  Lightbulb,
  TrendingUp,
  Calculator
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { validateProduct, type ProductFormData } from '@/lib/schemas/product';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface AddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ProductFormData>;
}

const AddProductForm: React.FC<AddProductProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData 
}) => {
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: '',
    description: '',
    sku: '',
    category: '',
    brand: '',
    barcode: '',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    currentStock: 0,
    minStockLevel: 10,
    maxStockLevel: undefined,
    supplier: {
      name: '',
      contact: '',
      email: '',
      address: ''
    },
    weight: undefined,
    dimensions: {
      length: undefined,
      width: undefined,
      height: undefined
    },
    images: [],
    ...initialData
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<{
    categories: string[];
    brands: string[];
    suppliers: string[];
  }>({
    categories: [],
    brands: [],
    suppliers: []
  });
  
  // Remove unused state
  // const [showSuggestions, setShowSuggestions] = useState<{
  //   sku: boolean;
  //   pricing: boolean;
  //   stock: boolean;
  // }>({
  //   sku: false,
  //   pricing: false,
  //   stock: false
  // });

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getSuppliers()
      ]);
      
      if (categoriesRes.success && suppliersRes.success) {
        setSuggestions({
          categories: categoriesRes.data?.map((cat: any) => cat._id || cat.name) || [],
          brands: [], // Could be derived from products
          suppliers: suppliersRes.data?.map((sup: any) => sup.name) || []
        });
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  // Smart SKU generation
  const generateSKU = () => {
    const categoryCode = formData.category ? 
      formData.category.substring(0, 3).toUpperCase() : 'GEN';
    const nameCode = formData.name ? 
      formData.name.substring(0, 3).toUpperCase().replace(/\s/g, '') : 'PRD';
    const timestamp = Date.now().toString().slice(-4);
    
    return `${categoryCode}-${nameCode}-${timestamp}`;
  };

  // Smart pricing calculations
  const calculateSuggestedPricing = () => {
    const costPrice = formData.costPrice || 0;
    if (costPrice <= 0) return null;
    
    return {
      retailPrice: Math.round(costPrice * 1.3 * 100) / 100, // 30% markup
      wholesalePrice: Math.round(costPrice * 1.15 * 100) / 100, // 15% markup
      profitMargin: {
        retail: '30%',
        wholesale: '15%'
      }
    };
  };

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev } as any;
      
      // Handle nested objects
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateStep = (step: number) => {
    const stepFields = getStepFields(step);
    const stepData = {} as any;
    
    stepFields.forEach(field => {
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = formData as any;
        for (const key of keys) {
          current = current?.[key];
        }
        stepData[field] = current;
      } else {
        stepData[field] = (formData as any)[field];
      }
    });
    
    const validation = validateProduct({ ...formData, ...stepData });
    
    if (!validation.success) {
      const stepErrors = {} as any;
      Object.keys(validation.errors || {}).forEach(key => {
        if (stepFields.includes(key)) {
          stepErrors[key] = validation.errors![key];
        }
      });
      
      setErrors(prev => ({ ...prev, ...stepErrors }));
      return Object.keys(stepErrors).length === 0;
    }
    
    return true;
  };

  const getStepFields = (step: number) => {
    switch (step) {
      case 1:
        return ['name', 'sku', 'category', 'brand', 'description'];
      case 2:
        return ['costPrice', 'sellingPrice', 'wholesalePrice'];
      case 3:
        return ['currentStock', 'minStockLevel', 'maxStockLevel'];
      case 4:
        return ['supplier.name', 'supplier.contact', 'supplier.email', 'supplier.address'];
      default:
        return [];
    }
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const validation = validateProduct(formData);
      
      if (!validation.success) {
        setErrors(validation.errors || {});
        setCurrentStep(1); // Go back to first step with errors
        toast({
          title: 'Validation Error',
          description: 'Please fix the form errors before submitting.',
          type: 'error',
        });
        return;
      }

      // Transform data for API
      if (!validation.data) {
        throw new Error('Validation failed');
      }
      
      const productData = {
        ...validation.data,
        // Map currentStock to both fields for compatibility
        stock: validation.data.currentStock,
        // Handle optional dimensions
        dimensions: validation.data.dimensions && 
          validation.data.dimensions.length !== undefined &&
          validation.data.dimensions.width !== undefined &&
          validation.data.dimensions.height !== undefined ? {
          length: validation.data.dimensions.length,
          width: validation.data.dimensions.width,
          height: validation.data.dimensions.height,
        } : undefined,
      };

      const response = await apiService.createProduct(productData);
      
      if (response.success) {
        toast({
          title: 'Success!',
          description: 'Product added successfully.',
          type: 'success',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderPricing();
      case 3:
        return renderStock();
      case 4:
        return renderSupplier();
      case 5:
        return renderReview();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Basic Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter product name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sku">SKU *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleChange('sku', generateSKU())}
              className="h-6 w-6 p-0"
            >
              <Lightbulb className="h-3 w-3" />
            </Button>
          </div>
          <Input
            id="sku"
            value={formData.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Product SKU"
            className={errors.sku ? 'border-red-500' : ''}
          />
          {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Product category"
            list="categories"
            className={errors.category ? 'border-red-500' : ''}
          />
          <datalist id="categories">
            {suggestions.categories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Product brand"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode || ''}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="Product barcode"
            className={errors.barcode ? 'border-red-500' : ''}
          />
          {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
        </div>
      </div>
    </div>
  );

  const renderPricing = () => {
    const suggestedPricing = calculateSuggestedPricing();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Pricing Information</h3>
        </div>
        
        {suggestedPricing && (
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Suggested Pricing:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" 
                    className="cursor-pointer" 
                    onClick={() => handleChange('sellingPrice', suggestedPricing.retailPrice)}
                  >
                    Retail: ${suggestedPricing.retailPrice}
                  </Badge>
                  <Badge variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleChange('wholesalePrice', suggestedPricing.wholesalePrice)}
                  >
                    Wholesale: ${suggestedPricing.wholesalePrice}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price * ($)</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice || ''}
              onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.costPrice ? 'border-red-500' : ''}
            />
            {errors.costPrice && <p className="text-red-500 text-sm">{errors.costPrice}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price * ($)</Label>
            <Input
              id="sellingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice || ''}
              onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.sellingPrice ? 'border-red-500' : ''}
            />
            {errors.sellingPrice && <p className="text-red-500 text-sm">{errors.sellingPrice}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wholesalePrice">Wholesale Price ($)</Label>
            <Input
              id="wholesalePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.wholesalePrice || ''}
              onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.wholesalePrice ? 'border-red-500' : ''}
            />
            {errors.wholesalePrice && <p className="text-red-500 text-sm">{errors.wholesalePrice}</p>}
          </div>
        </div>
        
        {/* Profit margin display */}
        {formData.costPrice && formData.sellingPrice && formData.costPrice > 0 && formData.sellingPrice > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-900">Profit Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Retail Margin: </span>
                <span className="font-medium">
                  {Math.round(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100)}%
                </span>
              </div>
              {formData.wholesalePrice && formData.wholesalePrice > 0 && (
                <div>
                  <span className="text-gray-600">Wholesale Margin: </span>
                  <span className="font-medium">
                    {Math.round(((formData.wholesalePrice - formData.costPrice) / formData.costPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStock = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Archive className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Stock Management</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentStock">Current Stock *</Label>
          <Input
            id="currentStock"
            type="number"
            min="0"
            value={formData.currentStock || ''}
            onChange={(e) => handleChange('currentStock', parseInt(e.target.value) || 0)}
            placeholder="0"
            className={errors.currentStock ? 'border-red-500' : ''}
          />
          {errors.currentStock && <p className="text-red-500 text-sm">{errors.currentStock}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minStockLevel">Min Stock Level *</Label>
          <Input
            id="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel || ''}
            onChange={(e) => handleChange('minStockLevel', parseInt(e.target.value) || 0)}
            placeholder="10"
            className={errors.minStockLevel ? 'border-red-500' : ''}
          />
          {errors.minStockLevel && <p className="text-red-500 text-sm">{errors.minStockLevel}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxStockLevel">Max Stock Level</Label>
          <Input
            id="maxStockLevel"
            type="number"
            min="0"
            value={formData.maxStockLevel || ''}
            onChange={(e) => handleChange('maxStockLevel', parseInt(e.target.value) || undefined)}
            placeholder="1000"
            className={errors.maxStockLevel ? 'border-red-500' : ''}
          />
          {errors.maxStockLevel && <p className="text-red-500 text-sm">{errors.maxStockLevel}</p>}
        </div>
      </div>
      
      {/* Stock level indicators */}
      {formData.currentStock !== undefined && formData.minStockLevel !== undefined && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Stock Level Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                (formData.currentStock || 0) <= (formData.minStockLevel || 0) 
                  ? 'bg-red-500' 
                  : 'bg-green-500'
              }`} />
              <span className="text-sm">
                {(formData.currentStock || 0) <= (formData.minStockLevel || 0) 
                  ? 'Low Stock Alert' 
                  : 'Stock Level OK'
                }
              </span>
            </div>
            
            {formData.maxStockLevel && formData.currentStock && formData.currentStock > formData.maxStockLevel && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Overstock Alert</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSupplier = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Supplier Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplierName">Supplier Name *</Label>
          <Input
            id="supplierName"
            value={formData.supplier?.name || ''}
            onChange={(e) => handleChange('supplier.name', e.target.value)}
            placeholder="Supplier name"
            list="suppliers"
            className={errors['supplier.name'] ? 'border-red-500' : ''}
          />
          <datalist id="suppliers">
            {suggestions.suppliers.map(supplier => (
              <option key={supplier} value={supplier} />
            ))}
          </datalist>
          {errors['supplier.name'] && <p className="text-red-500 text-sm">{errors['supplier.name']}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplierContact">Contact Number</Label>
          <Input
            id="supplierContact"
            value={formData.supplier?.contact || ''}
            onChange={(e) => handleChange('supplier.contact', e.target.value)}
            placeholder="Contact number"
            className={errors['supplier.contact'] ? 'border-red-500' : ''}
          />
          {errors['supplier.contact'] && <p className="text-red-500 text-sm">{errors['supplier.contact']}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplierEmail">Email</Label>
          <Input
            id="supplierEmail"
            type="email"
            value={formData.supplier?.email || ''}
            onChange={(e) => handleChange('supplier.email', e.target.value)}
            placeholder="supplier@example.com"
            className={errors['supplier.email'] ? 'border-red-500' : ''}
          />
          {errors['supplier.email'] && <p className="text-red-500 text-sm">{errors['supplier.email']}</p>}
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="supplierAddress">Address</Label>
          <Textarea
            id="supplierAddress"
            value={formData.supplier?.address || ''}
            onChange={(e) => handleChange('supplier.address', e.target.value)}
            placeholder="Supplier address"
            rows={3}
            className={errors['supplier.address'] ? 'border-red-500' : ''}
          />
          {errors['supplier.address'] && <p className="text-red-500 text-sm">{errors['supplier.address']}</p>}
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Check className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Review & Confirm</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Name:</span> {formData.name}</div>
            <div><span className="font-medium">SKU:</span> {formData.sku}</div>
            <div><span className="font-medium">Category:</span> {formData.category}</div>
            {formData.brand && <div><span className="font-medium">Brand:</span> {formData.brand}</div>}
          </CardContent>
        </Card>
        
        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Cost:</span> ${formData.costPrice}</div>
            <div><span className="font-medium">Selling:</span> ${formData.sellingPrice}</div>
            {formData.wholesalePrice && <div><span className="font-medium">Wholesale:</span> ${formData.wholesalePrice}</div>}
            <div className="text-sm text-green-600">
              Margin: {formData.costPrice && formData.sellingPrice && formData.costPrice > 0 ? 
                Math.round(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        
        {/* Stock Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Current:</span> {formData.currentStock} units</div>
            <div><span className="font-medium">Min Level:</span> {formData.minStockLevel} units</div>
            {formData.maxStockLevel && <div><span className="font-medium">Max Level:</span> {formData.maxStockLevel} units</div>}
          </CardContent>
        </Card>
        
        {/* Supplier Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Name:</span> {formData.supplier?.name}</div>
            {formData.supplier?.contact && <div><span className="font-medium">Contact:</span> {formData.supplier.contact}</div>}
            {formData.supplier?.email && <div><span className="font-medium">Email:</span> {formData.supplier.email}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Product</h2>
        <p className="text-gray-600">Fill in the product information step by step</p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
                ${step === currentStep ? 'ring-2 ring-blue-300' : ''}
              `}>
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 5 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Pricing</span>
          <span>Stock</span>
          <span>Supplier</span>
          <span>Review</span>
        </div>
      </div>
      
      {/* Form Content */}
      <div key={currentStep}>
        {renderStepContent()}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              <Minus className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="space-x-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              disabled={isLoading}
            >
              Next
              <Plus className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
