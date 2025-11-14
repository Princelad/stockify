const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");
const { ok, fail } = require("../utils/responder");

/**
 * GET INVENTORY REPORT
 * Purpose: Comprehensive inventory analysis and stock management reporting
 * Features: Stock levels, movements, category breakdown, supplier analysis
 */
const getInventoryReport = async (req, res) => {
  try {
    const {
      period = "last30days",
      category,
      supplier,
      lowStock,
      outOfStock,
    } = req.query;

    // Calculate date range based on period
    const dateRange = getDateRange(period);
    const userFilter = { isActive: true, createdBy: req.user._id };

    // Build filters
    if (category && category !== "all") {
      userFilter.category = category;
    }
    if (supplier && supplier !== "all") {
      userFilter["supplier.name"] = supplier;
    }

    // Get inventory data with stock status filters
    let inventoryFilter = { ...userFilter };
    if (lowStock === "true") {
      inventoryFilter = {
        ...inventoryFilter,
        $expr: { $lte: ["$currentStock", "$minStockLevel"] },
      };
    }
    if (outOfStock === "true") {
      inventoryFilter = {
        ...inventoryFilter,
        currentStock: 0,
      };
    }

    const inventoryData = await Product.find(inventoryFilter)
      .select(
        "name sku category currentStock minStockLevel maxStockLevel costPrice sellingPrice wholesalePrice supplier brand barcode updatedAt"
      )
      .sort({ updatedAt: -1 });

    // Calculate inventory summary
    const inventorySummary = await Product.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          totalRetailValue: {
            $sum: { $multiply: ["$currentStock", "$sellingPrice"] },
          },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ["$currentStock", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get category-wise stock breakdown
    const categoryStock = await Product.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$category",
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          totalStock: { $sum: "$currentStock" },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          totalItems: 1,
          totalValue: 1,
          totalStock: 1,
          lowStockItems: 1,
          _id: 0,
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Get stock movements (based on sales in the period)
    const stockMovements = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $match: {
          "productInfo.createdBy": req.user._id,
        },
      },
      {
        $group: {
          _id: {
            product: "$items.product",
            period: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          outbound: { $sum: "$items.quantity" },
          productName: { $first: "$productInfo.name" },
          category: { $first: "$productInfo.category" },
        },
      },
      {
        $group: {
          _id: "$_id.period",
          totalOutbound: { $sum: "$outbound" },
          products: {
            $push: {
              productId: "$_id.product",
              name: "$productName",
              category: "$category",
              quantity: "$outbound",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get supplier analysis
    const supplierAnalysis = await Product.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$supplier.name",
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          averageStock: { $avg: "$currentStock" },
          lowStockProducts: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          supplier: "$_id",
          totalProducts: 1,
          totalValue: 1,
          averageStock: { $round: ["$averageStock", 2] },
          lowStockProducts: 1,
          _id: 0,
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    const summary =
      inventorySummary.length > 0
        ? inventorySummary[0]
        : {
            totalItems: 0,
            totalValue: 0,
            totalRetailValue: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
          };

    return ok(
      res,
      {
        inventoryData: inventoryData.map((item) => ({
          id: item._id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          currentStock: item.currentStock,
          minStock: item.minStockLevel,
          maxStock: item.maxStockLevel,
          value: item.currentStock * item.costPrice,
          movement: getMovementStatus(item.currentStock, item.minStockLevel),
          lastUpdated: item.updatedAt,
          supplier: item.supplier?.name || "N/A",
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          wholesalePrice: item.wholesalePrice,
        })),
        summary,
        categoryStock,
        stockMovements,
        supplierAnalysis,
        period,
      },
      "Inventory report generated successfully"
    );
  } catch (error) {
    console.error("Error generating inventory report:", error);
    return fail(res, error, "Failed to generate inventory report");
  }
};

/**
 * GET SALES REPORT
 * Purpose: Comprehensive sales analysis and performance reporting
 * Features: Revenue trends, top products, customer analysis, growth metrics
 */
const getSalesReport = async (req, res) => {
  try {
    const {
      period = "last30days",
      customer,
      paymentMethod,
      category,
    } = req.query;

    const dateRange = getDateRange(period);

    // Build sales filter
    const salesFilter = {
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    };

    if (customer && customer !== "all") {
      salesFilter.customer = new mongoose.Types.ObjectId(customer);
    }
    if (paymentMethod && paymentMethod !== "all") {
      salesFilter.paymentMethod = paymentMethod;
    }

    // Get sales data with period grouping
    const salesData = await Sale.aggregate([
      { $match: salesFilter },
      {
        $group: {
          _id: {
            period: getGroupingPeriod(period),
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          transactions: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      {
        $project: {
          period: getPeriodString(period),
          revenue: { $round: ["$revenue", 2] },
          transactions: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
          _id: 0,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Get top products by revenue
    const topProducts = await Sale.aggregate([
      { $match: salesFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            productName: "$items.productName",
          },
          revenue: { $sum: "$items.total" },
          quantity: { $sum: "$items.quantity" },
          transactions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          name: "$_id.productName",
          revenue: { $round: ["$revenue", 2] },
          quantity: 1,
          transactions: 1,
          category: { $arrayElemAt: ["$productInfo.category", 0] },
          _id: 0,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Get sales summary
    const salesSummary = await Sale.aggregate([
      { $match: salesFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalTransactions: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
          totalDiscountGiven: { $sum: "$discountAmount" },
        },
      },
    ]);

    // Calculate growth rate (comparing with previous period)
    const previousPeriodRange = getPreviousPeriodRange(period);
    const previousSales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousPeriodRange.startDate,
            $lte: previousPeriodRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const currentRevenue =
      salesSummary.length > 0 ? salesSummary[0].totalRevenue : 0;
    const previousRevenue =
      previousSales.length > 0 ? previousSales[0].totalRevenue : 0;
    const growthRate =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Get category-wise sales
    const categorySales = await Sale.aggregate([
      { $match: salesFilter },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$productInfo.category", 0] },
          revenue: { $sum: "$items.total" },
          quantity: { $sum: "$items.quantity" },
          transactions: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          revenue: { $round: ["$revenue", 2] },
          quantity: 1,
          transactions: 1,
          _id: 0,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const summary =
      salesSummary.length > 0
        ? {
            ...salesSummary[0],
            growthRate: Math.round(growthRate * 100) / 100,
          }
        : {
            totalRevenue: 0,
            totalTransactions: 0,
            averageOrderValue: 0,
            totalDiscountGiven: 0,
            growthRate: 0,
          };

    return ok(
      res,
      {
        salesData,
        topProducts,
        categorySales,
        summary,
        period,
      },
      "Sales report generated successfully"
    );
  } catch (error) {
    console.error("Error generating sales report:", error);
    return fail(res, error, "Failed to generate sales report");
  }
};

/**
 * GET TAX REPORT
 * Purpose: GST and tax compliance reporting
 * Features: GST calculations, tax rates breakdown, compliance tracking
 */
// Tax report functionality removed per project decision to deprecate Tax Report API
// Previous implementation (GST/tax calculations and exports) was intentionally removed.
// If tax reporting is required again in the future, reintroduce a dedicated controller
// with small, well-scoped aggregation queries and corresponding route registration.

// Helper functions
const getDateRange = (period) => {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case "today":
      startDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      break;
    case "yesterday":
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      endDate.setTime(startDate.getTime());
      break;
    case "last7days":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "last30days":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "last90days":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "lastyear":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

const getPreviousPeriodRange = (period) => {
  const currentRange = getDateRange(period);
  const duration =
    currentRange.endDate.getTime() - currentRange.startDate.getTime();

  return {
    startDate: new Date(currentRange.startDate.getTime() - duration),
    endDate: new Date(currentRange.startDate.getTime()),
  };
};

const getGroupingPeriod = (period) => {
  switch (period) {
    case "today":
    case "yesterday":
      return { $hour: "$createdAt" };
    case "last7days":
    case "last30days":
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    case "last90days":
    case "lastyear":
      return { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
};

const getPeriodString = (period) => {
  switch (period) {
    case "today":
    case "yesterday":
      return {
        $concat: [
          { $toString: "$_id.day" },
          "/",
          { $toString: "$_id.month" },
          "/",
          { $toString: "$_id.year" },
        ],
      };
    default:
      return "$_id.period";
  }
};

const getMovementStatus = (currentStock, minStock) => {
  if (currentStock === 0) return "out-of-stock";
  if (currentStock <= minStock) return "low";
  if (currentStock <= minStock * 2) return "medium";
  return "high";
};

const generateMockTaxReturns = () => {
  const months = ["January", "February", "March", "April", "May", "June"];
  return months.map((month) => ({
    month,
    gstr1Filed: Math.random() > 0.3,
    gstr3bFiled: Math.random() > 0.2,
    dueDate: `${Math.floor(Math.random() * 20) + 10} ${month} 2024`,
    status:
      Math.random() > 0.7
        ? "filed"
        : Math.random() > 0.5
        ? "pending"
        : "overdue",
  }));
};

const calculateComplianceScore = (returns) => {
  const totalReturns = returns.length * 2; // GSTR1 + GSTR3B
  const filedReturns = returns.reduce(
    (count, r) => count + (r.gstr1Filed ? 1 : 0) + (r.gstr3bFiled ? 1 : 0),
    0
  );
  return Math.round((filedReturns / totalReturns) * 100);
};

module.exports = {
  getInventoryReport,
  getSalesReport,
};
