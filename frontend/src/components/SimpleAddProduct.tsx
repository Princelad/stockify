import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/lib/api';
import { Package, DollarSign, Tag, Save, X } from 'lucide-react';

interface SimpleAddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SimpleAddProduct: React.FC<SimpleAddProductProps> = ({ 
  onSuccess, 
  onCancel
}) => {
  // Form state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number | string>('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState<number | string>('');
  
  // Suggestions state
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{_id: string, count: number}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Ref for clicking outside detection
  const nameInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicking outside of suggestion dropdown
    function handleClickOutside(event: MouseEvent) {
      if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch product suggestions and categories when component mounts
    fetchProductSuggestions();
    fetchCategories();
  }, []);

  const fetchProductSuggestions = async () => {
    try {
      const response = await apiService.getProducts({ limit: 20 });
      console.log('Product suggestions response:', response);
      if (response.success && response.data) {
        const products = response.data;
        
        // Extract unique product names for suggestions
        const names = Array.from(new Set(products.map((p: any) => p.name))) as string[];
        setNameSuggestions(names);
      }
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
    }
  };

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

  const handleSuggestionSelect = (suggestion: string) => {
    setProductName(suggestion);
    setShowSuggestions(false);
  };

  const filterSuggestions = (input: string) => {
    if (!input) return nameSuggestions;
    const lowerInput = input.toLowerCase();
    return nameSuggestions.filter(item => 
      item.toLowerCase().includes(lowerInput)
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const handleSubmit = () => {
    // Validate form data here
    if (!productName || !productPrice) {
      alert('Please fill in required fields');
      return;
    }
    
    // Here you would typically call an API to save the product
    console.log('Saving product:', {
      name: productName,
      price: productPrice,
      category: productCategory,
      stock: productStock
    });
    
    // Call onSuccess callback
    if (onSuccess) onSuccess();
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center text-2xl">
          <Package className="h-6 w-6 mr-2" />
          Add New Product
        </CardTitle>
        <p className="text-blue-50 mt-1">
          Quickly add a new product to your inventory
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-5">
          <div ref={nameInputRef} className="relative">
            <Label htmlFor="productName" className="flex items-center text-gray-700 font-medium">
              <Package className="h-4 w-4 mr-1" />
              Product Name <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input 
              id="productName" 
              placeholder="Enter product name"
              className="mt-1 border-gray-300"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {nameSuggestions.length > 0 ? (
                  filterSuggestions(productName).map((suggestion, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <Tag className="h-3 w-3 mr-2 text-blue-500" />
                      {suggestion}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No suggestions found</div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="productCategory" className="flex items-center text-gray-700 font-medium">
              <Tag className="h-4 w-4 mr-1" />
              Category
            </Label>
            <Select value={productCategory} onValueChange={setProductCategory}>
              <SelectTrigger className="mt-1 border-gray-300">
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
            <Label htmlFor="productPrice" className="flex items-center text-gray-700 font-medium">
              <DollarSign className="h-4 w-4 mr-1" />
              Price <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input 
              id="productPrice" 
              type="number"
              placeholder="0.00"
              className="mt-1 border-gray-300"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="productStock" className="flex items-center text-gray-700 font-medium">
              <Package className="h-4 w-4 mr-1" />
              Initial Stock
            </Label>
            <Input 
              id="productStock" 
              type="number"
              placeholder="0"
              className="mt-1 border-gray-300"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
            />
          </div>
        </div>
      
        <div className="flex justify-end space-x-3 mt-8">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAddProduct;
