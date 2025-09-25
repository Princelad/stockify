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
} from "lucide-react";

interface AddProductFormProps {
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
}

export default function AddProductForm({
  onSuccess,
  onCancel,
}: AddProductFormProps) {
  const { toast } = useToast();

  // PDF Import Modal State
  const [isPDFImportOpen, setIsPDFImportOpen] = useState(false);

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
    supplierId: "", // New supplier reference
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

      const response = await apiService.createProduct(formData);

      if (response.success) {
        // Show success toast
        toast({
          type: "success",
          title: "Product Created Successfully!",
          description: `${formData.name} has been added to your inventory.`,
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
          supplierId: "",
          weight: 0,
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
          },
        });
        setSelectedSupplier(null);
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create product";
      setError(errorMessage);

      // Show error toast
      toast({
        type: "error",
        title: "Failed to Create Product",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-6 w-6 mr-2" />
              Add New Product
            </div>
            <div className="flex gap-2">
              <Dialog open={isPDFImportOpen} onOpenChange={setIsPDFImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
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
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Import Section */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Upload className="h-5 w-5 mr-2" />
                  Quick Import from PDF
                </CardTitle>
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
                  className="p-6 border-dashed border-2 border-blue-300 hover:border-blue-500 transition-colors cursor-pointer bg-white hover:bg-blue-50"
                  onClick={() =>
                    document.getElementById("pdf-upload-input")?.click()
                  }
                >
                  <div className="text-center">
                    {isProcessingPDF ? (
                      <>
                        <RefreshCw className="h-12 w-12 mx-auto text-blue-600 mb-3 animate-spin" />
                        <p className="font-medium text-blue-700">
                          Processing PDF...
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Please wait while we extract product data
                        </p>
                      </>
                    ) : pdfFile ? (
                      <>
                        <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                        <p className="font-medium text-green-700">
                          PDF Processed Successfully!
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Form has been auto-filled with extracted data
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                        <p className="font-medium text-blue-700 text-lg">
                          Click to Upload PDF
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Automatically extract product information
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported: Product catalogs, invoices, price lists
                        </p>
                      </>
                    )}
                  </div>
                </Card>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div ref={nameInputRef} className="relative">
                    <Label htmlFor="name" className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
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
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleSuggestionSelect("name", suggestion)
                              }
                            >
                              {suggestion}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">
                            No suggestions found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Category Select */}
                  <CategorySelect
                    value={formData.category}
                    onSelect={handleCategorySelect}
                    required
                  />

                  <div ref={brandInputRef} className="relative">
                    <Label htmlFor="brand">Brand</Label>
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
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleSuggestionSelect("brand", suggestion)
                              }
                            >
                              {suggestion}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">
                            No suggestions found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SKU Field */}
                  <div ref={skuInputRef} className="relative">
                    <Label htmlFor="sku" className="flex items-center">
                      <Hash className="h-4 w-4 mr-1" />
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
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() =>
                                    handleSuggestionSelect("sku", suggestion)
                                  }
                                >
                                  {suggestion}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">
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
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SupplierSelect
                  value={selectedSupplier}
                  onSelect={handleSupplierSelect}
                  placeholder="Select supplier"
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Cost Price *</Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellingPrice">Selling Price *</Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price</Label>
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
                    />
                  </div>
                </div>

                {profitMargin !== 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">
                      Profit Margin:
                      <span
                        className={`ml-2 ${
                          profitMargin > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {profitMargin}%
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Initial Stock *</Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
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
