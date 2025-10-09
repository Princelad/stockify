import { useState, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  Tag,
  Download,
  Search,
  Package,
  Hash,
  Printer,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Settings,
  Edit3,
  Eye,
  Barcode as BarcodeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { apiService, type LabelTemplate } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { Product } from "@/types/product";

// Types
type Notification = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

interface BarcodeValidation {
  isValid: boolean;
  message: string;
}

interface GeneratedBarcode {
  product: Product;
  barcode: string;
}

// Updated API service with better authentication handling
const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      const response = await fetch("http://localhost:5000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("authToken");
          throw new Error("AUTHENTICATION_REQUIRED");
        }
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      const products = result.data.products || [];
      return products.map((product: any) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        sellingPrice: product.sellingPrice,
        category: product.category,
        brand: product.brand || "",
        currentStock: product.currentStock || 0,
        supplier: product.supplier,
        description: product.description || "",
        isActive: product.isActive !== false,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  updateProductBarcode: async (
    productId: string,
    barcode: string
  ): Promise<boolean> => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        console.error("No authentication token found");
        return false;
      }

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ barcode }),
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to update barcode for product ${productId}: ${response.status}`
        );
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error updating product barcode:", error);
      return false;
    }
  },

  testConnection: async (): Promise<{
    connected: boolean;
    authenticated: boolean;
  }> => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(
        "http://localhost:5000/api/products?page=1&limit=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      return {
        connected: true,
        authenticated: response.status !== 401,
      };
    } catch (error) {
      console.error("Backend connection test failed:", error);
      return {
        connected: false,
        authenticated: false,
      };
    }
  },
};

export default function LabelsAndBarcodes() {
  // Common state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [authenticationStatus, setAuthenticationStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");

  // Barcode generation state
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customBarcode, setCustomBarcode] = useState("");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [customBarcodeType, setCustomBarcodeType] = useState("CODE128");
  const [generatedBarcodes, setGeneratedBarcodes] = useState<
    GeneratedBarcode[]
  >([]);
  const [validationResult, setValidationResult] = useState<BarcodeValidation>({
    isValid: true,
    message: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Label printing state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");
  const [selectedLabelProducts, setSelectedLabelProducts] = useState<Product[]>(
    []
  );
  const [customText, setCustomText] = useState("");
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [previewMode, setPreviewMode] = useState<"product" | "custom">(
    "product"
  );
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [activeTab, setActiveTab] = useState("barcodes");

  const { toast } = useToast();

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, title, message }]);

    toast({
      title,
      description: message,
      type,
    });

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Sample products for fallback
  const sampleProducts: Product[] = [
    {
      _id: "sample-1",
      name: "Apple iPhone 15 Pro Max",
      sku: "APL-IPH15PM-256",
      barcode: "1234567890128",
      category: "Electronics",
      brand: "Apple",
      sellingPrice: 134900,
      costPrice: 120000,
      currentStock: 25,
      stock: 25,
      minStockLevel: 5,
      supplier: {
        name: "Tech Distributors Ltd",
        contact: "+91 98765-43210",
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: "256GB Storage, Space Black Color",
    },
    {
      _id: "sample-2",
      name: "Samsung Galaxy Buds Pro",
      sku: "SAM-GBPRO-WHT",
      barcode: "9876543210987",
      category: "Audio",
      brand: "Samsung",
      sellingPrice: 19999,
      costPrice: 16000,
      currentStock: 8,
      stock: 8,
      minStockLevel: 10,
      supplier: {
        name: "Audio Solutions Inc",
        contact: "+91 87654-32109",
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: "Wireless Earbuds with ANC",
    },
  ];

  // Barcode types configuration
  const productBarcodeTypes = [
    {
      value: "CODE128",
      label: "Code 128",
      description: "Most common, alphanumeric",
    },
    { value: "CODE39", label: "Code 39", description: "Basic barcode format" },
    {
      value: "EAN13",
      label: "EAN-13",
      description: "13-digit retail standard",
    },
    { value: "UPC", label: "UPC-A", description: "12-digit US retail" },
    { value: "QR", label: "QR Code", description: "2D code, high capacity" },
  ];

  const customBarcodeTypes = [
    {
      value: "CODE128",
      label: "Code 128",
      description: "Most common, alphanumeric",
    },
    { value: "CODE39", label: "Code 39", description: "Basic barcode format" },
    { value: "QR", label: "QR Code", description: "2D code, high capacity" },
  ];

  // Default templates
  const defaultTemplates: LabelTemplate[] = [
    {
      id: "template1",
      name: "Professional Product Label",
      size: '2" x 1"',
      fields: ["name", "price", "sku", "barcode"],
      layout: "single",
      isDefault: true,
      settings: {
        fontSize: 10,
        fontFamily: "Arial",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        showBorder: true,
      },
    },
    {
      id: "template2",
      name: "Premium Price Tag",
      size: '3" x 2"',
      fields: ["name", "price", "category", "brand", "barcode"],
      layout: "single",
      isDefault: true,
      settings: {
        fontSize: 12,
        fontFamily: "Arial",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        showBorder: true,
      },
    },
    {
      id: "template3",
      name: "Inventory Label",
      size: '2" x 1"',
      fields: ["name", "sku", "stock", "barcode"],
      layout: "single",
      isDefault: true,
      settings: {
        fontSize: 9,
        fontFamily: "Arial",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        showBorder: true,
      },
    },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Test connection and authentication first
      const connectionTest = await ProductService.testConnection();
      setBackendConnected(connectionTest.connected);

      if (!connectionTest.connected) {
        throw new Error("Backend server is not running");
      }

      if (!connectionTest.authenticated) {
        setAuthenticationStatus("unauthenticated");
        throw new Error("AUTHENTICATION_REQUIRED");
      }

      setAuthenticationStatus("authenticated");

      // Load products and templates in parallel
      const [productsData, templatesResponse] = await Promise.all([
        ProductService.getProducts(),
        apiService
          .getLabelTemplates()
          .catch(() => ({ success: false, data: null })),
      ]);

      if (productsData && productsData.length > 0) {
        setProducts(productsData);
        showNotification(
          "success",
          "Data Loaded",
          `Successfully loaded ${productsData.length} products`
        );
      } else {
        setProducts(sampleProducts);
        showNotification(
          "info",
          "Demo Mode",
          "Using sample products for demonstration"
        );
      }

      // Set templates
      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data.templates);
      } else {
        setTemplates(defaultTemplates);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setProducts(sampleProducts);
      setTemplates(defaultTemplates);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);

      if (errorMessage === "AUTHENTICATION_REQUIRED") {
        showNotification(
          "error",
          "Authentication Required",
          "Please log in to access your products"
        );
      } else {
        showNotification(
          "info",
          "Demo Mode",
          "Using sample data. Check your connection and authentication."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Barcode validation
  const validateBarcode = (text: string, type: string): BarcodeValidation => {
    if (!text.trim()) {
      return { isValid: false, message: "Barcode text cannot be empty" };
    }

    const selectedType = customBarcodeTypes.find((t) => t.value === type);

    switch (type) {
      case "EAN13":
        if (!/^\d{12,13}$/.test(text)) {
          return {
            isValid: false,
            message: "EAN-13 requires exactly 12 or 13 digits",
          };
        }
        break;
      case "UPC":
        if (!/^\d{11,12}$/.test(text)) {
          return {
            isValid: false,
            message: "UPC-A requires exactly 11 or 12 digits",
          };
        }
        break;
      case "CODE39":
        if (!/^[A-Z0-9\-. $\/+%]+$/.test(text)) {
          return {
            isValid: false,
            message:
              "Code 39 only supports uppercase letters, numbers, and limited symbols",
          };
        }
        break;
    }

    return { isValid: true, message: `Valid ${selectedType?.label} barcode` };
  };

  // Generate barcode
  const generateBarcode = (text: string, type: string) => {
    const canvas = document.createElement("canvas");

    if (type === "EAN13") {
      let eanText = text.padStart(12, "0");
      if (eanText.length === 12) {
        let checksum = 0;
        for (let i = 0; i < 12; i++) {
          checksum += parseInt(eanText[i]) * (i % 2 === 0 ? 1 : 3);
        }
        checksum = (10 - (checksum % 10)) % 10;
        eanText += checksum.toString();
      }
      text = eanText;
    } else if (type === "UPC") {
      let upcText = text.padStart(11, "0");
      if (upcText.length === 11) {
        let checksum = 0;
        for (let i = 0; i < 11; i++) {
          checksum += parseInt(upcText[i]) * (i % 2 === 0 ? 3 : 1);
        }
        checksum = (10 - (checksum % 10)) % 10;
        upcText += checksum.toString();
      }
      text = upcText;
    }

    if (type === "QR") {
      QRCode.toCanvas(canvas, text, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } else {
      JsBarcode(canvas, text, {
        format: type,
        width: type === "EAN13" || type === "UPC" ? 1.5 : 2,
        height: type === "EAN13" || type === "UPC" ? 50 : 60,
        displayValue: true,
        fontSize: 12,
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        fontOptions: "",
        font: "monospace",
        background: "#FFFFFF",
        lineColor: "#000000",
        margin: 10,
        ...(type === "EAN13" && {
          flat: false,
          guardHeight: 5,
        }),
        ...(type === "UPC" && {
          flat: false,
          guardHeight: 5,
        }),
      });
    }

    return canvas.toDataURL();
  };

  // Barcode generation handlers
  const handleGenerateBarcodes = () => {
    setIsGenerating(true);
    try {
      const newBarcodes: GeneratedBarcode[] = [];

      selectedProducts.forEach((product) => {
        const barcodeText = product.barcode || product.sku;
        const barcodeDataUrl = generateBarcode(barcodeText, barcodeType);
        newBarcodes.push({ product, barcode: barcodeDataUrl });
      });

      if (customBarcode.trim()) {
        const validation = validateBarcode(customBarcode, customBarcodeType);
        if (validation.isValid) {
          const customProduct: Product = {
            _id: "custom",
            name: "Custom Barcode",
            sku: customBarcode,
            barcode: customBarcode,
            category: "Custom",
            sellingPrice: 0,
            costPrice: 0,
            currentStock: 0,
            stock: 0,
            minStockLevel: 0,
            supplier: {
              name: "Custom",
              contact: "",
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const barcodeDataUrl = generateBarcode(
            customBarcode,
            customBarcodeType
          );
          newBarcodes.push({ product: customProduct, barcode: barcodeDataUrl });
        }
      }

      setGeneratedBarcodes(newBarcodes);

      if (newBarcodes.length > 0) {
        showNotification(
          "success",
          "Barcodes Generated",
          `Generated ${newBarcodes.length} barcode(s) successfully`
        );
      }
    } catch (error) {
      console.error("Error generating barcodes:", error);
      showNotification(
        "error",
        "Generation Failed",
        "Failed to generate barcodes. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBarcodes = async () => {
    if (generatedBarcodes.length === 0) return;

    setIsDownloading(true);
    try {
      const pdf = new jsPDF();
      let yPosition = 20;

      for (let i = 0; i < generatedBarcodes.length; i++) {
        const item = generatedBarcodes[i];

        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        // Add product name
        pdf.setFontSize(12);
        pdf.text(item.product.name, 20, yPosition);
        yPosition += 10;

        // Add SKU
        pdf.setFontSize(10);
        pdf.text(`SKU: ${item.product.sku}`, 20, yPosition);
        yPosition += 10;

        // Add barcode image
        const imgData = item.barcode;
        pdf.addImage(imgData, "PNG", 20, yPosition, 80, 30);
        yPosition += 50;
      }

      pdf.save(`barcodes-${Date.now()}.pdf`);
      showNotification(
        "success",
        "Download Complete",
        "Barcodes downloaded successfully"
      );
    } catch (error) {
      console.error("Error downloading barcodes:", error);
      showNotification(
        "error",
        "Download Failed",
        "Failed to download barcodes"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Label printing handlers
  const addLabelProduct = (product: Product) => {
    if (!selectedLabelProducts.find((p) => p._id === product._id)) {
      setSelectedLabelProducts((prev) => [...prev, product]);
    }
  };

  const removeLabelProduct = (productId: string) => {
    setSelectedLabelProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handlePrintLabels = async () => {
    if (previewMode === "product" && selectedLabelProducts.length === 0) {
      showNotification(
        "error",
        "No Products",
        "Please select products to print labels"
      );
      return;
    }
    if (previewMode === "custom" && !customText) {
      showNotification(
        "error",
        "No Text",
        "Please enter custom text for labels"
      );
      return;
    }

    try {
      setIsGenerating(true);

      const pdfBlob = await apiService.generateLabelPDF({
        templateId: selectedTemplate,
        products:
          previewMode === "product"
            ? selectedLabelProducts.map((p) => p._id)
            : undefined,
        customText: previewMode === "custom" ? customText : undefined,
        quantity: labelQuantity,
      });

      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print Labels</title></head>
            <body style="margin:0">
              <embed src="${url}" width="100%" height="100%" type="application/pdf">
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback: download the PDF
        const a = document.createElement("a");
        a.href = url;
        a.download = `labels-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      URL.revokeObjectURL(url);
      showNotification(
        "success",
        "Labels Ready",
        "Labels generated and ready to print"
      );
    } catch (error) {
      console.error("Error generating labels:", error);
      showNotification(
        "error",
        "Print Failed",
        error instanceof Error ? error.message : "Failed to generate labels"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter products for search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custom barcode validation effect
  useEffect(() => {
    if (customBarcode.trim()) {
      const result = validateBarcode(customBarcode, customBarcodeType);
      setValidationResult(result);
    } else {
      setValidationResult({ isValid: true, message: "" });
    }
  }, [customBarcode, customBarcodeType]);

  if (isLoading) {
    return (
      <InventoryLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products and templates...</p>
          </div>
        </div>
      </InventoryLayout>
    );
  }

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);

  return (
    <InventoryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Labels & Barcodes
            </h1>
            <p className="text-gray-600 mt-1">
              Generate barcodes and print labels for your products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={backendConnected ? "default" : "destructive"}>
              {backendConnected ? "Connected" : "Offline"}
            </Badge>
            <Badge
              variant={
                authenticationStatus === "authenticated"
                  ? "default"
                  : "secondary"
              }
            >
              {authenticationStatus === "authenticated"
                ? "Authenticated"
                : "Demo Mode"}
            </Badge>
          </div>
        </div>

        {/* Connection Alert */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="barcodes" className="flex items-center gap-2">
              <BarcodeIcon className="h-4 w-4" />
              Barcode Generator
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Label Printing
            </TabsTrigger>
          </TabsList>

          {/* Barcode Generator Tab */}
          <TabsContent value="barcodes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Select Products
                  </CardTitle>
                  <CardDescription>
                    Choose products to generate barcodes for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            SKU: {product.sku} • {product.category}
                          </p>
                          {product.barcode && (
                            <p className="text-xs text-blue-600">
                              Barcode: {product.barcode}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={
                            selectedProducts.find((p) => p._id === product._id)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            if (
                              selectedProducts.find(
                                (p) => p._id === product._id
                              )
                            ) {
                              setSelectedProducts((prev) =>
                                prev.filter((p) => p._id !== product._id)
                              );
                            } else {
                              setSelectedProducts((prev) => [...prev, product]);
                            }
                          }}
                        >
                          {selectedProducts.find((p) => p._id === product._id)
                            ? "Selected"
                            : "Select"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedProducts.length} product(s) selected
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedProducts.map((product) => (
                          <Badge
                            key={product._id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {product.name}
                            <button
                              onClick={() =>
                                setSelectedProducts((prev) =>
                                  prev.filter((p) => p._id !== product._id)
                                )
                              }
                              className="ml-1 hover:bg-gray-300 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Barcode Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="barcodeType">Barcode Type</Label>
                    <Select value={barcodeType} onValueChange={setBarcodeType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productBarcodeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-600">
                                {type.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customBarcode">Custom Barcode</Label>
                    <Input
                      id="customBarcode"
                      placeholder="Enter custom text"
                      value={customBarcode}
                      onChange={(e) => setCustomBarcode(e.target.value)}
                    />
                    {validationResult.message && (
                      <p
                        className={`text-xs mt-1 ${
                          validationResult.isValid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {validationResult.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customBarcodeType">
                      Custom Barcode Type
                    </Label>
                    <Select
                      value={customBarcodeType}
                      onValueChange={setCustomBarcodeType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {customBarcodeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-600">
                                {type.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleGenerateBarcodes}
                      disabled={
                        isGenerating ||
                        (selectedProducts.length === 0 && !customBarcode.trim())
                      }
                      className="w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Hash className="h-4 w-4 mr-2" />
                      )}
                      Generate Barcodes
                    </Button>

                    <Button
                      onClick={handleDownloadBarcodes}
                      disabled={isDownloading || generatedBarcodes.length === 0}
                      variant="outline"
                      className="w-full"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Barcodes */}
            {generatedBarcodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Generated Barcodes ({generatedBarcodes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {generatedBarcodes.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 text-center bg-white"
                      >
                        <h4 className="font-medium mb-2">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          SKU: {item.product.sku}
                        </p>
                        <div className="flex justify-center mb-3">
                          <img
                            src={item.barcode}
                            alt={`Barcode for ${item.product.name}`}
                            className="max-w-full h-auto"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.download = `${item.product.sku}-barcode.png`;
                            link.href = item.barcode;
                            link.click();
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Label Printing Tab */}
          <TabsContent value="labels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Label Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Label Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-gray-600">
                                {template.size}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Content Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={
                          previewMode === "product" ? "default" : "outline"
                        }
                        onClick={() => setPreviewMode("product")}
                        className="flex-1"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Products
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          previewMode === "custom" ? "default" : "outline"
                        }
                        onClick={() => setPreviewMode("custom")}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Custom
                      </Button>
                    </div>
                  </div>

                  {previewMode === "custom" && (
                    <div>
                      <Label htmlFor="customText">Custom Text</Label>
                      <Textarea
                        id="customText"
                        placeholder="Enter custom text for labels"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={labelQuantity}
                      onChange={(e) =>
                        setLabelQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <Button
                    onClick={handlePrintLabels}
                    disabled={
                      isGenerating ||
                      (previewMode === "product" &&
                        selectedLabelProducts.length === 0) ||
                      (previewMode === "custom" && !customText.trim())
                    }
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    Print Labels
                  </Button>
                </CardContent>
              </Card>

              {/* Product Selection for Labels */}
              {previewMode === "product" && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Select Products for Labels
                    </CardTitle>
                    <CardDescription>
                      Choose products to create labels for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600">
                              SKU: {product.sku} • ₹
                              {product.sellingPrice?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock: {product.currentStock} • {product.category}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={
                              selectedLabelProducts.find(
                                (p) => p._id === product._id
                              )
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              if (
                                selectedLabelProducts.find(
                                  (p) => p._id === product._id
                                )
                              ) {
                                removeLabelProduct(product._id);
                              } else {
                                addLabelProduct(product);
                              }
                            }}
                          >
                            {selectedLabelProducts.find(
                              (p) => p._id === product._id
                            )
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {selectedLabelProducts.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          {selectedLabelProducts.length} product(s) selected for
                          labels
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedLabelProducts.map((product) => (
                            <Badge
                              key={product._id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {product.name}
                              <button
                                onClick={() => removeLabelProduct(product._id)}
                                className="ml-1 hover:bg-gray-300 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Template Preview */}
              {previewMode === "custom" && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Label Preview
                    </CardTitle>
                    <CardDescription>
                      Preview how your custom labels will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentTemplate && customText ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="bg-white border border-gray-200 rounded p-4 inline-block shadow-sm">
                          <div className="text-sm font-medium mb-2">
                            {currentTemplate.name}
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-2">
                            {customText}
                          </div>
                          <div className="text-xs text-gray-500">
                            Size: {currentTemplate.size}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Enter custom text to see preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <Alert
              key={notification.id}
              className={`min-w-80 shadow-lg border-l-4 ${
                notification.type === "success"
                  ? "border-l-green-500 bg-green-50"
                  : notification.type === "error"
                  ? "border-l-red-500 bg-red-50"
                  : "border-l-blue-500 bg-blue-50"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : notification.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </InventoryLayout>
  );
}
