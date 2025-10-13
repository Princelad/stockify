const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const pdfProcessingService = require("../services/pdfProcessingService");
const fs = require("fs");

/**
 * GET DASHBOARD STATISTICS
 * Purpose: Provides comprehensive business overview for dashboard
 * Features: Stock alerts, sales trends, supplier analytics, multi-tier pricing insights
 */
const getDashboardStats = async (req, res) => {
  try {
    // Filter by current user's products only
    const userFilter = { isActive: true, createdBy: req.user._id };

    // Basic product counts
    const totalProducts = await Product.countDocuments(userFilter);
    const lowStockProducts = await Product.countDocuments({
      ...userFilter,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    });
    const outOfStockProducts = await Product.countDocuments({
      ...userFilter,
      currentStock: 0,
    });

    // Multi-tier pricing analysis
    const pricingAnalysis = await Product.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: null,
          totalCostValue: {
            $sum: { $multiply: ["$currentStock", "$costPrice"] },
          },
          totalRetailValue: {
            $sum: { $multiply: ["$currentStock", "$sellingPrice"] },
          },
          totalWholesaleValue: {
            $sum: { $multiply: ["$currentStock", "$wholesalePrice"] },
          },
          avgRetailMargin: {
            $avg: {
              $divide: [
                { $subtract: ["$sellingPrice", "$costPrice"] },
                "$costPrice",
              ],
            },
          },
          avgWholesaleMargin: {
            $avg: {
              $divide: [
                { $subtract: ["$wholesalePrice", "$costPrice"] },
                "$costPrice",
              ],
            },
          },
        },
      },
    ]);

    // Supplier analytics
    const supplierStats = await Product.aggregate([
      {
        $match: { ...userFilter, "supplier.name": { $exists: true, $ne: "" } },
      },
      {
        $group: {
          _id: "$supplier.name",
          productCount: { $sum: 1 },
          totalStockValue: {
            $sum: { $multiply: ["$currentStock", "$costPrice"] },
          },
          avgCostPrice: { $avg: "$costPrice" },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
    ]);

    // Category distribution with stock levels
    const categoryStats = await Product.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          totalValue: {
            $sum: { $multiply: ["$currentStock", "$sellingPrice"] },
          },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { productCount: -1 } },
    ]);

    // Recent stock movements (products added/updated recently)
    const recentActivity = await Product.find(userFilter)
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name sku currentStock updatedAt category supplier.name")
      .populate("createdBy", "name")
      .lean();

    // Top selling products (by totalSold)
    const topSellingProducts = await Product.find({
      ...userFilter,
      totalSold: { $gt: 0 },
    })
      .sort({ totalSold: -1 })
      .limit(5)
      .select("name sku totalSold sellingPrice category lastSoldDate")
      .lean();

    // Critical alerts
    const criticalAlerts = await Product.find({
      ...userFilter,
      currentStock: 0,
    })
      .select("name sku category supplier.name")
      .lean();

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalSuppliers: supplierStats.length,
          totalCategories: categoryStats.length,
        },
        pricingAnalysis: pricingAnalysis[0] || {},
        supplierStats,
        categoryStats,
        recentActivity,
        topSellingProducts,
        criticalAlerts,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * GET ALL PRODUCTS WITH ADVANCED FILTERING
 * Purpose: Product listing with multi-supplier support and comprehensive filters
 * Features: Search, supplier filter, price range, stock status, sorting
 */
const { ok, fail } = require("../utils/responder");

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      brand,
      supplier,
      lowStock,
      outOfStock,
      priceMin,
      priceMax,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build dynamic filter with user filtering
    const filter = {
      isActive: true,
      createdBy: req.user._id, // Filter by current user
    };

    // Multi-field search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "supplier.name": { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Brand filter
    if (brand && brand !== "all") {
      filter.brand = brand;
    }

    // Supplier filter
    if (supplier && supplier !== "all") {
      filter["supplier.name"] = supplier;
    }

    // Stock status filters
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$currentStock", "$minStockLevel"] };
    }
    if (outOfStock === "true") {
      filter.currentStock = 0;
    }

    // Price range filter
    if (priceMin || priceMax) {
      filter.sellingPrice = {};
      if (priceMin) filter.sellingPrice.$gte = parseFloat(priceMin);
      if (priceMax) filter.sellingPrice.$lte = parseFloat(priceMax);
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "name email")
      .lean();

    const total = await Product.countDocuments(filter);

    return ok(res, {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return fail(res, error, "Error fetching products");
  }
};

