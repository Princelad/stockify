const express = require("express");
const router = express.Router();
const {
  // Core CRUD operations
  getDashboardStats,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,

  // Multi-supplier support
  getProductsBySupplier,

  // Bulk operations
  bulkImportProducts,

  // PDF Import operations
  processPDFImport,
  confirmPDFImport,
  previewPDFExtraction,

  // Stock tracking
  trackStockMovement,

  // Pricing
  getProductPricing,

  // Sales integration
  processSale,

  // Billing search
  searchProductsForBilling,

  // Utilities
  getCategories,
  getSuppliers,
} = require("../controllers/productController");

const { validateProduct } = require("../middleware/validation");
const auth = require("../middleware/auth");
const { uploadPDF, handleUploadError } = require("../middleware/uploadPDF");

// =====================================================
// MIDDLEWARE - All routes require authentication
// =====================================================
router.use(auth);

// =====================================================
// DASHBOARD & ANALYTICS ROUTES
// =====================================================

/**
 * GET /api/products/dashboard-stats
 * Purpose: Get comprehensive dashboard statistics
 * Used by: Dashboard home page
 * Features: Stock alerts, pricing analysis, supplier stats
 */
router.get("/dashboard-stats", getDashboardStats);

// =====================================================
// UTILITY ROUTES (Categories, Suppliers)
// =====================================================

/**
 * GET /api/products/categories
 * Purpose: Get all product categories with counts
 * Used by: Dropdown filters, category management
 */
router.get("/categories", getCategories);

/**
 * GET /api/products/suppliers
 * Purpose: Get all suppliers with their product counts and analytics
 * Used by: Supplier management, procurement planning
 */
router.get("/suppliers", getSuppliers);

// =====================================================
// MULTI-SUPPLIER SUPPORT ROUTES
// =====================================================

/**
 * GET /api/products/supplier/:supplierName
 * Purpose: Get all products from a specific supplier
 * Used by: Supplier product comparison, procurement
 * Features: Groups same products from different suppliers
 */
router.get("/supplier/:supplierName", getProductsBySupplier);

// =====================================================
// PRICING ROUTES
// =====================================================

/**
 * GET /api/products/:productId/pricing
 * Purpose: Get product with multi-tier pricing (retail/wholesale)
 * Used by: Sales page, price calculation, customer quotes
 * Query params: customerType (retail/wholesale), quantity
 */
router.get("/:productId/pricing", getProductPricing);

// =====================================================
// STOCK MANAGEMENT ROUTES
// =====================================================

/**
 * POST /api/products/update-stock
 * Purpose: Update stock levels (add/subtract/set)
 * Used by: Stock adjustments, inventory corrections
 * Body: { productId, quantity, operation, reason }
 */
router.post("/update-stock", updateStock);

/**
 * POST /api/products/stock-movement
 * Purpose: Track goods coming in and going out
 * Used by: Delivery tracking, stock movement logging
 * Body: { productId, movementType, quantity, reason, referenceNumber }
 */
router.post("/stock-movement", trackStockMovement);

// =====================================================
// BULK OPERATIONS ROUTES
// =====================================================

/**
 * POST /api/products/bulk-import
 * Purpose: Import product catalogs from suppliers
 * Used by: Bulk product import, supplier catalog updates
 * Body: { products: [], supplierInfo: {}, importOptions: {} }
 */
router.post("/bulk-import", bulkImportProducts);

// =====================================================
// PDF BULK IMPORT ROUTES
// =====================================================

/**
 * POST /api/products/pdf-import/preview
 * Purpose: Preview PDF extraction without importing
 * Used by: PDF upload preview, extraction validation
 * Body: FormData with pdfFile
 */
router.post(
  "/pdf-import/preview",
  uploadPDF,
  handleUploadError,
  previewPDFExtraction
);

/**
 * POST /api/products/pdf-import/process
 * Purpose: Process PDF and extract product data for review
 * Used by: PDF product extraction, bulk import preparation
 * Body: FormData with pdfFile + supplier info
 */
router.post(
  "/pdf-import/process",
  uploadPDF,
  handleUploadError,
  processPDFImport
);

/**
 * POST /api/products/pdf-import/confirm
 * Purpose: Confirm and import products after user review/editing
 * Used by: Final step of PDF import process
 * Body: { products: [], supplierInfo: {}, importOptions: {} }
 */
