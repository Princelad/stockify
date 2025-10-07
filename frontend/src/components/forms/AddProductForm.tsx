import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { CreateProductRequest, Supplier } from "@/types/product";
import SupplierSelect from "@/components/common/SupplierSelect";
import CategorySelect from "@/components/common/CategorySelect";
import PDFBulkImport from "@/components/inventory/PDFBulkImport";
import APITestComponent from "@/components/debug/APITestComponent";
import {
  Package,
  DollarSign,
  Hash,
  AlertTriangle,
  Save,
  RefreshCw,
  FileText,
  Upload,
  CheckCircle,
  Bug,
} from "lucide-react";

interface AddProductFormProps {
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
  editProduct?: any; // Product to edit (null/undefined for add mode)
}

export default function AddProductForm({
  onSuccess,
  onCancel,
  editProduct,
}: AddProductFormProps) {
  const { toast } = useToast();

  // PDF Import Modal State
  const [isPDFImportOpen, setIsPDFImportOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    barcode: "",
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    currentStock: 0,
    minStockLevel: 10,
    maxStockLevel: 1000,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
  });

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profitMargin, setProfitMargin] = useState(0);

  // PDF Upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  // Add states for suggestions
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

  // Effect to populate form when editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || "",
        description: editProduct.description || "",
        category: editProduct.category || "",
        brand: editProduct.brand || "",
        sku: editProduct.sku || "",
        barcode: editProduct.barcode || "",
        costPrice: editProduct.costPrice || 0,
        sellingPrice: editProduct.sellingPrice || 0,
        wholesalePrice: editProduct.wholesalePrice || 0,
        currentStock: editProduct.currentStock || 0,
        minStockLevel: editProduct.minStockLevel || 10,
        maxStockLevel: editProduct.maxStockLevel || 1000,
        weight: editProduct.weight || 0,
        dimensions: editProduct.dimensions || {
          length: 0,
          width: 0,
          height: 0,
        },
      });

      // Set supplier if exists
      if (editProduct.supplier) {
        setSelectedSupplier(editProduct.supplier);
      }
    }
  }, [editProduct]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [skuSuggestions, setSkuSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<{
    name: boolean;
    brand: boolean;
    sku: boolean;
  }>({
    name: false,
    brand: false,
    sku: false,
  });

  // Refs for suggestion dropdowns
  const nameInputRef = useRef<HTMLDivElement>(null);
  const brandInputRef = useRef<HTMLDivElement>(null);
  const skuInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicking outside of suggestion dropdowns
    function handleClickOutside(event: MouseEvent) {
      if (
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions((prev) => ({ ...prev, name: false }));
      }
      if (
        brandInputRef.current &&
        !brandInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions((prev) => ({ ...prev, brand: false }));
      }
      if (
        skuInputRef.current &&
        !skuInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions((prev) => ({ ...prev, sku: false }));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchProductSuggestions();
  }, []);

  useEffect(() => {
    // Calculate profit margin when prices change
    if (formData.costPrice > 0 && formData.sellingPrice > 0) {
      const margin =
        ((formData.sellingPrice - formData.costPrice) / formData.costPrice) *
        100;
      setProfitMargin(Math.round(margin * 100) / 100);
    } else {
      setProfitMargin(0);
    }
  }, [formData.costPrice, formData.sellingPrice]);

  const fetchProductSuggestions = async () => {
    try {
      const response = await apiService.getProducts({ limit: 20 });
      if (response.success && response.data) {
        const productsArray = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];

        const names = [...new Set(productsArray.map((p: any) => p.name))];
        const brands = [
          ...new Set(productsArray.map((p: any) => p.brand).filter(Boolean)),
        ];
        const skus = [...new Set(productsArray.map((p: any) => p.sku))];

        setNameSuggestions(names as string[]);
        setBrandSuggestions(brands as string[]);
        setSkuSuggestions(skus as string[]);
      }
    } catch (error) {
      console.error("Error fetching product suggestions:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Show relevant suggestions based on input
    if (field === "name") {
      setShowSuggestions((prev) => ({ ...prev, name: true }));
    } else if (field === "brand") {
      setShowSuggestions((prev) => ({ ...prev, brand: true }));
    } else if (field === "sku") {
      setShowSuggestions((prev) => ({ ...prev, sku: true }));
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData((prev) => ({
      ...prev,
      supplierId: supplier._id,
      // Also set the old format for backward compatibility
      supplier: {
        name: supplier.name,
        contact: supplier.phone,
        email: supplier.email,
        address: supplier.address || "",
      },
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const generateSKU = () => {
    const categoryCode = formData.category.substring(0, 3).toUpperCase();
    const brandCode = formData.brand
      ? formData.brand.substring(0, 3).toUpperCase()
      : "GEN";
    const timestamp = Date.now().toString().slice(-4);
    const sku = `${categoryCode}${brandCode}${timestamp}`;
    handleInputChange("sku", sku);
  };

  const handleSuggestionSelect = (field: string, value: string) => {
    handleInputChange(field, value);
    setShowSuggestions((prev) => ({ ...prev, [field]: false }));
  };

  // PDF Import Success Handler
  const handlePDFImportSuccess = () => {
    setIsPDFImportOpen(false);
    toast({
      type: "success",
      title: "PDF Import Completed!",
      description: "Products have been imported successfully.",
      duration: 5000,
    });
    // Refresh the form or redirect as needed
    if (onSuccess) {
      onSuccess({});
    }
  };

  // Handle PDF file upload and processing
  const handlePDFUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast({
        type: "error",
        title: "Invalid File",
        description: "Please select a PDF file.",
        duration: 3000,
      });
      return;
    }

    setPdfFile(file);
    setIsProcessingPDF(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("pdfFile", file);
      formData.append("supplierName", "PDF Import");
      formData.append("defaultCategory", "Imported");

      const response = await fetch("/api/products/pdf-import/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data?.sampleProducts?.length > 0) {
        const firstProduct = result.data.sampleProducts[0];

        // Pre-fill form with first product data
        setFormData((prev) => ({
          ...prev,
          name: firstProduct.name,
          description: firstProduct.description || "",
          brand: firstProduct.brand || "",
          costPrice: firstProduct.costPrice || 0,
          sellingPrice: firstProduct.sellingPrice || 0,
          currentStock: firstProduct.currentStock || 0,
          category: firstProduct.category || "Imported",
        }));

        toast({
          type: "success",
          title: "PDF Processed Successfully!",
          description: `Found ${result.data.sampleProducts.length} products. Form filled with first product.`,
          duration: 5000,
        });
      } else {
        throw new Error(
          result.message || "Failed to extract products from PDF"
        );
      }
    } catch (error) {
      console.error("PDF processing error:", error);
      toast({
        type: "error",
        title: "PDF Processing Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process PDF file.",
        duration: 5000,
      });
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const filterSuggestions = (suggestions: string[], input: string) => {
    if (!input) return suggestions;
    const lowerInput = input.toLowerCase();
    return suggestions
      .filter((item) => item.toLowerCase().includes(lowerInput))
      .slice(0, 5); // Limit to 5 suggestions
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name || !formData.category || !formData.sku) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.sellingPrice <= formData.costPrice) {
        throw new Error("Selling price must be higher than cost price");
      }

      // Clean the form data before submission
      const cleanedFormData = { ...formData };

      // Remove empty supplierId to prevent MongoDB ObjectId cast errors
      if (!cleanedFormData.supplierId || cleanedFormData.supplierId === "") {
        delete cleanedFormData.supplierId;
        // Also remove the supplier object if no supplierId
        delete cleanedFormData.supplier;
      }

      // Debug logging
      console.log("Form data being submitted:", cleanedFormData);

      let response;
      if (editProduct) {
        // Update existing product
        response = await apiService.updateProduct(
          editProduct._id,
          cleanedFormData
        );
      } else {
        // Create new product
        response = await apiService.createProduct(cleanedFormData);
      }
      console.log("API response:", response);

      if (response.success) {
        // Show success toast
        toast({
          type: "success",
          title: editProduct
            ? "Product Updated Successfully!"
            : "Product Created Successfully!",
          description: `${formData.name} has been ${
            editProduct ? "updated" : "added to your inventory"
          }.`,
          duration: 5000,
        });

        if (onSuccess) {
          onSuccess(response.data);
        }

        // Reset form
        setFormData({
          name: "",
          description: "",
          category: "",
          brand: "",
          sku: "",
          barcode: "",
          costPrice: 0,
          sellingPrice: 0,
          wholesalePrice: 0,
          currentStock: 0,
          minStockLevel: 10,
          maxStockLevel: 1000,
          weight: 0,
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
          },
        });
        setSelectedSupplier(null);
      } else {
        console.error("API Error:", response);
        throw new Error(
          response.message ||
            `Failed to ${editProduct ? "update" : "create"} product`
        );
      }
    } catch (error) {
      console.error("Submit Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${editProduct ? "update" : "create"} product`;
      setError(errorMessage);

      // Show error toast
      toast({
        type: "error",
        title: `Failed to ${editProduct ? "Update" : "Create"} Product`,
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-gray-600">
          Fill in the product details to add it to your inventory
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Product Information
            </div>
            <div className="flex gap-2">
              <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-red-50"
                  >
                    <Bug className="h-4 w-4" />
                    Debug API
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>API Connectivity Test</DialogTitle>
                  </DialogHeader>
                  <APITestComponent />
                </DialogContent>
              </Dialog>
              <Dialog open={isPDFImportOpen} onOpenChange={setIsPDFImportOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                    Import from PDF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>PDF Bulk Import</DialogTitle>
                  </DialogHeader>
                  <PDFBulkImport onSuccess={handlePDFImportSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border-red-200 bg-red-50"
            >
              <div className="flex items-center">
                <div className="p-1 bg-red-100 rounded-full mr-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Import Section */}
            <div className="mb-8">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-blue-800">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    Quick Import from PDF
                  </CardTitle>
                  <p className="text-sm text-blue-600">
                    Automatically extract product information from PDF catalogs,
                    invoices, or price lists
                  </p>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    className="hidden"
                    id="pdf-upload-input"
                    disabled={isProcessingPDF}
                  />

                  <Card
                    className="p-8 border-dashed border-2 border-blue-300 hover:border-blue-500 transition-all cursor-pointer bg-white/80 hover:bg-blue-50/80 hover:scale-[1.02]"
                    onClick={() =>
                      document.getElementById("pdf-upload-input")?.click()
                    }
                  >
                    <div className="text-center">
                      {isProcessingPDF ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="relative">
                              <RefreshCw className="h-16 w-16 text-blue-600 animate-spin" />
                              <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-700 text-lg">
                              Processing PDF...
                            </p>
                            <p className="text-sm text-blue-600 mt-2">
                              Using AI to extract product information
                            </p>
                            <div className="flex justify-center mt-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : pdfFile ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="p-3 bg-green-100 rounded-full">
                              <CheckCircle className="h-16 w-16 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-green-700 text-lg">
                              PDF Processed Successfully!
                            </p>
                            <p className="text-sm text-green-600 mt-1 font-medium">
                              📄 {pdfFile.name}
                            </p>
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Form has been auto-filled with extracted data
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                              <Upload className="h-16 w-16 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-700 text-xl">
                              Click to Upload PDF
                            </p>
                            <p className="text-blue-600 mt-2">
                              Automatically extract product information using AI
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                📋 Product Catalogs
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                🧾 Invoices
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                💰 Price Lists
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Basic Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div ref={nameInputRef} className="relative">
                    <Label
                      htmlFor="name"
                      className="flex items-center font-medium text-gray-700 mb-2"
                    >
                      <Package className="h-4 w-4 mr-2 text-gray-500" />
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter product name"
                      onFocus={() =>
                        setShowSuggestions((prev) => ({ ...prev, name: true }))
                      }
                      required
                      className="h-11 focus:ring-2 focus:ring-blue-500"
                    />
                    {showSuggestions.name && (
                      <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        {nameSuggestions.length > 0 ? (
                          filterSuggestions(
                            nameSuggestions,
                            formData.name || ""
                          ).map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() =>
                                handleSuggestionSelect("name", suggestion)
                              }
                            >
                              {suggestion}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">
                            No suggestions found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Category Select */}
                  <div>
                    <CategorySelect
                      value={formData.category}
                      onSelect={handleCategorySelect}
                      required
                    />
                  </div>

                  <div ref={brandInputRef} className="relative">
                    <Label
                      htmlFor="brand"
                      className="font-medium text-gray-700 mb-2 block"
                    >
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) =>
                        handleInputChange("brand", e.target.value)
                      }
                      placeholder="Enter brand name"
                      onFocus={() =>
                        setShowSuggestions((prev) => ({ ...prev, brand: true }))
                      }
                      className="h-11 focus:ring-2 focus:ring-blue-500"
                    />
                    {showSuggestions.brand && (
                      <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        {brandSuggestions.length > 0 ? (
                          filterSuggestions(
                            brandSuggestions,
                            formData.brand || ""
                          ).map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() =>
                                handleSuggestionSelect("brand", suggestion)
                              }
                            >
                              {suggestion}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">
                            No suggestions found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SKU Field */}
                  <div ref={skuInputRef} className="relative">
                    <Label
                      htmlFor="sku"
                      className="flex items-center font-medium text-gray-700 mb-2"
                    >
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      SKU *
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            handleInputChange("sku", e.target.value)
                          }
                          placeholder="Enter SKU"
                          onFocus={() =>
                            setShowSuggestions((prev) => ({
                              ...prev,
                              sku: true,
                            }))
                          }
                          required
                          className="h-11 focus:ring-2 focus:ring-blue-500"
                        />
                        {showSuggestions.sku && (
                          <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                            {skuSuggestions.length > 0 ? (
                              filterSuggestions(
                                skuSuggestions,
                                formData.sku || ""
                              ).map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() =>
                                    handleSuggestionSelect("sku", suggestion)
                                  }
                                >
                                  {suggestion}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500">
                                No suggestions found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={generateSKU}
                        variant="outline"
                        size="sm"
                        className="h-11 px-4 hover:bg-blue-50"
                        title="Generate SKU"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <Label
                    htmlFor="description"
                    className="font-medium text-gray-700 mb-2 block"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    rows={3}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SupplierSelect
                  value={selectedSupplier}
                  onSelect={handleSupplierSelect}
                  placeholder="Select supplier"
                />
                {selectedSupplier && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center text-green-800 font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected: {selectedSupplier.name}
                    </div>
                    {selectedSupplier.email && (
                      <p className="text-sm text-green-600 mt-1">
                        📧 {selectedSupplier.email}
                      </p>
                    )}
                    {selectedSupplier.phone && (
                      <p className="text-sm text-green-600">
                        📞 {selectedSupplier.phone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="costPrice"
                      className="font-medium text-gray-700"
                    >
                      Cost Price *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "costPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        required
                        className="pl-8 h-11 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="sellingPrice"
                      className="font-medium text-gray-700"
                    >
                      Selling Price *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "sellingPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        required
                        className="pl-8 h-11 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="wholesalePrice"
                      className="font-medium text-gray-700"
                    >
                      Wholesale Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        step="0.01"
                        value={formData.wholesalePrice}
                        onChange={(e) =>
                          handleInputChange(
                            "wholesalePrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="pl-8 h-11 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {profitMargin !== 0 && (
                  <div className="mt-6">
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        profitMargin > 0
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {profitMargin > 0 ? (
                            <div className="p-2 bg-green-100 rounded-full mr-3">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-100 rounded-full mr-3">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-700">
                              Profit Margin Analysis
                            </p>
                            <p className="text-sm text-gray-600">
                              {profitMargin > 0
                                ? "Great! Your product has a healthy profit margin."
                                : "Warning: Your selling price is lower than cost price."}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${
                              profitMargin > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {profitMargin > 0 ? "+" : ""}
                            {profitMargin}%
                          </p>
                          <p className="text-sm text-gray-500">
                            $
                            {(
                              formData.sellingPrice - formData.costPrice
                            ).toFixed(2)}{" "}
                            per unit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentStock"
                      className="font-medium text-gray-700"
                    >
                      Initial Stock *
                    </Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) =>
                        handleInputChange(
                          "currentStock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      required
                      className="h-11 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Current inventory count
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="minStockLevel"
                      className="font-medium text-gray-700"
                    >
                      Minimum Stock Level
                    </Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        handleInputChange(
                          "minStockLevel",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="10"
                      className="h-11 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Alert when stock falls below
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="maxStockLevel"
                      className="font-medium text-gray-700"
                    >
                      Maximum Stock Level
                    </Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) =>
                        handleInputChange(
                          "maxStockLevel",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="1000"
                      className="h-11 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum storage capacity
                    </p>
                  </div>
                </div>

                {/* Stock Status Indicators */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-3 rounded-lg border-2 text-center ${
                      formData.currentStock === 0
                        ? "bg-red-50 border-red-200"
                        : formData.currentStock <= formData.minStockLevel
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-700">
                      Stock Status
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        formData.currentStock === 0
                          ? "text-red-600"
                          : formData.currentStock <= formData.minStockLevel
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {formData.currentStock === 0
                        ? "Out of Stock"
                        : formData.currentStock <= formData.minStockLevel
                        ? "Low Stock"
                        : "In Stock"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Stock Value
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      ${(formData.currentStock * formData.costPrice).toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border-2 border-indigo-200 bg-indigo-50 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Potential Revenue
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      $
                      {(formData.currentStock * formData.sellingPrice).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-8">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-8 py-3 h-12 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    {editProduct
                      ? "Updating Product..."
                      : "Creating Product..."}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {editProduct ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