/**
 * MULTI-SUPPLIER PRODUCT MANAGEMENT
 * Purpose: Handle same products from different suppliers with unified inventory
 * Used by: Supplier comparison, purchase decisions, cost analysis
 */
const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierName } = req.params;

    const products = await Product.find({
      "supplier.name": { $regex: supplierName, $options: "i" },
      isActive: true,
      createdBy: req.user._id, // Filter by current user
    }).sort({ name: 1 });

    // Group same products from different suppliers
    const productGroups = {};
    products.forEach((product) => {
      const key = `${product.name.toLowerCase()}-${product.category.toLowerCase()}`;
      if (!productGroups[key]) {
        productGroups[key] = {
          productName: product.name,
          category: product.category,
          suppliers: [],
        };
      }
      productGroups[key].suppliers.push({
        supplier: product.supplier,
        sku: product.sku,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        currentStock: product.currentStock,
        lastUpdated: product.updatedAt,
      });
    });

    res.json({
      success: true,
      data: {
        supplier: supplierName,
        totalProducts: products.length,
        productGroups: Object.values(productGroups),
      },
    });
  } catch (error) {
    console.error("Get products by supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching supplier products",
      error: error.message,
    });
  }
};

/**
 * BULK IMPORT PRODUCTS FROM SUPPLIERS
 * Purpose: Import complete product catalogs from suppliers
 * Features: Duplicate handling, validation, supplier linking
 */
const bulkImportProducts = async (req, res) => {
  try {
    const { products, supplierInfo, importOptions = {} } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return fail(res, null, "Products array is required", 400);
    }

    const results = {
      successful: [],
      failed: [],
      duplicates: [],
      updated: [],
    };

    for (let productData of products) {
      try {
        // Add supplier info to each product
        const enrichedProduct = {
          ...productData,
          supplier: supplierInfo,
          createdBy: req.user._id,
        };

        // Check for existing SKU
        const existingProduct = await Product.findOne({
          sku: productData.sku,
          createdBy: req.user._id,
        }).lean();

        if (existingProduct) {
          if (importOptions.updateExisting) {
            // Update existing product
            const updated = await Product.findByIdAndUpdate(
              existingProduct._id,
              { ...enrichedProduct, createdBy: req.user._id },
              { new: true, runValidators: true }
            );
            results.updated.push(updated);
          } else {
            results.duplicates.push({
              sku: productData.sku,
              name: productData.name,
              reason: "SKU already exists",
            });
          }
        } else {
          // Create new product
          const newProduct = new Product(enrichedProduct);
          const saved = await newProduct.save();
          results.successful.push(saved);
        }
      } catch (error) {
        results.failed.push({
          product: productData,
          error: error.message,
        });
      }
    }

    return ok(
      res,
      {
        summary: {
          total: products.length,
          successful: results.successful.length,
          failed: results.failed.length,
          duplicates: results.duplicates.length,
          updated: results.updated.length,
        },
        results,
      },
      "Bulk import completed"
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return fail(res, error, "Error during bulk import");
  }
};

/**
 * GOODS IN/OUT TRACKING
 * Purpose: Track products coming in and going out of the shop
 * Features: Stock movement logging, delivery tracking, sales integration
 */
const trackStockMovement = async (req, res) => {
  try {
    const {
      productId,
      movementType, // 'in' or 'out'
      quantity,
      reason,
      referenceNumber,
      supplierInfo,
      customerInfo,
    } = req.body;

    const product = await Product.findOne({
      _id: productId,
      createdBy: req.user._id, // Ensure user can only track their own products
    });
    if (!product) {
      return fail(
        res,
        null,
        "Product not found or you do not have permission to access it",
        404
      );
    }

    const oldStock = product.currentStock;
    let newStock;

    if (movementType === "in") {
      newStock = oldStock + quantity;
      product.currentStock = newStock;
    } else if (movementType === "out") {
      newStock = Math.max(0, oldStock - quantity);
      product.currentStock = newStock;

      // Update sales tracking
      product.totalSold = (product.totalSold || 0) + quantity;
      product.lastSoldDate = new Date();
    }

    await product.save();

    // Create movement record (you might want a separate StockMovement model)
    const movementRecord = {
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      movementType,
      quantity,
      oldStock,
      newStock,
      reason,
      referenceNumber,
      supplierInfo,
      customerInfo,
      performedBy: req.user._id,
      timestamp: new Date(),
    };

    return ok(
      res,
      {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          oldStock,
          newStock,
        },
        movement: movementRecord,
      },
      `Stock ${movementType === "in" ? "received" : "issued"} successfully`
    );
  } catch (error) {
    console.error("Stock movement error:", error);
    return fail(res, error, "Error tracking stock movement");
  }
};

