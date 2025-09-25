import { useEffect, useState } from "react";
import { Search, Plus, Download, Upload } from "lucide-react";
import { apiService } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuickAddProduct } from "@/components/product";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  supplier: {
    name: string;
  };
  isActive: boolean;
}

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: 1,
        limit: 10,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (activeTab === "low-stock") {
        filters.lowStock = true;
      } else if (activeTab === "out-of-stock") {
        filters.outOfStock = true;
      }

      const response = await apiService.getProducts(filters);
      if (response.success && response.data) {
        // Handle both array and object responses
        const data = response.data as any;
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (product: Product) => {
    const stock = product.currentStock || 0;
    const minLevel = product.minStockLevel || 0;

    if (stock === 0) {
      return (
        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
          Critical
        </span>
      );
    } else if (stock <= minLevel) {
      return (
        <span className="inline-block px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
          In Stock
        </span>
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAddProductSuccess = () => {
    setIsAddProductOpen(false);
    fetchProducts(); // Refresh the product list
  };

  const handleAddProductCancel = () => {
    setIsAddProductOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="font-semibold text-lg">Products</h3>
          <p className="text-sm text-gray-500">Manage your inventory items</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
          <button className="px-4 py-2 rounded border font-semibold hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 rounded border font-semibold hover:bg-gray-50 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === "all"
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveTab("low-stock")}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === "low-stock"
                ? "bg-orange-50 text-orange-700"
                : "hover:bg-gray-100"
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setActiveTab("out-of-stock")}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === "out-of-stock"
                ? "bg-red-50 text-red-700"
                : "hover:bg-gray-100"
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-left font-semibold">SKU</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(product.sellingPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        product.currentStock === 0
                          ? "text-red-600"
                          : product.currentStock <= product.minStockLevel
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(product)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.supplier?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {products.length} products
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border font-semibold hover:bg-gray-50">
              1
            </button>
            <button className="px-3 py-1 rounded border font-semibold hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 rounded border font-semibold hover:bg-gray-50">
              3
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <QuickAddProduct
            onSuccess={handleAddProductSuccess}
            onCancel={handleAddProductCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
