import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BarChart3, Loader2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { Category } from "@/types/product";

interface CategorySelectProps {
  value?: string;
  onSelect: (category: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

interface CreateCategoryData {
  name: string;
  description: string;
}

export default function CategorySelect({
  value,
  onSelect,
  placeholder = "Select category",
  disabled = false,
  required = false,
  label = "Category",
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
  });

  const { toast } = useToast();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fetching categories...");
      const response = await apiService.getCategories();
      console.log("Categories API response:", response);
      if (response.success && response.data) {
        const categoryData = response.data as any;
        // Fix: Use the correct property name from API response
        const categoriesArray = categoryData.categories || [];
        console.log("Categories loaded:", categoriesArray);
        setCategories(categoriesArray);

        if (categoriesArray.length === 0) {
          console.warn("No categories found in database");
        }
      } else {
        console.error("Failed to fetch categories:", response);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creating) return;

    setCreating(true);

    try {
      const response = await apiService.createCategory(createFormData);

      if (response.success && response.data) {
        const newCategory = response.data as Category;
        // Add the new category to the list
        const categoryWithCount = {
          ...newCategory,
          count: 0,
          _id: newCategory.name || newCategory._id, // Use name as _id for consistency
        };
        setCategories((prev) => [categoryWithCount, ...prev]);
        onSelect(newCategory.name || newCategory._id);

        toast({
          title: "Success",
          description: "Category created successfully",
          type: "success",
        });

        // Reset form and close dialog
        setCreateFormData({
          name: "",
          description: "",
        });
        setIsCreateDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create category",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    onSelect(categoryId);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <BarChart3 className="h-4 w-4 mr-1" />
        {label} {required && "*"}
      </Label>

      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={value || ""}
            onValueChange={handleCategoryChange}
            disabled={disabled || loading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={loading ? "Loading categories..." : placeholder}
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : categories.length === 0 ? (
                <SelectItem value="no-categories" disabled>
                  <div className="text-gray-500 text-sm">
                    No categories available
                  </div>
                </SelectItem>
              ) : (
                <>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.name || category._id}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.count} items)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateCategory}>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for organizing your products
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-category-name">Category Name *</Label>
                  <Input
                    id="create-category-name"
                    value={createFormData.name}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter category name"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-category-description">
                    Description
                  </Label>
                  <Textarea
                    id="create-category-description"
                    value={createFormData.description}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter category description (optional)"
                    disabled={creating}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {value && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
          <div className="font-medium">{value}</div>
          {categories.find((c) => c._id === value)?.description && (
            <div className="text-xs">
              {categories.find((c) => c._id === value)?.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
