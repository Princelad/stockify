import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  Building2,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { apiService } from "@/lib/api";
import type { ExtendedSupplier } from "@/types/product";
import { exportToCSV, exportToPDF } from "@/lib/utils/exportUtils";

// Form data interface for creating/editing suppliers
interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  category: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<ExtendedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<ExtendedSupplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    paymentTerms: "30 days",
    category: "Electronics",
  });

  const { toast } = useToast();

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Books",
    "Beauty",
  ];

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers();

      if (response.success && response.data && "suppliers" in response.data) {
        setSuppliers(response.data.suppliers as ExtendedSupplier[]); // API returns { data: { suppliers: [], pagination: {} } }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch suppliers",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email &&
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.contactPerson &&
        supplier.contactPerson
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || supplier.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Export function
  const handleExport = async (format: "csv" | "pdf") => {
    if (filteredSuppliers.length === 0) {
      toast({
        title: "No Data",
        description: "No suppliers available to export",
        type: "warning",
      });
      return;
    }

    const exportData = filteredSuppliers.map((supplier: ExtendedSupplier) => ({
      Name: supplier.name,
      "Contact Person": supplier.contactPerson || "",
      Email: supplier.email || "",
      Phone: supplier.phone || "",
      Address: supplier.address || "",
      Category: supplier.category || "",
      "Payment Terms": supplier.paymentTerms || "",
      "Total Products": supplier.productCount || 0,
      "Total Value": `$${(supplier.totalValue || 0).toFixed(2)}`,
      Status: "Active", // Default status since not in ExtendedSupplier type
    }));

    const headers = [
      "Name",
      "Contact Person",
      "Email",
      "Phone",
      "Address",
      "Category",
      "Payment Terms",
      "Total Products",
      "Total Value",
      "Status",
    ];

    try {
      if (format === "csv") {
        exportToCSV({ filename: "suppliers", data: exportData, headers });
        toast({
          title: "Export Successful",
          description: "Supplier data exported to Excel successfully",
          type: "success",
        });
      } else {
        exportToPDF({
          filename: "suppliers-report",
          data: exportData,
          headers,
        });
        toast({
          title: "Export Successful",
          description: "Supplier data exported to PDF successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export supplier data. Please try again.",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      if (editingSupplier) {
        // Update existing supplier
        const response = await apiService.updateSupplier(
          editingSupplier._id,
          formData
        );

        if (response.success && response.data) {
          setSuppliers((prev) =>
            prev.map((supplier) =>
              supplier._id === editingSupplier._id
                ? (response.data as ExtendedSupplier)
                : supplier
            )
          );

          toast({
            title: "Success",
            description: "Supplier updated successfully",
            type: "success",
          });
        } else {
          throw new Error(response.message || "Failed to update supplier");
        }
      } else {
        // Create new supplier
        const response = await apiService.createSupplier(formData);

        if (response.success && response.data) {
          setSuppliers((prev) => [response.data as ExtendedSupplier, ...prev]);

          toast({
            title: "Success",
            description: "Supplier created successfully",
            type: "success",
          });
        } else {
          throw new Error(response.message || "Failed to create supplier");
        }
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        paymentTerms: "30 days",
        category: "Electronics",
      });
      setIsAddDialogOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save supplier. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier: ExtendedSupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
      paymentTerms: supplier.paymentTerms || "30 days",
      category: supplier.category || "Electronics",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (supplierId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this supplier? This action cannot be undone."
      )
    ) {
      try {
        const response = await apiService.deleteSupplier(supplierId);

        if (response.success) {
          setSuppliers((prev) =>
            prev.filter((supplier) => supplier._id !== supplierId)
          );

          toast({
            title: "Success",
            description: "Supplier deleted successfully",
            type: "success",
          });
        } else {
          throw new Error(response.message || "Failed to delete supplier");
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete supplier. Please try again.",
          type: "error",
        });
      }
    }
  };

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === "active").length,
    totalProducts: suppliers.reduce((sum, s) => sum + s.productCount, 0),
    totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0),
  };

  if (loading) {
    return (
      <InventoryLayout activeSection="Suppliers">
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading suppliers...</p>
              </div>
            </div>
          </div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout activeSection="Suppliers">
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Suppliers Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage supplier relationships and procurement data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingSupplier(null);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        contactPerson: "",
                        paymentTerms: "30 days",
                        category: "Electronics",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSupplier
                          ? "Update supplier information"
                          : "Create a new supplier profile for your inventory"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter company name"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactPerson: e.target.value,
                            }))
                          }
                          placeholder="Enter contact person name"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Enter email address"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Enter phone number"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter address"
                          disabled={submitting}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentTerms">Payment Terms</Label>
                          <select
                            id="paymentTerms"
                            value={formData.paymentTerms}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentTerms: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                          >
                            <option value="15 days">15 days</option>
                            <option value="30 days">30 days</option>
                            <option value="45 days">45 days</option>
                            <option value="60 days">60 days</option>
                            <option value="Cash on delivery">
                              Cash on delivery
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingSupplier ? "Updating..." : "Creating..."}
                          </>
                        ) : editingSupplier ? (
                          "Update"
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {((stats.active / stats.total) * 100 || 0).toFixed(0)}%
              </Badge>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{stats.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search suppliers by name, email, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg min-w-[160px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Button
              onClick={fetchSuppliers}
              variant="outline"
              size="sm"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Supplier Directory</h3>
              <p className="text-sm text-gray-500">
                {filteredSuppliers.length} of {suppliers.length} suppliers
              </p>
            </div>

            {filteredSuppliers.length > 0 ? (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {supplier.name}
                          </h4>
                          {supplier.category && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {supplier.category}
                            </Badge>
                          )}
                          {supplier.status && (
                            <Badge
                              className={
                                supplier.status === "active"
                                  ? "bg-green-100 text-green-800 text-xs"
                                  : "bg-gray-100 text-gray-800 text-xs"
                              }
                            >
                              {supplier.status}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          {supplier.contactPerson && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                {supplier.contactPerson}
                              </span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{supplier.email}</span>
                            </div>
                          )}
                        </div>

                        {supplier.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{supplier.address}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Products</p>
                            <p className="font-semibold text-gray-900">
                              {supplier.productCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Value</p>
                            <p className="font-semibold text-green-600">
                              ₹{supplier.totalValue.toLocaleString("en-IN")}
                            </p>
                          </div>
                          {supplier.paymentTerms && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Payment Terms
                              </p>
                              <p className="font-semibold text-gray-900">
                                {supplier.paymentTerms}
                              </p>
                            </div>
                          )}
                          {supplier.lastOrder && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Last Order
                              </p>
                              <p className="font-semibold text-gray-900">
                                {new Date(
                                  supplier.lastOrder
                                ).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit supplier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(supplier._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete supplier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm || filterCategory !== "all" ? (
                  <div>
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No suppliers found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      No suppliers match your search criteria. Try adjusting
                      your filters or search terms.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterCategory("all");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No suppliers yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Get started by adding your first supplier to manage your
                      inventory relationships.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Supplier
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}