/**
 * MULTI-TIER PRICING SUPPORT
 * Purpose: Get product with different pricing for retail vs wholesale
 * Features: Customer type-based pricing, bulk pricing tiers
 */
const getProductPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const { customerType = "retail", quantity = 1 } = req.query;

    const product = await Product.findOne({
      _id: productId,
      createdBy: req.user._id, // Ensure user can only access their own products
    });
    if (!product) {
      return fail(
        res,
        null,
        "Product not found or you do not have permission to access it",
        404
      );
    }

    let applicablePrice;
    let priceType;

    // Determine pricing based on customer type and quantity
    if (customerType === "wholesale" && product.wholesalePrice) {
      applicablePrice = product.wholesalePrice;
      priceType = "wholesale";
    } else {
      applicablePrice = product.sellingPrice;
      priceType = "retail";
    }

    // Calculate total for quantity
    const totalPrice = applicablePrice * quantity;
    const totalCost = product.costPrice * quantity;
    const profit = totalPrice - totalCost;
    const profitMargin = ((profit / totalCost) * 100).toFixed(2);

    return ok(res, {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
      },
      pricing: {
        costPrice: product.costPrice,
        retailPrice: product.sellingPrice,
        wholesalePrice: product.wholesalePrice,
        applicablePrice,
        priceType,
        quantity,
        totalPrice,
        profit,
        profitMargin: `${profitMargin}%`,
      },
      availability: {
        inStock: product.currentStock >= quantity,
        availableQuantity: product.currentStock,
        isLowStock: product.currentStock <= product.minStockLevel,
      },
    });
  } catch (error) {
    console.error("Get product pricing error:", error);
    return fail(res, error, "Error fetching product pricing");
  }
};

/**
 * SALES INTEGRATION - UPDATE STOCK AFTER SALE
 * Purpose: Automatically update stock levels when generating customer bills
 * Features: Multi-product updates, stock validation, sales tracking
 */
