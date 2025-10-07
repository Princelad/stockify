import { useEffect, useState, useCallback } from "react";
import { InventoryLayout } from "@/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/lib/api";
import { AddProductForm } from "@/components/forms";
import type {
  Product,
  ProductFilters,
  Category,
  Supplier,
} from "@/types/product";
import {
  Package,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Cleanup function for debounce timer
  const cleanupDebounceTimer = () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      setSearchDebounceTimer(null);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, categoriesResponse, suppliersResponse] =
          await Promise.all([
            apiService.getProducts(filters),
            apiService.getCategories(),
            apiService.getSuppliers(),
          ]);

        // Handle products response with pagination
        if (productsResponse.success && productsResponse.data) {
          const { products: productData, pagination: paginationData } =
            productsResponse.data;
          if (Array.isArray(productData)) {
            setProducts(productData);
          } else {
            console.warn("Products data is not an array:", productData);
            setProducts([]);
          }

          // Update pagination state
          if (paginationData) {
            setPagination(paginationData);
          }
        } else {
          console.warn("Products response unsuccessful:", productsResponse);
          setProducts([]);
        }

        // Handle categories response
        if (categoriesResponse.success && categoriesResponse.data) {
          const { categories: categoryData } = categoriesResponse.data;
          if (Array.isArray(categoryData)) {
            setCategories(categoryData);
          } else {
            console.warn("Categories data is not an array:", categoryData);
            setCategories([]);
          }
        } else {
          console.warn("Categories response unsuccessful:", categoriesResponse);
          setCategories([]);
        }

        // Handle suppliers response
        if (
          suppliersResponse.success &&
          Array.isArray(suppliersResponse.data)
        ) {
          setSuppliers(suppliersResponse.data);
        } else {
          console.warn("Suppliers response unsuccessful:", suppliersResponse);
          setSuppliers([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        // Set default empty arrays to prevent map errors
        setProducts([]);
        setCategories([]);
        setSuppliers([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [filters]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    // Clear existing search debounce timer
    cleanupDebounceTimer();

    // For search, use debouncing to avoid too many API calls
    if (key === "search") {
      const timer = setTimeout(() => {
        setFilters((prev) => ({
          ...prev,
          [key]: value,
          page: 1, // Reset to page 1 when searching
        }));
      }, 500); // 500ms delay
      setSearchDebounceTimer(timer);
    } else {
      // For other filters, update immediately
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key !== "page" ? 1 : value, // Reset to page 1 when changing other filters
      }));
    }
  };

  const clearFilters = () => {
    cleanupDebounceTimer();
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return cleanupDebounceTimer;
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productsResponse = await apiService.getProducts(filters);

      if (productsResponse.success && productsResponse.data) {
        const { products: productData, pagination: paginationData } =
          productsResponse.data;
        if (Array.isArray(productData)) {
          setProducts(productData);
        } else {
          console.warn("Refresh: Products data is not an array:", productData);
          setProducts([]);
        }

        if (paginationData) {
          setPagination(paginationData);
        }
      } else {
        console.warn(
          "Refresh: Products response unsuccessful:",
          productsResponse
        );
        setProducts([]);
      }
    } catch (err) {
      console.error("Error refreshing products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh products"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0)
      return { status: "Out of Stock", variant: "danger" as const };
    if (product.currentStock <= product.minStockLevel)
      return { status: "Low Stock", variant: "warning" as const };
    return { status: "In Stock", variant: "success" as const };
  };

  const getSupplierName = (supplier: Product["supplier"]) => {
    if (!supplier) return "N/A";
    return typeof supplier === "string" ? supplier : supplier.name || "N/A";
  };

  const getSupplierContact = (supplier: Product["supplier"]) => {
    if (!supplier || typeof supplier === "string") return "";
    return supplier.contact || "";
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + N for new product
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault();
        setShowAddProduct(true);
      }

      // Ctrl/Cmd + R for refresh
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        refreshProducts();
      }

      // Escape to close modals
      if (event.key === "Escape") {
        setShowAddProduct(false);
        setSelectedProduct(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [refreshProducts]);

  if (loading && products.length === 0) {
    return (
      <InventoryLayout activeSection="Products">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout activeSection="Products">
      <div className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Product Inventory
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your product catalog and inventory levels
              </p>
              {/* Active filters indicator */}
              {(filters.search ||
                filters.category ||
                filters.supplier ||
                filters.lowStock ||
                filters.outOfStock) && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{filters.search}"
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge variant="secondary" className="text-xs">
                      Category: {filters.category}
                    </Badge>
                  )}
                  {filters.supplier && (
                    <Badge variant="secondary" className="text-xs">
                      Supplier: {filters.supplier}
                    </Badge>
                  )}
                  {filters.lowStock && (
                    <Badge variant="warning" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                  {filters.outOfStock && (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-sm text-gray-500">
                <div>Press Ctrl+K to search</div>
                <div>Press Ctrl+N to add product</div>
              </div>
              <Button
                onClick={() => setShowAddProduct(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products, SKU, category..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => handleFilterChange("search", "")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <Select
                value={filters.category || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "category",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>

                  {/* Popular Categories */}
                  {categories.filter((cat) => cat.isPopular).length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                        ⭐ Popular
                      </div>
                      {categories
                        .filter((cat) => cat.isPopular)
                        .map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {category.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </>
                  )}

                  {/* User Created Categories */}
                  {categories.filter((cat) => cat.type === "user_created")
                    .length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                        👤 Your Categories
                      </div>
                      {categories
                        .filter((cat) => cat.type === "user_created")
                        .map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {category.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </>
                  )}

                  {/* Categories from Products */}
                  {categories.filter((cat) => cat.type === "from_products")
                    .length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                        📦 From Products
                      </div>
                      {categories
                        .filter((cat) => cat.type === "from_products")
                        .map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {category.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </>
                  )}

                  {/* Other Categories */}
                  {categories.filter(
                    (cat) =>
                      !cat.isPopular &&
                      cat.type !== "user_created" &&
                      cat.type !== "from_products"
                  ).length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t">
                        📂 Other
                      </div>
                      {categories
                        .filter(
                          (cat) =>
                            !cat.isPopular &&
                            cat.type !== "user_created" &&
                            cat.type !== "from_products"
                        )
                        .map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{category.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {category.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </>
                  )}

                  {Array.isArray(categories) && categories.length === 0 && (
                    <SelectItem value="no-categories" disabled>
                      <div className="text-gray-500 text-sm">
                        No categories available
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={filters.supplier || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "supplier",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {Array.isArray(suppliers) &&
                    suppliers.map((supplier) => (
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
                  onClick={() =>
                    handleFilterChange("lowStock", !filters.lowStock)
                  }
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Low Stock {filters.lowStock && "✓"}
                </Button>
                <Button
                  variant={filters.outOfStock ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleFilterChange("outOfStock", !filters.outOfStock)
                  }
                >
                  <X className="h-4 w-4 mr-1" />
                  Out of Stock {filters.outOfStock && "✓"}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {products.length} of {pagination.totalItems} products
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in ${filters.category}`}
                {filters.supplier && ` from ${filters.supplier}`}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshProducts}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split("-");
                    setFilters((prev) => ({
                      ...prev,
                      sortBy,
                      sortOrder: sortOrder as "asc" | "desc",
                    }));
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="sellingPrice-asc">
                      Price (Low to High)
                    </SelectItem>
                    <SelectItem value="sellingPrice-desc">
                      Price (High to Low)
                    </SelectItem>
                    <SelectItem value="currentStock-asc">
                      Stock (Low to High)
                    </SelectItem>
                    <SelectItem value="currentStock-desc">
                      Stock (High to Low)
                    </SelectItem>
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
        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  Loading products...
                </span>
              </div>
            </div>
          )}
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
                    <TableHead className="font-semibold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">
                            No products found
                          </p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your filters or add your first product
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <TableRow
                          key={product._id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {product.name}
                                </div>
                                {product.description && (
                                  <div className="text-sm text-gray-500">
                                    {product.description.length > 50
                                      ? `${product.description.substring(
                                          0,
                                          50
                                        )}...`
                                      : product.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product.category || "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-medium ${
                                  product.currentStock === 0
                                    ? "text-red-600"
                                    : product.currentStock <=
                                      product.minStockLevel
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {product.currentStock}
                              </span>
                              <span className="text-sm text-gray-500">
                                / {product.minStockLevel} min
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {formatCurrency(product.sellingPrice)}
                              </div>
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
                                {getSupplierName(product.supplier)}
                              </div>
                              {getSupplierContact(product.supplier) && (
                                <div className="text-gray-500">
                                  {getSupplierContact(product.supplier)}
                                </div>
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
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowAddProduct(true);
                                }}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to delete ${product.name}?\n\nThis action cannot be undone.`
                                      )
                                    ) {
                                      // TODO: Implement actual delete functionality
                                      console.log(
                                        "Delete product:",
                                        product._id
                                      );
                                      // After successful delete, refresh the products list
                                      // await deleteProduct(product._id);
                                      // refreshProducts();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error deleting product:",
                                      error
                                    );
                                    // Show error toast/notification
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Delete Product"
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
        {pagination.totalItems > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              {Math.min(
                (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                pagination.totalItems
              )}{" "}
              -{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} products
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleFilterChange("page", pagination.currentPage - 1)
                }
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleFilterChange("page", pagination.currentPage + 1)
                }
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog
        open={showAddProduct}
        onOpenChange={(open) => {
          setShowAddProduct(open);
          if (!open) {
            setEditingProduct(null); // Clear editing state when dialog closes
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          <AddProductForm
            editProduct={editingProduct}
            onSuccess={() => {
              setShowAddProduct(false);
              setEditingProduct(null);
              // Refresh the products list instead of full page reload
              refreshProducts();
            }}
            onCancel={() => {
              setShowAddProduct(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </InventoryLayout>
  );
}

// Product Details Modal
function ProductDetailsModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0)
      return { status: "Out of Stock", variant: "danger" as const };
    if (product.currentStock <= product.minStockLevel)
      return { status: "Low Stock", variant: "warning" as const };
    return { status: "In Stock", variant: "success" as const };
  };

  const stockStatus = getStockStatus(product);

  const getSupplierName = (supplier: Product["supplier"]) => {
    if (!supplier) return "N/A";
    return typeof supplier === "string" ? supplier : supplier.name || "N/A";
  };

  const getSupplierField = (
    supplier: Product["supplier"],
    field: "contact" | "email" | "phone"
  ) => {
    if (!supplier || typeof supplier === "string") return "";
    return supplier[field] || "";
  };

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
              <label className="text-sm font-medium text-gray-500">
                Category
              </label>
              <p>{product.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Brand</label>
              <p>{product.brand || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={stockStatus.variant}>
                  {stockStatus.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="mt-1">{product.description}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Pricing Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Cost Price
                </label>
                <p className="text-lg font-semibold">
                  {formatCurrency(product.costPrice)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Selling Price
                </label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(product.sellingPrice)}
                </p>
              </div>
              {product.wholesalePrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Wholesale Price
                  </label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(product.wholesalePrice)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Profit Margin
                </label>
                <p className="text-lg font-semibold text-blue-600">
                  {product.costPrice > 0
                    ? (
                        ((product.sellingPrice - product.costPrice) /
                          product.costPrice) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Stock Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Current Stock
                </label>
                <p
                  className={`text-2xl font-bold ${
                    product.currentStock === 0
                      ? "text-red-600"
                      : product.currentStock <= product.minStockLevel
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {product.currentStock}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Minimum Level
                </label>
                <p className="text-xl font-semibold">{product.minStockLevel}</p>
              </div>
              {product.maxStockLevel && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Maximum Level
                  </label>
                  <p className="text-xl font-semibold">
                    {product.maxStockLevel}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="font-medium">
                  {getSupplierName(product.supplier)}
                </p>
              </div>
              {getSupplierField(product.supplier, "contact") && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Contact Person
                  </label>
                  <p>{getSupplierField(product.supplier, "contact")}</p>
                </div>
              )}
              {getSupplierField(product.supplier, "email") && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p>{getSupplierField(product.supplier, "email")}</p>
                </div>
              )}
              {getSupplierField(product.supplier, "phone") && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p>{getSupplierField(product.supplier, "phone")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <div className="flex justify-between">
              <span>
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(product.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
