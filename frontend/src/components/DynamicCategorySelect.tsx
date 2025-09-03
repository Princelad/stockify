import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import type { Category } from '@/types/product';
import { 
  Plus, 
  Sparkles, 
  User, 
  Package,
  Loader2,
  Check,
  X
} from 'lucide-react';

interface DynamicCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DynamicCategorySelect: React.FC<DynamicCategorySelectProps> = ({
  value,
  onChange,
  placeholder = "Select category",
  className = ""
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
      } else {
        setError('Failed to load categories');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      
      const response = await apiService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined
      });

      if (response.success) {
        // Refresh categories list
        await fetchCategories();
        
        // Select the newly created category
        onChange(newCategoryName.trim());
        
        // Reset form and close dialog
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCreateDialog(false);
      } else {
        setError(response.message || 'Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = (category: Category) => {
    if (category.isPopular) return <Sparkles className="h-3 w-3 text-yellow-500" />;
    if (category.type === 'user_created') return <User className="h-3 w-3 text-blue-500" />;
    if (category.type === 'from_products') return <Package className="h-3 w-3 text-green-500" />;
    return null;
  };

  const getCategoryBadgeVariant = (category: Category) => {
    if (category.isPopular) return 'default';
    if (category.type === 'user_created') return 'secondary';
    return 'outline';
  };

  // Group categories by type
  const popularCategories = categories.filter(cat => cat.isPopular);
  const userCategories = categories.filter(cat => cat.type === 'user_created');
  const productCategories = categories.filter(cat => cat.type === 'from_products');

  return (
    <div className={`space-y-2 ${className}`}>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            </SelectItem>
          ) : (
            <>
              {/* Popular Categories */}
              {popularCategories.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                    Popular Categories
                  </div>
                  {popularCategories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span>{category.name}</span>
                        </div>
                        <Badge variant={getCategoryBadgeVariant(category)} className="ml-2">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* User Created Categories */}
              {userCategories.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                    Your Categories
                  </div>
                  {userCategories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span>{category.name}</span>
                        </div>
                        <Badge variant={getCategoryBadgeVariant(category)} className="ml-2">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Product-derived Categories */}
              {productCategories.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                    From Products
                  </div>
                  {productCategories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span>{category.name}</span>
                        </div>
                        <Badge variant={getCategoryBadgeVariant(category)} className="ml-2">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* No categories found */}
              {categories.length === 0 && !loading && (
                <SelectItem value="no-categories" disabled>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Package className="h-4 w-4" />
                    <span>No categories available</span>
                  </div>
                </SelectItem>
              )}

              {/* Create new category option */}
              <div className="border-t pt-1">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost" 
                      className="w-full justify-start text-left font-normal"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create new category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          disabled={creating}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category-description">Description (Optional)</Label>
                        <Input
                          id="category-description"
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          placeholder="Enter category description"
                          disabled={creating}
                        />
                      </div>
                      
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateDialog(false);
                            setNewCategoryName('');
                            setNewCategoryDescription('');
                            setError(null);
                          }}
                          disabled={creating}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateCategory}
                          disabled={!newCategoryName.trim() || creating}
                        >
                          {creating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </SelectContent>
      </Select>

      {/* Show category details if selected */}
      {value && (
        <div className="text-xs text-gray-500">
          {(() => {
            const selectedCategory = categories.find(cat => cat.name === value);
            if (selectedCategory?.description) {
              return selectedCategory.description;
            }
            return null;
          })()}
        </div>
      )}
      
      {error && !loading && (
        <div className="text-xs text-red-600">
          {error}
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs ml-2"
            onClick={fetchCategories}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
