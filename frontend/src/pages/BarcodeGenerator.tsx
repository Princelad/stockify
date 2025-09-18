import { useState, useRef, useEffect } from "react";
import { InventoryLayout } from "@/layouts";
import {
  Tag,
  Download,
  Search,
  Package,
  Hash,
  Copy,
  Printer,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Create simple notification type
type Notification = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  category: string;
}

interface BarcodeValidation {
  isValid: boolean;
  message: string;
}

// Updated API service with better authentication handling
const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      // Try multiple token storage locations
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      console.log("Token found:", token ? "Yes" : "No"); // Debug log

      const response = await fetch("http://localhost:5000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          // Clear any stored tokens
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("authToken");
          throw new Error("AUTHENTICATION_REQUIRED");
        }
        if (response.status === 403) {
          throw new Error("Access denied. Insufficient permissions.");
        }
        if (response.status === 404) {
          throw new Error("Products endpoint not found.");
        }
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result); // Debug log

      // Handle your backend response structure
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      const products = result.data.products || [];

      // Transform your backend data to match frontend interface
      return products.map((product: any) => ({
        id: product._id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        price: product.sellingPrice,
        category: product.category,
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

  // Test connection and authentication
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

  // Alternative method to get products with pagination
  getProductsAlternative: async (): Promise<Product[]> => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      // Try with higher limit to get all products
      const response = await fetch(
        "http://localhost:5000/api/products?page=1&limit=1000",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          const products = result.data.products || [];

          return products.map((product: any) => ({
            id: product._id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode || "",
            price: product.sellingPrice || product.price || 0,
            category: product.category || "Uncategorized",
          }));
        }
      }

      throw new Error("Alternative endpoint failed");
    } catch (error) {
      console.error("Error with alternative product fetch:", error);
      throw error;
    }
  },
};

// Updated mock data to match your Product model structure
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 13",
    sku: "IPH-13-128",
    barcode: "123456789012",
    price: 45000,
    category: "Electronics",
  },
  {
    id: "2",
    name: "Samsung Galaxy S21",
    sku: "SAM-S21-256",
    barcode: "",
    price: 35000,
    category: "Electronics",
  },
  {
    id: "3",
    name: "OnePlus 9",
    sku: "OPL-09-128",
    barcode: "",
    price: 30000,
    category: "Electronics",
  },
  {
    id: "4",
    name: "MacBook Air",
    sku: "MAC-AIR-M1",
    barcode: "987654321098",
    price: 85000,
    category: "Electronics",
  },
  {
    id: "5",
    name: "Dell XPS 13",
    sku: "DELL-XPS13",
    barcode: "",
    price: 75000,
    category: "Electronics",
  },
  {
    id: "6",
    name: "Sony WH-1000XM4",
    sku: "SONY-WH1000",
    barcode: "",
    price: 22000,
    category: "Electronics",
  },
];