router.post("/pdf-import/confirm", confirmPDFImport);

// =====================================================
// SALES INTEGRATION ROUTES
// =====================================================

/**
 * POST /api/products/process-sale
 * Purpose: Process sale and automatically update stock levels
 * Used by: Sales/billing page, POS integration
 * Body: { products: [], customerInfo: {}, saleReference, paymentMethod }
 */
router.post("/process-sale", processSale);

/**
 * GET /api/products/search/billing
 * Purpose: Search products for billing/POS with stock availability
 * Used by: Billing page product search, POS product lookup
 * Query params: q (search term), limit (default: 20)
 * Returns: Products with current stock > 0
 */
router.get("/search/billing", searchProductsForBilling);

// =====================================================
// ROUTE DOCUMENTATION & TESTING
// =====================================================

/**
 * GET /api/products/test/routes
 * Purpose: List all available routes for testing/documentation
 * Used by: Development, API documentation
 */
router.get("/test/routes", (req, res) => {
  res.json({
    success: true,
    message: "Product API Routes",
    routes: {
      dashboard: {
        "GET /dashboard-stats": "Get dashboard statistics and analytics",
      },
      utilities: {
        "GET /categories": "Get all product categories",
        "GET /suppliers": "Get all suppliers with analytics",
      },
      multiSupplier: {
        "GET /supplier/:supplierName": "Get products by supplier",
      },
      pricing: {
        "GET /:productId/pricing": "Get multi-tier pricing for product",
      },
      stockManagement: {
        "POST /update-stock": "Update product stock levels",
        "POST /stock-movement": "Track stock movements (in/out)",
      },
      bulkOperations: {
        "POST /bulk-import": "Bulk import products from suppliers",
        "POST /pdf-import/preview": "Preview PDF extraction without importing",
        "POST /pdf-import/process": "Process PDF and extract product data",
        "POST /pdf-import/confirm": "Confirm and import PDF extracted products",
      },
      salesIntegration: {
        "POST /process-sale": "Process sale and update stock automatically",
      },
      crud: {
        "GET /": "Get products with filtering and pagination",
        "GET /:id": "Get single product details",
        "POST /": "Create new product",
        "PUT /:id": "Update existing product",
        "DELETE /:id": "Delete product (soft delete)",
      },
    },
    examples: {
      getProducts:
        "/api/products?page=1&limit=10&search=iphone&category=electronics&lowStock=true",
      getSupplierProducts: "/api/products/supplier/Apple%20Distributor",
      getPricing:
        "/api/products/64f7b8e8c5d4e1234567890a/pricing?customerType=wholesale&quantity=5",
      updateStock:
        'POST /api/products/update-stock { "productId": "...", "quantity": 50, "operation": "add" }',
      processSale:
        'POST /api/products/process-sale { "products": [...], "customerInfo": {...} }',
      pdfImport:
        "POST /api/products/pdf-import/process (FormData with pdfFile + supplier info)",
    },
  });
});

// =====================================================
// CORE CRUD ROUTES
// =====================================================

/**
 * GET /api/products
 * Purpose: Get products list with advanced filtering and pagination
 * Used by: Inventory page, product selection, search
 * Query params: page, limit, search, category, brand, supplier, lowStock, outOfStock, priceMin, priceMax, sortBy, sortOrder
 */
router.get("/", getProducts);

/**
 * GET /api/products/:id
 * Purpose: Get single product details
 * Used by: Product details page, edit forms, sales product info
 */
router.get("/:id", getProduct);

/**
 * POST /api/products
 * Purpose: Create new product
 * Used by: Add product form, bulk import
 * Middleware: validateProduct for input validation
 */
router.post("/", validateProduct, createProduct);

/**
 * PUT /api/products/:id
 * Purpose: Update existing product
 * Used by: Edit product form, bulk updates
 * Middleware: validateProduct for input validation
 */
router.put("/:id", validateProduct, updateProduct);

/**
 * DELETE /api/products/:id
 * Purpose: Delete product (soft delete - sets isActive: false)
 * Used by: Delete product action, bulk delete
 */
router.delete("/:id", deleteProduct);

module.exports = router;
