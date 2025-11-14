import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Package,
  AlertTriangle,
  Upload,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import { apiService } from "@/lib/api";

interface QuickAddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const QuickAddProduct: React.FC<QuickAddProductProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Simplified form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStockLevel: 10,
    supplier: {
      name: "",
      contact: "",
      email: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF Upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Generate SKU
  const generateSKU = () => {
    const categoryCode = formData.category
      ? formData.category.substring(0, 3).toUpperCase()
      : "GEN";
    const nameCode = formData.name
      ? formData.name.substring(0, 3).toUpperCase().replace(/\s/g, "")
      : "PRD";
    const timestamp = Date.now().toString().slice(-4);
    return `${categoryCode}-${nameCode}-${timestamp}`;
  };

  // Handle PDF file upload and processing
  const handlePDFUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setPdfFile(file);
    setIsProcessingPDF(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const formDataPDF = new FormData();
      formDataPDF.append("pdfFile", file);
      formDataPDF.append("supplierName", "PDF Import");
      formDataPDF.append("defaultCategory", "Imported");
      formDataPDF.append("priceType", "selling");

      const response = await fetch("/api/products/pdf-import/preview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataPDF,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data.sampleProducts?.length > 0) {
        const firstProduct = result.data.sampleProducts[0];

        // Auto-fill form with first product from PDF
        if (firstProduct.name) {
          setFormData((prev) => ({
            ...prev,
            name: firstProduct.name,
            description: firstProduct.description || "",
            brand: firstProduct.brand || "",
            category: firstProduct.category || "Imported",
            costPrice: firstProduct.costPrice || 0,
            sellingPrice: firstProduct.sellingPrice || 0,
            currentStock: firstProduct.currentStock || 0,
            sku: firstProduct.sku || generateSKU(),
          }));
        }

        alert(
          `PDF processed successfully! Found ${result.data.sampleProducts.length} products. Form auto-filled with first product.`
        );
      } else {
        throw new Error(
          result.message || "Failed to extract products from PDF"
        );
      }
    } catch (error) {
      console.error("PDF processing error:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("log in again") ||
          error.message.includes("Session expired")
        ) {
          setError(
            "Your session has expired. Please refresh the page and log in again."
          );
          // Optionally redirect to login
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to process PDF file. Please try again.");
      }
    } finally {
      setIsProcessingPDF(false);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.sku.trim()) return "SKU is required";
    if (!formData.category.trim()) return "Category is required";
    if (formData.costPrice <= 0) return "Cost price must be greater than 0";
    if (formData.sellingPrice <= 0)
      return "Selling price must be greater than 0";
    if (formData.sellingPrice <= formData.costPrice)
      return "Selling price must be greater than cost price";
    if (!formData.supplier.name.trim()) return "Supplier name is required";
    return null;
  };

  // Form submission
  const handleSubmit = async () => {
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        ...formData,
        // Ensure numeric values are properly formatted
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.currentStock), // API expects 'stock' field
        currentStock: Number(formData.currentStock),
        minStockLevel: Number(formData.minStockLevel),
      };

      const response = await apiService.createProduct(productData);

      if (response.success) {
        // Simple success feedback
        alert("Product added successfully!");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Create product error:", error);
      setError(error.message || "Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span>Add New Product</span>
        </DialogTitle>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="Product SKU"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleChange("sku", generateSKU())}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Product category"
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="Product brand"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price * ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice || ""}
                  onChange={(e) =>
                    handleChange("costPrice", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Selling Price * ($)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice || ""}
                  onChange={(e) =>
                    handleChange(
                      "sellingPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Profit margin display */}
            {formData.costPrice > 0 && formData.sellingPrice > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-900">
                  Profit Margin:{" "}
                  {Math.round(
                    ((formData.sellingPrice - formData.costPrice) /
                      formData.costPrice) *
                      100
                  )}
                  %
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock || ""}
                  onChange={(e) =>
                    handleChange("currentStock", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel || ""}
                  onChange={(e) =>
                    handleChange("minStockLevel", parseInt(e.target.value) || 0)
                  }
                  placeholder="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplier.name}
                  onChange={(e) =>
                    handleChange("supplier.name", e.target.value)
                  }
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <Label htmlFor="supplierContact">Contact Number</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplier.contact}
                  onChange={(e) =>
                    handleChange("supplier.contact", e.target.value)
                  }
                  placeholder="Contact number"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="supplierEmail">Email</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={formData.supplier.email}
                  onChange={(e) =>
                    handleChange("supplier.email", e.target.value)
                  }
                  placeholder="supplier@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddProduct;
