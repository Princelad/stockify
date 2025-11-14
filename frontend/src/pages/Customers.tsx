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
  CreditCard,
  TrendingUp,
  Loader2,
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
import { apiService, type Customer as ApiCustomer } from "@/lib/api";
import { exportToCSV, exportToPDF } from "@/lib/utils/exportUtils";
import { useToast } from "@/hooks/useToast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  totalAmount: number;
  lastPurchase: string;
  status: "active" | "inactive";
  type: "retail" | "wholesale";
  creditLimit: number;
  outstandingAmount: number;
}

// Function to map API customer to our frontend customer interface
const mapApiCustomerToCustomer = (apiCustomer: ApiCustomer): Customer => {
  const totalAmount = apiCustomer.purchaseHistory.reduce(
    (sum, purchase) => sum + (purchase.amount || 0),
    0
  );
  const lastPurchase =
    apiCustomer.purchaseHistory.length > 0
      ? new Date(
          Math.max(
            ...apiCustomer.purchaseHistory.map((p) =>
              new Date(p.date).getTime()
            )
          )
        )
          .toISOString()
          .split("T")[0]
      : new Date().toISOString().split("T")[0];

  return {
    id: apiCustomer._id,
    name: apiCustomer.name,
    email: apiCustomer.email || "",
    phone: apiCustomer.phone || "",
    address: apiCustomer.address || "",
    totalPurchases: apiCustomer.purchaseHistory.length,
    totalAmount,
    lastPurchase,
    status: "active",
    type: apiCustomer.isDealer ? "wholesale" : "retail",
    creditLimit: 50000, // Default credit limit - this should come from API
    outstandingAmount: apiCustomer.totalDue || 0,
  };
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "retail" | "wholesale">(
    "all"
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "retail" as "retail" | "wholesale",
    creditLimit: 10000,
  });

  const { toast } = useToast();

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCustomers({
        search: searchTerm || undefined,
        limit: 100, // Get all customers for now
      });

      if (response.success && response.data) {
        const mappedCustomers = response.data.customers.map(
          mapApiCustomerToCustomer
        );
        setCustomers(mappedCustomers);
      } else {
        setError("Failed to fetch customers");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount and when search term changes
  useEffect(() => {
    fetchCustomers();
  }, []); // Only fetch on mount

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm) {
      fetchCustomers();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesType = filterType === "all" || customer.type === filterType;
    return matchesSearch && matchesType;
  });

  // Export function
  const handleExport = async (format: "csv" | "pdf") => {
    if (filteredCustomers.length === 0) {
      toast({
        title: "No Data",
        description: "No customers available to export",
        type: "warning",
      });
      return;
    }

    const exportData = filteredCustomers.map((customer: Customer) => ({
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone,
      Address: customer.address,
      Type: customer.type,
      "Total Purchases": customer.totalPurchases,
      "Total Amount": `$${customer.totalAmount.toFixed(2)}`,
      "Outstanding Amount": `$${customer.outstandingAmount.toFixed(2)}`,
      "Credit Limit": `$${customer.creditLimit.toFixed(2)}`,
      "Last Purchase": customer.lastPurchase,
      Status: customer.status,
    }));

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Address",
      "Type",
      "Total Purchases",
      "Total Amount",
      "Outstanding Amount",
      "Credit Limit",
      "Last Purchase",
      "Status",
    ];

    try {
      if (format === "csv") {
        exportToCSV({ filename: "customers", data: exportData, headers });
        toast({
          title: "Export Successful",
          description: "Customer data exported to Excel successfully",
          type: "success",
        });
      } else {
        exportToPDF({
          filename: "customers-report",
          data: exportData,
          headers,
        });
        toast({
          title: "Export Successful",
          description: "Customer data exported to PDF successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export customer data. Please try again.",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (editingCustomer) {
        const response = await apiService.updateCustomer(editingCustomer.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          isDealer: formData.type === "wholesale",
        });

        if (response.success) {
          // Refresh customers list
          await fetchCustomers();
        } else {
          setError("Failed to update customer");
          return;
        }
      } else {
        const response = await apiService.createCustomer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          isDealer: formData.type === "wholesale",
        });

        if (response.success) {
          // Refresh customers list
          await fetchCustomers();
        } else {
          setError("Failed to create customer");
          return;
        }
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        type: "retail",
        creditLimit: 10000,
      });
      setIsAddDialogOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error("Error saving customer:", err);
      setError("Failed to save customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      creditLimit: customer.creditLimit,
    });
    setError(null); // Clear any previous errors
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        setLoading(true);
        const response = await apiService.deleteCustomer(customerId);

        if (response.success) {
          // Refresh customers list
          await fetchCustomers();
        } else {
          setError("Failed to delete customer");
        }
      } catch (err) {
        console.error("Error deleting customer:", err);
        setError("Failed to delete customer. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const stats = {
    total: customers.length,
    retail: customers.filter((c) => c.type === "retail").length,
    wholesale: customers.filter((c) => c.type === "wholesale").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalAmount, 0),
    totalOutstanding: customers.reduce(
      (sum, c) => sum + c.outstandingAmount,
      0
    ),
  };

  return (
    <InventoryLayout activeSection="Customers">
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Customers
              </h1>
              <p className="text-gray-600 mt-1">
                Manage customer relationships and track purchase history
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
                      setEditingCustomer(null);
                      setError(null);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        type: "retail",
                        creditLimit: 10000,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCustomer ? "Edit Customer" : "Add New Customer"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCustomer
                          ? "Update customer information"
                          : "Create a new customer profile"}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Error Display in Dialog */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Customer Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
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
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Customer Type</Label>
                          <select
                            id="type"
                            value={formData.type}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                type: e.target.value as "retail" | "wholesale",
                              }))
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="retail">Retail</option>
                            <option value="wholesale">Wholesale</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                          <Input
                            id="creditLimit"
                            type="number"
                            value={formData.creditLimit}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                creditLimit: parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="Credit limit"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingCustomer ? "Updating..." : "Creating..."}
                          </>
                        ) : editingCustomer ? (
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retail</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.retail}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Retail</Badge>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wholesale</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.wholesale}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Wholesale</Badge>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-lg font-bold text-red-600">
                  ₹{stats.totalOutstanding.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "retail" | "wholesale")
              }
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Customers</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer List</h3>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    fetchCustomers();
                  }}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && customers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading customers...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">
                            {customer.name}
                          </h4>
                          <Badge
                            className={
                              customer.type === "wholesale"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {customer.type}
                          </Badge>
                          <Badge
                            className={
                              customer.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {customer.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {customer.address}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Total Purchases
                            </p>
                            <p className="font-semibold">
                              {customer.totalPurchases}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Total Amount
                            </p>
                            <p className="font-semibold text-green-600">
                              ₹{customer.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Credit Limit
                            </p>
                            <p className="font-semibold">
                              ₹{customer.creditLimit.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Outstanding</p>
                            <p
                              className={`font-semibold ${
                                customer.outstandingAmount > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ₹{customer.outstandingAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Customers Found State */}
            {!loading && filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No customers found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "No customers match your search."
                    : "Get started by adding your first customer."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}