export default function BarcodeGenerator() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customBarcode, setCustomBarcode] = useState("");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [generatedBarcodes, setGeneratedBarcodes] = useState<
    Array<{ product: Product; barcode: string }>
  >([]);
  const [validationResult, setValidationResult] = useState<BarcodeValidation>({
    isValid: true,
    message: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [authenticationStatus, setAuthenticationStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");

  const barcodesContainerRef = useRef<HTMLDivElement>(null);
  const barcodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    setIsUsingMockData(false);

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
      let data: Product[] = [];

      try {
        // Try primary endpoint first
        data = await ProductService.getProducts();
        showNotification(
          "success",
          "Products Loaded",
          `Successfully loaded ${data.length} products from database`
        );
      } catch (primaryError) {
        console.warn("Primary endpoint failed:", primaryError);

        if (
          primaryError instanceof Error &&
          primaryError.message === "AUTHENTICATION_REQUIRED"
        ) {
          throw primaryError;
        }

        try {
          // Try alternative endpoint
          data = await ProductService.getProductsAlternative();
          showNotification(
            "success",
            "Products Loaded",
            `Successfully loaded ${data.length} products from alternative endpoint`
          );
        } catch (alternativeError) {
          console.warn("Alternative endpoints failed:", alternativeError);
          throw alternativeError;
        }
      }

      setProducts(data);
    } catch (err) {
      console.error("All product fetch methods failed:", err);

      if (err instanceof Error && err.message === "AUTHENTICATION_REQUIRED") {
        setAuthenticationStatus("unauthenticated");
        setError(
          "Authentication required. Please log in to access your products."
        );
        showNotification(
          "error",
          "Authentication Required",
          "Please log in to access your products. Redirecting to login..."
        );

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          // Try different possible login routes
          const possibleLoginRoutes = [
            "/login",
            "/auth/login",
            "/signin",
            "/auth",
          ];
          const currentHost = window.location.origin;

          // Try to redirect to login page
          window.location.href = `${currentHost}/login`;
        }, 3000);

        // Use mock data while redirecting
        setProducts(MOCK_PRODUCTS);
        setIsUsingMockData(true);
        return;
      }

      setProducts(MOCK_PRODUCTS);
      setIsUsingMockData(true);

      if (!backendConnected) {
        setError(
          "Cannot connect to backend server at http://localhost:5000. Make sure your backend is running."
        );
        showNotification(
          "error",
          "Backend Offline",
          "Cannot connect to server. Using sample data for demonstration."
        );
      } else {
        setError("Failed to load products from server. Using sample data.");
        showNotification(
          "error",
          "API Error",
          "Failed to fetch products. Using sample data."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const barcodeTypes = [
    {
      value: "CODE128",
      label: "Code 128",
      validator: () => ({ isValid: true, message: "" }),
    },
    {
      value: "CODE39",
      label: "Code 39",
      validator: (text: string) => {
        const valid = /^[A-Z0-9\-\.\ \$\/\+\%]+$/i.test(text);
        return {
          isValid: valid,
          message: valid
            ? ""
            : "Code 39 only supports uppercase letters, numbers, and - . $ / + % space",
        };
      },
    },
    {
      value: "EAN13",
      label: "EAN-13",
      validator: (text: string) => {
        const valid = /^\d{12}$/.test(text); // 12 digits (13th is check digit)
        return {
          isValid: valid,
          message: valid
            ? ""
            : "EAN-13 requires exactly 12 digits (check digit will be added automatically)",
        };
      },
    },
    {
      value: "UPC",
      label: "UPC-A",
      validator: (text: string) => {
        const valid = /^\d{11}$/.test(text); // 11 digits (12th is check digit)
        return {
          isValid: valid,
          message: valid
            ? ""
            : "UPC-A requires exactly 11 digits (check digit will be added automatically)",
        };
      },
    },
    {
      value: "QR",
      label: "QR Code",
      validator: () => ({ isValid: true, message: "" }),
    },
  ];

  // Validate input when barcode type or custom barcode changes
  useEffect(() => {
    validateBarcode(customBarcode);
  }, [barcodeType, customBarcode]);

  // Render barcodes after they're generated
  useEffect(() => {
    renderBarcodes();
  }, [generatedBarcodes, barcodeType]);

  const validateBarcode = (text: string) => {
    if (!text) {
      setValidationResult({
        isValid: false,
        message: "Barcode text is required",
      });
      return false;
    }

    const selectedType = barcodeTypes.find(
      (type) => type.value === barcodeType
    );
    if (selectedType) {
      const result = selectedType.validator(text);
      setValidationResult(result);
      return result.isValid;
    }

    return true;
  };

  const renderBarcodes = () => {
    if (generatedBarcodes.length === 0) return;

    generatedBarcodes.forEach((item, index) => {
      const barcodeElement = barcodeRefs.current[index];
      if (!barcodeElement) return;

      // Clear previous barcode
      barcodeElement.innerHTML = "";

      if (barcodeType === "QR") {
        // Generate QR code
        const canvas = document.createElement("canvas");
        QRCode.toCanvas(
          canvas,
          item.barcode,
          {
            width: 128,
            margin: 1,
            errorCorrectionLevel: "H", // Higher error correction for better scanning
          },
          (error) => {
            if (error) {
              console.error(error);
              barcodeElement.innerHTML = `<div class="text-red-500">Error generating QR code</div>`;
            } else {
              barcodeElement.appendChild(canvas);
            }
          }
        );
      } else {
        // Generate linear barcode
        const svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        barcodeElement.appendChild(svgElement);

        try {
          JsBarcode(svgElement, item.barcode, {
            format: barcodeType,
            width: 2,
            height: 60,
            displayValue: true,
            font: "monospace",
            fontSize: 12,
            margin: 5,
          });
        } catch (e) {
          console.error("Barcode generation error:", e);
          barcodeElement.innerHTML = `<div class="text-red-500">Error generating barcode</div>`;
        }
      }
    });
  };

  const addToGeneration = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const removeFromGeneration = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const generateBarcode = (text: string) => {
    // Format the text based on barcode type if needed
    let formattedText = text;

    if (barcodeType === "EAN13" && /^\d{12}$/.test(text)) {
      // EAN-13 calculation with proper checksum
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(text[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      formattedText = text + checkDigit;
    } else if (barcodeType === "UPC" && /^\d{11}$/.test(text)) {
      // UPC-A calculation with proper checksum
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        sum += parseInt(text[i]) * (i % 2 === 0 ? 3 : 1);
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      formattedText = text + checkDigit;
    }

    return formattedText;
  };

  const handleGenerateBarcodes = async () => {
    if (selectedProducts.length === 0) return;

    setIsGenerating(true);

    try {
      const newBarcodes = selectedProducts.map((product) => {
        const barcode = product.barcode || generateBarcode(product.sku);
        return {
          product,
          barcode,
        };
      });

      setGeneratedBarcodes(newBarcodes);
      barcodeRefs.current = Array(newBarcodes.length).fill(null);

      showNotification(
        "success",
        "Barcodes Generated",
        `Generated ${newBarcodes.length} barcode(s) successfully`
      );
    } catch (err) {
      console.error("Error generating barcodes:", err);
      showNotification(
        "error",
        "Error",
        "Failed to generate barcodes. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustomBarcode = () => {
    if (customBarcode && validateBarcode(customBarcode)) {
      setIsGenerating(true);

      try {
        const formattedBarcode = generateBarcode(customBarcode);
        const customProduct: Product = {
          id: "custom",
          name: "Custom Item",
          sku: customBarcode,
          barcode: formattedBarcode,
          price: 0,
          category: "Custom",
        };

        setGeneratedBarcodes([
          {
            product: customProduct,
            barcode: formattedBarcode,
          },
        ]);
        barcodeRefs.current = [null];

        showNotification(
          "success",
          "Custom Barcode Generated",
          `Barcode type: ${
            barcodeTypes.find((t) => t.value === barcodeType)?.label
          }`
        );
      } catch (err) {
        showNotification(
          "error",
          "Error",
          "Failed to generate custom barcode. Please try again."
        );
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handlePrint = () => {
    if (!barcodesContainerRef.current) return;

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showNotification(
          "error",
          "Print Error",
          "Please allow pop-ups for printing"
        );
        return;
      }

      const barcodesHTML = barcodesContainerRef.current.innerHTML;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              .barcode-item { margin-bottom: 20px; page-break-inside: avoid; }
              svg { max-width: 100%; height: auto; }
              @media print {
                @page { margin: 0.5cm; }
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>
            <div>${barcodesHTML}</div>
            <script>
              window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      showNotification("info", "Printing", "Preparing print dialog...");
    } catch (err) {
      console.error("Print error:", err);
      showNotification(
        "error",
        "Print Error",
        "Failed to open print dialog. Please try again."
      );
    }
  };

  const handleDownload = async (format: "png" | "svg" | "pdf") => {
    if (!barcodesContainerRef.current || generatedBarcodes.length === 0) return;

    setIsDownloading(true);

    try {
      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === "pdf") {
        const canvas = await html2canvas(barcodesContainerRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm" });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`barcodes_${timestamp}.pdf`);

        showNotification(
          "success",
          "PDF Downloaded",
          "Your barcodes have been saved as PDF"
        );
      } else if (format === "png") {
        const canvas = await html2canvas(barcodesContainerRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const link = document.createElement("a");
        link.download = `barcodes_${timestamp}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        showNotification(
          "success",
          "PNG Downloaded",
          "Your barcodes have been saved as PNG"
        );
      } else if (format === "svg") {
        if (barcodeType === "QR") {
          showNotification(
            "error",
            "Format not supported",
            "SVG download is not available for QR codes. Please use PNG instead."
          );
          setIsDownloading(false);
          return;
        }

        let svgContent =
          '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">';
        let yOffset = 20;

        generatedBarcodes.forEach((item, index) => {
          const barcodeElement = barcodeRefs.current[index];
          if (barcodeElement && barcodeElement.querySelector("svg")) {
            const svg = barcodeElement.querySelector("svg")!;
            const svgHeight = parseInt(svg.getAttribute("height") || "100");

            svgContent += `<g transform="translate(20,${yOffset})">
              <text x="0" y="-5" font-family="Arial" font-size="12">${item.product.name} (${item.product.sku})</text>
              ${svg.innerHTML}
            </g>`;
            yOffset += svgHeight + 40;
          }
        });

        svgContent += "</svg>";

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.download = `barcodes_${timestamp}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();

        showNotification(
          "success",
          "SVG Downloaded",
          "Your barcodes have been saved as SVG"
        );
      }
    } catch (err) {
      console.error("Download error:", err);
      showNotification(
        "error",
        "Download Error",
        "Failed to download barcodes. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        showNotification("success", "Copied", "Barcode copied to clipboard")
      )
      .catch((err) => {
        console.error("Copy error:", err);
        showNotification("error", "Copy Error", "Failed to copy to clipboard");
      });
  };

  const saveBarcodesToDatabase = async () => {
    if (generatedBarcodes.length === 0) return;

    if (isUsingMockData || !backendConnected) {
      showNotification(
        "info",
        "Demo Mode",
        "Cannot save to database. Please ensure your backend server is running at http://localhost:5000 and you are logged in."
      );
      return;
    }

    setIsSaving(true);
    let successCount = 0;

    try {
      for (const item of generatedBarcodes) {
        if (item.product.id !== "custom") {
          const success = await ProductService.updateProductBarcode(
            item.product.id,
            item.barcode
          );
          if (success) successCount++;
        }
      }
      if (successCount > 0) {
        showNotification(
          "success",
          "Barcodes Saved",
          `${successCount} barcode(s) saved to database`
        );
        fetchProducts(); // Refresh to show updated data
      } else {
        showNotification(
          "info",
          "Nothing Saved",
          "No barcodes were saved to the database"
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      showNotification(
        "error",
        "Save Error",
        "Failed to save barcodes to database"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <InventoryLayout activeSection="Barcode Generator">
      <div className="p-8">
        {/* Notification display */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-md shadow-lg border-l-4 transition-all duration-300 ${
                notification.type === "success"
                  ? "bg-green-50 border-l-green-500 text-green-800"
                  : notification.type === "error"
                  ? "bg-red-50 border-l-red-500 text-red-800"
                  : "bg-blue-50 border-l-blue-500 text-blue-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs mt-1 opacity-90">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== notification.id)
                    )
                  }
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-6 w-6 text-blue-600" />
                Barcode Generator
                {isUsingMockData && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-orange-600 border-orange-600"
                  >
                    Demo Mode
                  </Badge>
                )}
                {!backendConnected && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-red-600 border-red-600"
                  >
                    Offline
                  </Badge>
                )}
                {authenticationStatus === "unauthenticated" &&
                  backendConnected && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-yellow-600 border-yellow-600"
                    >
                      Not Logged In
                    </Badge>
                  )}
              </h1>
              <p className="text-gray-600 mt-1">
                Generate barcodes for your products and inventory
                {authenticationStatus === "unauthenticated" &&
                  " (Login required)"}
              </p>
            </div>
            <div className="flex gap-2">
              {generatedBarcodes.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    disabled={isDownloading}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    onClick={() => handleDownload("pdf")}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                  {generatedBarcodes.some(
                    (item) => item.product.id !== "custom"
                  ) && (
                    <Button
                      variant="secondary"
                      onClick={saveBarcodesToDatabase}
                      disabled={isSaving || isUsingMockData}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Save to Database
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant={isUsingMockData ? "default" : "destructive"}
            className="mb-6"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {authenticationStatus === "unauthenticated"
                ? "Authentication Required"
                : isUsingMockData
                ? "Demo Mode"
                : "Connection Error"}
            </AlertTitle>
            <AlertDescription>
              {error}
              {authenticationStatus === "unauthenticated" && (
                <div className="mt-2">
                  <p className="font-medium">To access your products:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    <li>Please log in to your account</li>
                    <li>Ensure your session hasn't expired</li>
                    <li>Check that you have the correct permissions</li>
                  </ul>
                </div>
              )}
              {!backendConnected && (
                <div className="mt-2">
                  <p className="font-medium">To connect to your backend:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    <li>
                      Make sure your backend server is running on port 5000
                    </li>
                    <li>
                      Check that the API endpoint '/api/products' is available
                    </li>
                    <li>
                      Verify CORS is configured to allow frontend requests
                    </li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Show login prompt if unauthenticated */}
        {authenticationStatus === "unauthenticated" && backendConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Login Required
                </h3>
                <p className="text-yellow-700 mt-1">
                  You need to be logged in to access your products. Redirecting
                  to login page...
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Product Selection */}
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Products
                  {isUsingMockData && (
                    <Badge variant="outline" className="text-xs">
                      Sample Data
                    </Badge>
                  )}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchProducts}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">
                            SKU: {product.sku}
                          </p>
                          {product.barcode && (
                            <Badge className="bg-green-100 text-green-800">
                              Has Barcode
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          ₹{product.price.toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => addToGeneration(product)}
                          disabled={selectedProducts.some(
                            (p) => p.id === product.id
                          )}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products found</p>
                  <p className="text-sm">
                    {searchTerm
                      ? "Try a different search term"
                      : "Add products to your inventory to see them here"}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Barcode */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Generate Custom Barcode
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customBarcode">Enter Text/Code</Label>
                  <Input
                    id="customBarcode"
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value)}
                    placeholder="Enter text to generate barcode"
                    className={
                      !validationResult.isValid ? "border-red-500" : ""
                    }
                  />
                  {!validationResult.isValid && validationResult.message && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationResult.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="barcodeType">Barcode Type</Label>
                  <select
                    id="barcodeType"
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {barcodeTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {barcodeType === "EAN13" &&
                      "EAN-13: Requires exactly 12 digits (13th digit is calculated)"}
                    {barcodeType === "UPC" &&
                      "UPC-A: Requires exactly 11 digits (12th digit is calculated)"}
                    {barcodeType === "CODE39" &&
                      "Code 39: Letters, numbers and - . $ / + % space"}
                    {barcodeType === "CODE128" &&
                      "Code 128: All ASCII characters"}
                    {barcodeType === "QR" && "QR Code: Any text or data"}
                  </p>
                </div>

                <Button
                  onClick={handleGenerateCustomBarcode}
                  disabled={
                    !customBarcode || !validationResult.isValid || isGenerating
                  }
                  className="w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Generate Custom Barcode"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Generation & Preview */}
          <div className="space-y-6">
            {/* Selected Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Selected Products ({selectedProducts.length})
                </h3>
                {selectedProducts.length > 0 && (
                  <Button
                    onClick={handleGenerateBarcodes}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      "Generate Barcodes"
                    )}
                  </Button>
                )}
              </div>

              {selectedProducts.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromGeneration(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products selected</p>
                  <p className="text-sm">
                    Select products from the list to generate barcodes
                  </p>
                </div>
              )}
            </div>

            {/* Generated Barcodes */}
            {generatedBarcodes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Generated Barcodes</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload("png")}
                      disabled={isDownloading}
                    >
                      PNG
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload("svg")}
                      disabled={isDownloading || barcodeType === "QR"}
                    >
                      SVG
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload("pdf")}
                      disabled={isDownloading}
                    >
                      PDF
                    </Button>
                  </div>
                </div>

                <div className="space-y-4" ref={barcodesContainerRef}>
                  {generatedBarcodes.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            SKU: {item.product.sku}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.barcode)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Barcode Preview */}
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div
                          className="mb-2 flex justify-center"
                          ref={(el) => {
                            barcodeRefs.current[index] = el;
                          }}
                        />
                        <p className="text-sm font-mono text-gray-600">
                          {item.barcode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type:{" "}
                          {
                            barcodeTypes.find((t) => t.value === barcodeType)
                              ?.label
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to use Barcode Generator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">For Products:</h4>
              <ul className="space-y-1">
                <li>• Search and select products from your inventory</li>
                <li>
                  • Products without barcodes will get auto-generated ones
                </li>
                <li>• Existing barcodes will be preserved</li>
                <li>
                  • Click "Save to Database" to permanently store barcodes
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Custom Items:</h4>
              <ul className="space-y-1">
                <li>• Enter any text or number sequence</li>
                <li>• Choose appropriate barcode type</li>
                <li>• Generate instant barcode for printing</li>
                <li>• Download as PDF, PNG, or SVG for your records</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}