const processSale = async (req, res) => {
  try {
    const {
      products, // Array of {productId, quantity, priceUsed}
      customerInfo,
      saleReference,
      paymentMethod,
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const saleResults = [];
      let totalSaleValue = 0;

      for (let saleItem of products) {
        const product = await Product.findOne({
          _id: saleItem.productId,
          createdBy: req.user._id, // Ensure user can only process sales for their own products
        }).session(session);

        if (!product) {
          throw new Error(
            `Product not found or access denied: ${saleItem.productId}`
          );
        }

        if (product.currentStock < saleItem.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${saleItem.quantity}`
          );
        }

        // Update stock
        product.currentStock -= saleItem.quantity;
        product.totalSold = (product.totalSold || 0) + saleItem.quantity;
        product.lastSoldDate = new Date();

        await product.save({ session });

        const itemTotal = saleItem.quantity * saleItem.priceUsed;
        totalSaleValue += itemTotal;

        saleResults.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          quantitySold: saleItem.quantity,
          priceUsed: saleItem.priceUsed,
          itemTotal,
          remainingStock: product.currentStock,
        });
      }

      await session.commitTransaction();

      res.json({
        success: true,
        message: "Sale processed successfully",
        data: {
          saleReference,
          customerInfo,
          products: saleResults,
          totalSaleValue,
          paymentMethod,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Process sale error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing sale",
      error: error.message,
    });
  }
};

// ... (keep other existing functions like getProduct, createProduct, updateProduct, deleteProduct, etc.)

/**
 * GET SINGLE PRODUCT BY ID
 */
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user._id, // Ensure user can only access their own products
    })
      .populate("createdBy", "name email")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

/**
 * CREATE NEW PRODUCT
 */
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Clean empty supplierId - convert empty string to undefined
    if (productData.supplierId === "" || productData.supplierId === null) {
      delete productData.supplierId;
    }

    // Handle supplier reference if supplierId is provided
    if (productData.supplierId) {
      // Verify supplier exists and belongs to user
      const Supplier = require("../models/Supplier");
      const supplierExists = await Supplier.findOne({
        _id: productData.supplierId,
        createdBy: req.user._id,
        isActive: true,
      });

      if (!supplierExists) {
        return fail(res, null, "Invalid supplier selected", 400);
      }

      // Also populate supplier info for backward compatibility
      productData.supplier = {
        name: supplierExists.name,
        contact: supplierExists.phone,
        email: supplierExists.email,
        address: supplierExists.address?.full || "",
      };
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    await savedProduct.populate("createdBy", "name email");

    // If product has a category, ensure it exists in Category collection (per-tenant)
    if (savedProduct.category) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({
          name: {
            $regex: new RegExp(`^${savedProduct.category.trim()}$`, "i"),
          },
          isActive: true,
          createdBy: req.user._id,
        }).lean();

        if (!existingCategory) {
          // Create category from product if it doesn't exist
          const newCategory = new Category({
            name: savedProduct.category.trim(),
            type: "from_products",
            isDefault: false,
            isPopular: false,
            createdBy: req.user._id,
          });
          await newCategory.save();
        }
      } catch (categoryError) {
        console.error("Error handling category for product:", categoryError);
        // Don't fail the product creation if category creation fails
      }
    }

    return ok(res, savedProduct, "Product created successfully", 201);
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return fail(res, null, "Product with this SKU already exists", 400);
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return fail(res, { errors }, "Validation failed", 400);
    }

    return fail(res, error, "Error creating product");
  }
};

/**
 * UPDATE EXISTING PRODUCT
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id, // Ensure user can only update their own products
      },
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!product) {
      return fail(
        res,
        null,
        "Product not found or you do not have permission to update it",
        404
      );
    }

    // If product has a new category, ensure it exists in Category collection
    if (product.category && req.body.category) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${product.category.trim()}$`, "i") },
          isActive: true,
          createdBy: req.user._id,
        }).lean();

        if (!existingCategory) {
          // Create category from product if it doesn't exist
          const newCategory = new Category({
            name: product.category.trim(),
            type: "from_products",
            isDefault: false,
            isPopular: false,
            createdBy: req.user._id,
          });
          await newCategory.save();
        }
      } catch (categoryError) {
        console.error(
          "Error handling category for product update:",
          categoryError
        );
        // Don't fail the product update if category creation fails
      }
    }

    return ok(res, product, "Product updated successfully");
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === 11000) {
      return fail(res, null, "Product with this SKU already exists", 400);
    }

    return fail(res, error, "Error updating product");
  }
};

/**
 * DELETE PRODUCT (SOFT DELETE)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id, // Ensure user can only delete their own products
      },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to delete it",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

/**
 * UPDATE STOCK LEVELS
 */
const updateStock = async (req, res) => {
  try {
    const { productId, quantity, operation = "set", reason } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID or quantity",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      createdBy: req.user._id, // Ensure user can only update stock for their own products
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to update it",
      });
    }

    const oldStock = product.currentStock;
    let newStock;

    switch (operation) {
      case "add":
        newStock = oldStock + quantity;
        break;
      case "subtract":
        newStock = Math.max(0, oldStock - quantity);
        break;
      case "set":
      default:
        newStock = quantity;
        break;
    }

    product.currentStock = newStock;
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        oldStock,
        newStock,
        operation,
        reason: reason || "Manual adjustment",
      },
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating stock",
      error: error.message,
    });
  }
};

/**
 * GET CATEGORIES LIST
 */
