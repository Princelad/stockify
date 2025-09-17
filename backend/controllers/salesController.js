const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");

/**
 * Get all sales with pagination and filters
 */
const getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
    } = req.query;

    const filters = {};

    if (customer) filters.customer = customer;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(filters)
      .populate("customer", "name phone email")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(filters);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};

/**
 * Get a single sale by ID
 */
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
      error: error.message,
    });
  }
};

/**
 * Create a new sale
 */
const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      items,
      discountPercentage = 0,
      paymentMethod = "cash",
      paymentStatus = "paid",
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required for creating a sale",
      });
    }

    // Validate customer if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }
    }

    // Process items and validate stock
    const processedItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.currentStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`,
        });
      }

      // Determine price based on customer type
      const unitPrice =
        customer && customer.isDealer
          ? product.wholesalePrice || product.sellingPrice
          : product.sellingPrice;

      const total = unitPrice * item.quantity;

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        total,
      });

      // Prepare stock update
      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $inc: {
              currentStock: -item.quantity,
              totalSold: item.quantity,
            },
            $set: { lastSoldDate: new Date() },
          },
        },
      });
    }

    // Create the sale
    const saleData = {
      items: processedItems,
      discountPercentage,
      paymentMethod,
      paymentStatus,
    };

    // Only add customer if customerId is provided
    if (customerId) {
      saleData.customer = customerId;
    }

    const sale = new Sale(saleData);

    await sale.save({ session });

    // Update product stock
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session });
    }

    // Update customer purchase history if customer exists
    if (customer) {
      customer.purchaseHistory.push({
        saleId: sale._id,
        amount: sale.totalAmount,
        date: new Date(),
      });

      // Update total due if payment is pending
      if (paymentStatus === "pending" || paymentStatus === "partial") {
        customer.totalDue += sale.totalAmount;
      }

      await customer.save({ session });
    }

    await session.commitTransaction();

    // Populate the saved sale for response
    await sale.populate("customer", "name phone email");
    await sale.populate("items.product", "name sku");

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating sale:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Update sale payment status
 */
const updateSalePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentStatus } = req.body;
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const oldStatus = sale.paymentStatus;
    sale.paymentStatus = paymentStatus;
    await sale.save({ session });

    // Update customer due amount if customer exists and payment status changed
    if (sale.customer) {
      const customer = await Customer.findById(sale.customer).session(session);
      if (customer) {
        // If changing from pending/partial to paid, reduce due amount
        if (
          (oldStatus === "pending" || oldStatus === "partial") &&
          paymentStatus === "paid"
        ) {
          customer.totalDue = Math.max(0, customer.totalDue - sale.totalAmount);
        }
        // If changing from paid to pending/partial, increase due amount
        else if (
          oldStatus === "paid" &&
          (paymentStatus === "pending" || paymentStatus === "partial")
        ) {
          customer.totalDue += sale.totalAmount;
        }

        await customer.save({ session });
      }
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Delete a sale (admin only, with stock restoration)
 */
const deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Restore stock for all items
    const stockUpdates = [];
    for (const item of sale.items) {
      stockUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              currentStock: item.quantity,
              totalSold: -item.quantity,
            },
          },
        },
      });
    }

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session });
    }

    // Update customer if exists
    if (sale.customer) {
      const customer = await Customer.findById(sale.customer).session(session);
      if (customer) {
        // Remove from purchase history
        customer.purchaseHistory = customer.purchaseHistory.filter(
          (purchase) => !purchase.saleId.equals(sale._id)
        );

        // Adjust due amount if payment was pending
        if (
          sale.paymentStatus === "pending" ||
          sale.paymentStatus === "partial"
        ) {
          customer.totalDue = Math.max(0, customer.totalDue - sale.totalAmount);
        }

        await customer.save({ session });
      }
    }

    await Sale.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting sale:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sale",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get sales dashboard stats
 */
const getSalesStats = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [totalSales, totalRevenue, recentSales] = await Promise.all([
      Sale.countDocuments({ createdAt: { $gte: startDate } }),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Sale.find({ createdAt: { $gte: startDate } })
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalRevenue: revenue,
        recentSales,
        period: parseInt(period),
      },
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  updateSalePayment,
  deleteSale,
  getSalesStats,
};
