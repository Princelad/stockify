import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import { useToast } from "@/hooks/useToast";
import { exportToCSV, exportToPDF } from "@/lib/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/lib/api";
import type { Category } from "@/types/product";
import {
  Plus,
  Tag,
  Search,
  Edit,
  Trash2,
  Sparkles,
  User,
  Package,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

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
        const {
          categories: allCategories,
          popular,
          userCreated,
          fromProducts,
        } = response.data;

        setCategories(allCategories || []);
        setPopularCategories(popular || []);
        setUserCategories(userCreated || []);
        setProductCategories(fromProducts || []);
      } else {
        setError("Failed to load categories");
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      let response;
      if (editingCategory) {
        // Update existing category
        response = await apiService.updateCategory(editingCategory._id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      } else {
        // Create new category
        response = await apiService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
      }

      if (response.success) {
        // Refresh categories list
        await fetchCategories();

        // Reset form and close dialog
        setFormData({ name: "", description: "" });
        setIsAddDialogOpen(false);
        setEditingCategory(null);
      } else {
        setError(
          response.message ||
            `Failed to ${editingCategory ? "update" : "create"} category`
        );
      }
    } catch (err) {
      console.error(
        `Error ${editingCategory ? "updating" : "creating"} category:`,
        err
      );
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingCategory ? "update" : "create"} category`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    if (category.type === "user_created") {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
      setIsAddDialogOpen(true);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.type !== "user_created") {
      toast({
        title: "Cannot Delete Category",
        description: "Only user-created categories can be deleted.",
        type: "error",
      });
      return;
    }

    if (category.count > 0) {
      toast({
        title: "Cannot Delete Category",
        description: `Cannot delete category "${category.name}". It is being used by ${category.count} product(s).`,
        type: "error",
      });
      return;
    }

    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setError(null);
      const response = await apiService.deleteCategory(categoryToDelete._id);

      if (response.success) {
        // Refresh categories list
        await fetchCategories();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        setError(response.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const getCategoryIcon = (category: Category) => {
    if (category.isPopular)
      return <Sparkles className="h-4 w-4 text-yellow-500" />;
    if (category.type === "user_created")
      return <User className="h-4 w-4 text-blue-500" />;
    if (category.type === "from_products")
      return <Package className="h-4 w-4 text-green-500" />;
    return <Tag className="h-4 w-4 text-gray-500" />;
  };

  const getCategoryBadgeVariant = (category: Category) => {
    if (category.isPopular) return "default";
    if (category.type === "user_created") return "secondary";
    return "outline";
  };

  const getCategoryTypeLabel = (category: Category) => {
    if (category.isPopular) return "Popular";
    if (category.type === "user_created") return "User Created";
    if (category.type === "from_products") return "From Products";
    return "System";
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add utility functions for enhanced functionality
  const handleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map((cat) => cat._id)));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const handleExport = async (format: "csv" | "pdf") => {
    toast({
      title: "Export Started",
      description: `Exporting Categories as ${format.toUpperCase()}...`,
      type: "info",
    });

    try {
      // Prepare data for export
      const exportData = filteredCategories.map((cat) => ({
        Name: cat.name,
        Description: cat.description || "",
        Type: getCategoryTypeLabel(cat),
        "Product Count": cat.count.toString(),
        "Is Popular": cat.isPopular ? "Yes" : "No",
      }));

      const headers = [
        "Name",
        "Description",
        "Type",
        "Product Count",
        "Is Popular",
      ];

      let result;
      if (format === "csv") {
        result = exportToCSV({
          filename: `categories-${new Date().toISOString().split("T")[0]}`,
          data: exportData,
          headers,
        });
      } else {
        result = await exportToPDF({
          filename: `Categories Report - ${new Date().toLocaleDateString()}`,
          data: exportData,
          headers,
        });
      }

      if (result.success) {
        toast({
          title: "Export Complete",
          description: result.message,
          type: "success",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export categories. Please try again.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <InventoryLayout activeSection="Inventory">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout activeSection="Inventory">
      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto ml-2"
                onClick={fetchCategories}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-6 w-6 text-blue-600" />
                Categories Management
              </h2>
              <p className="text-gray-600 mt-1">
                Organize your products with categories. {categories.length}{" "}
                total categories.
                <br />
                <span className="text-sm text-yellow-600 font-medium">
                  Popular categories are automatically determined based on
                  product usage.
                </span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={fetchCategories}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({ name: "", description: "" });
                      setError(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateCategory}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory
                          ? "Edit Category"
                          : "Create New Category"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory
                          ? "Update category information"
                          : "Create a custom category for your products"}
                      </DialogDescription>
                    </DialogHeader>

                    {error && (
                      <Alert variant="destructive" className="my-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter category name"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter category description"
                          rows={3}
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setError(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!formData.name.trim() || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingCategory ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{editingCategory ? "Update" : "Create"}</>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search categories by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Bulk Actions Row */}
              {selectedCategories.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                      {selectedCategories.size === filteredCategories.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="text-sm font-medium text-blue-700">
                      {selectedCategories.size} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategories(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Categories
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                All category types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Popular Categories
              </CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {popularCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Dynamic based on usage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Categories
              </CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCategories.length}</div>
              <p className="text-xs text-muted-foreground">Custom created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                From Products
              </CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Derived from products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Insights */}
        {categories.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Category Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Most Used Category</p>
                  <p className="font-semibold text-lg">
                    {categories.reduce(
                      (max, cat) => (cat.count > max.count ? cat : max),
                      categories[0]
                    )?.name || "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Average Products per Category
                  </p>
                  <p className="font-semibold text-lg">
                    {categories.length > 0
                      ? Math.round(
                          categories.reduce((sum, cat) => sum + cat.count, 0) /
                            categories.length
                        )
                      : 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Popular Categories</p>
                  <p className="font-semibold text-lg text-yellow-600">
                    {categories.filter((cat) => cat.isPopular).length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on product count
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category._id}
                className={`hover:shadow-md transition-all ${
                  selectedCategories.has(category._id)
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectCategory(category._id)}
                        className="h-6 w-6 p-0"
                      >
                        {selectedCategories.has(category._id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <Badge
                          variant={getCategoryBadgeVariant(category)}
                          className="text-xs"
                        >
                          {getCategoryTypeLabel(category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {category.type === "user_created" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {category.count}
                      </p>
                      <p className="text-xs text-gray-500">Products</p>
                    </div>
                    {category.isPopular && (
                      <div className="flex items-center text-yellow-600">
                        <Sparkles className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Popular</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No matching categories" : "No categories found"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No categories match "${searchTerm}". Try a different search term.`
                  : "Get started by creating your first custom category."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    setIsAddDialogOpen(true);
                    setError(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InventoryLayout>
  );
}