const getCategories = async (req, res) => {
  try {
    const userFilter = { isActive: true, createdBy: req.user._id };

    const categories = await Product.distinct("category", userFilter);
    const categoriesWithCount = await Product.aggregate([
      { $match: userFilter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.filter((cat) => cat),
        categoriesWithCount: categoriesWithCount.filter((cat) => cat._id),
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

/**
 * GET SUPPLIERS LIST
 */
const getSuppliers = async (req, res) => {
  try {
    const userFilter = { isActive: true, createdBy: req.user._id };

    const suppliers = await Product.aggregate([
      {
        $match: { ...userFilter, "supplier.name": { $exists: true, $ne: "" } },
      },
      {
        $group: {
          _id: "$supplier.name",
          contact: { $first: "$supplier.contact" },
          email: { $first: "$supplier.email" },
          address: { $first: "$supplier.address" },
          productCount: { $sum: 1 },
          totalStockValue: {
            $sum: { $multiply: ["$currentStock", "$costPrice"] },
          },
        },
      },
      { $sort: { productCount: -1 } },
    ]);

    // Map the suppliers to match the expected frontend format
    const mappedSuppliers = suppliers.map((supplier) => ({
      _id: supplier._id, // Using supplier name as _id since we group by name
      name: supplier._id,
      contact: supplier.contact || "",
      email: supplier.email || "",
      address: supplier.address || "",
      productCount: supplier.productCount,
      totalValue: supplier.totalStockValue,
    }));

    res.json({
      success: true,
      data: mappedSuppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching suppliers",
      error: error.message,
    });
  }
};

/**
 * PDF BULK IMPORT - PROCESS PDF FILE
 * Purpose: Extract product data from PDF files using AI/ML techniques
 * Features: Multiple extraction methods, intelligent field mapping, validation
 */
const processPDFImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    console.log("Processing PDF file:", req.file.filename);

    const {
      supplierName = "PDF Import",
      supplierContact = "",
      supplierEmail = "",
      supplierAddress = "",
      defaultCategory = "Imported",
      priceType = "selling", // 'selling' or 'cost'
    } = req.body;

    // Create supplier info
    const supplierInfo = {
      name: supplierName,
      contact: supplierContact,
      email: supplierEmail,
      address: supplierAddress,
    };

    // Process PDF file
    const extractionResult = await pdfProcessingService.processPDF(
      req.file.path,
      {
        defaultCategory,
        priceType,
        supplierInfo,
      }
    );

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }

    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to process PDF file",
        error: extractionResult.error,
      });
    }

    const { products, summary } = extractionResult.data;

    // Enhance products with user and supplier info
    const enhancedProducts = products.map((product) => ({
      ...product,
      supplier: supplierInfo,
      createdBy: req.user._id,
      category: product.category || defaultCategory,
    }));

    res.json({
      success: true,
      message: "PDF processed successfully",
      data: {
        extractionSummary: summary,
        products: enhancedProducts,
        preview: enhancedProducts.slice(0, 5), // First 5 products for preview
        supplierInfo,
        recommendations: {
          totalProducts: enhancedProducts.length,
          estimatedSuccessRate: summary.confidence,
          fieldCoverage: summary.fieldsFound,
          suggestedActions: generateImportSuggestions(
            summary,
            enhancedProducts
          ),
        },
      },
    });
  } catch (error) {
    console.error("PDF import processing error:", error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error processing PDF file",
      error: error.message,
    });
  }
};

/**
 * PDF BULK IMPORT - CONFIRM AND IMPORT
 * Purpose: Import products after user confirmation and any manual adjustments
 */
const confirmPDFImport = async (req, res) => {
  try {
    const { products, supplierInfo, importOptions = {} } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided for import",
      });
    }

    // Validate products before import
    const validationResults = validateProductsForImport(products);

    if (validationResults.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validationResults.errors,
        validProducts: validationResults.validProducts,
      });
    }

    // Use existing bulk import functionality
    const importResult = await bulkImportProducts(
      {
        body: {
          products: validationResults.validProducts,
          supplierInfo,
          importOptions,
        },
        user: req.user,
      },
      res
    );

    // Don't call res.json again since bulkImportProducts already sends response
    return;
  } catch (error) {
    console.error("PDF import confirmation error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming PDF import",
      error: error.message,
    });
  }
};

/**
 * PREVIEW PDF EXTRACTION
 * Purpose: Show extracted data without importing for user review
 */
const previewPDFExtraction = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const extractionResult = await pdfProcessingService.processPDF(
      req.file.path
    );

    // Clean up file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }

    if (!extractionResult.success) {
      return res.status(400).json(extractionResult);
    }

    // Debug logging
    console.log("📊 PDF Extraction Results:");
    console.log(
      "- Total products found:",
      extractionResult.data.products.length
    );
    console.log("- Extraction method:", extractionResult.data.summary.method);
    console.log("- Confidence:", extractionResult.data.summary.confidence);
    console.log(
      "- Sample products:",
      extractionResult.data.products.slice(0, 3)
    );

    res.json({
      success: true,
      message: "PDF extraction preview generated",
      data: {
        summary: extractionResult.data.summary,
        sampleProducts: extractionResult.data.products.slice(0, 10),
        extractedText:
          extractionResult.data.extractedText.substring(0, 1000) + "...",
        recommendations: {
          confidence: extractionResult.data.summary.confidence,
          suggestedMethod: extractionResult.data.summary.method,
          fieldQuality: analyzeFieldQuality(extractionResult.data.products),
        },
      },
    });
  } catch (error) {
    console.error("PDF preview error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error generating PDF preview",
      error: error.message,
    });
  }
};

/**
 * Helper Functions for PDF Import
 */
function generateImportSuggestions(summary, products) {
  const suggestions = [];

  if (summary.confidence < 0.5) {
    suggestions.push(
      "Low confidence extraction. Consider manual review of products."
    );
  }

  if (summary.fieldsFound.price && summary.fieldsFound.price.percentage < 80) {
    suggestions.push(
      "Many products missing price information. Consider adding default pricing."
    );
  }

  if (summary.fieldsFound.sku && summary.fieldsFound.sku.percentage < 50) {
    suggestions.push(
      "SKU information is limited. System will auto-generate SKUs."
    );
  }

  if (products.length > 100) {
    suggestions.push(
      "Large import detected. Consider importing in smaller batches."
    );
  }

  return suggestions;
}

function validateProductsForImport(products) {
  const errors = [];
  const validProducts = [];

  products.forEach((product, index) => {
    const productErrors = [];

    // Validate required fields
    if (!product.name || product.name.trim().length < 2) {
      productErrors.push(
        `Product ${
          index + 1
        }: Name is required and must be at least 2 characters`
      );
    }

    if (!product.sellingPrice || product.sellingPrice <= 0) {
      productErrors.push(
        `Product ${index + 1}: Valid selling price is required`
      );
    }

    if (product.currentStock < 0) {
      productErrors.push(`Product ${index + 1}: Stock cannot be negative`);
    }

    if (productErrors.length === 0) {
      validProducts.push({
        ...product,
        name: product.name.trim(),
        sku: product.sku || generateSKU(product.name),
        minStockLevel: product.minStockLevel || 10,
        isActive: true,
      });
    } else {
      errors.push(...productErrors);
    }
  });

  return { errors, validProducts };
}

function analyzeFieldQuality(products) {
  if (products.length === 0) return {};

  const requiredFields = ["name", "sellingPrice", "currentStock"];
  const optionalFields = ["sku", "category", "brand", "description"];

  const quality = {};

  [...requiredFields, ...optionalFields].forEach((field) => {
    const filledCount = products.filter(
      (p) => p[field] && p[field] !== ""
    ).length;
    const percentage = Math.round((filledCount / products.length) * 100);

    quality[field] = {
      filled: filledCount,
      total: products.length,
      percentage,
      status:
        percentage >= 90
          ? "excellent"
          : percentage >= 70
          ? "good"
          : percentage >= 50
          ? "fair"
          : "poor",
    };
  });

  return quality;
}

function generateSKU(name) {
  if (!name) return "SKU" + Date.now();

  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return (cleaned.substring(0, 6) + timestamp).padEnd(10, "0");
}

/**
 * SEARCH PRODUCTS FOR BILLING
 * Purpose: Search products specifically for billing/sales with stock availability
 * Returns products with current stock and pricing info for POS
 */
const searchProductsForBilling = async (req, res) => {
  try {
    const { q: search, limit = 20 } = req.query;

    if (!search || search.trim().length < 2) {
      return ok(res, { products: [] });
    }

    // Search products with multi-field matching
    const filter = {
      isActive: true,
      createdBy: req.user._id,
      currentStock: { $gt: 0 }, // Only show products in stock
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ],
    };

    const products = await Product.find(filter)
      .select(
        "name sku sellingPrice wholesalePrice currentStock category brand barcode description"
      )
      .sort({ name: 1 })
      .limit(parseInt(limit));

    return ok(
      res,
      {
        products,
        total: products.length,
      },
      `Found ${products.length} products`
    );
  } catch (error) {
    console.error("Search products for billing error:", error);
    return fail(res, error, "Error searching products");
  }
};

module.exports = {
  // Core CRUD
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
};
