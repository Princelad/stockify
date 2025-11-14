const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const invoicePDFService = require("../services/invoicePDFService");
const mongoose = require("mongoose");
const { ok, fail } = require("../utils/responder");

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

<<<<<<< HEAD
    const filters = {
      createdBy: req.user._id, // Add user scoping
    };
=======
    const filters = { createdBy: req.user._id };
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747

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
      .skip((page - 1) * limit)
      .lean();

    const total = await Sale.countDocuments(filters);

    return ok(res, {
      sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return fail(res, error, "Failed to fetch sales");
  }
};

/**
 * Generate invoice PDF for a sale
 */
const generateSalePDF = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("customer")
      .populate("items.product")
      .lean();

    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    const pdfBuffer = await invoicePDFService.generateInvoicePDF(sale, {
      companyName: process.env.COMPANY_NAME || "Stockify",
      companyAddress: process.env.COMPANY_ADDRESS || "",
      footer: process.env.INVOICE_FOOTER || "Thank you for your business!",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="invoice-${
        sale.invoiceNumber || sale._id
      }.pdf"`,
    });

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return fail(res, error, "Failed to generate invoice PDF");
  }
};

/**
 * Get a single sale by ID
 */
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
<<<<<<< HEAD
      createdBy: req.user._id
=======
      createdBy: req.user._id,
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
    })
      .populate("customer")
      .populate("items.product")
      .lean();

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found or access denied",
      });
    }

    return ok(res, sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return fail(res, error, "Failed to fetch sale");
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
<<<<<<< HEAD
      // First try to find customer with user scoping
      customer = await Customer.findOne({
        _id: customerId,
        createdBy: req.user._id
      }).session(session);
      
      // If not found with user scoping, try without (for backward compatibility)
=======
      // TODO: Enforce tenant scoping on customers once `createdBy` is added to Customer schema
      customer = await Customer.findOne({
        _id: customerId,
        createdBy: req.user._id,
      }).session(session);
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
      if (!customer) {
        customer = await Customer.findById(customerId).session(session);
        
        // If customer exists but doesn't belong to user, we'll still allow the sale
        // but won't link the customer (treat as walk-in customer)
        if (customer && customer.createdBy && customer.createdBy.toString() !== req.user._id.toString()) {
          console.log(`Customer ${customerId} belongs to different user, treating as walk-in customer`);
          customer = null;
          customerId = null; // Don't link this customer to the sale
        }
      }
      
      // If customer still not found, log warning but continue (walk-in customer)
      if (!customer && customerId) {
        console.log(`Customer ${customerId} not found, treating as walk-in customer`);
        customerId = null; // Don't link non-existent customer
      }
    }

    // Process items and validate stock
    const processedItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        createdBy: req.user._id,
<<<<<<< HEAD
        isActive: true
=======
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
      }).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found or access denied`,
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
          filter: { _id: product._id, createdBy: req.user._id },
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
<<<<<<< HEAD
      createdBy: req.user._id, // Add the required createdBy field
=======
      createdBy: req.user._id,
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
    };

    // Only add customer if valid customerId exists after validation
    if (customerId && customer) {
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
    return fail(res, error, "Failed to create sale");
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
    const sale = await Sale.findOne({
      _id: req.params.id,
<<<<<<< HEAD
      createdBy: req.user._id
=======
      createdBy: req.user._id,
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
    }).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found or access denied",
      });
    }

    const oldStatus = sale.paymentStatus;
    sale.paymentStatus = paymentStatus;
    await sale.save({ session });

    // Update customer due amount if customer exists and payment status changed
    if (sale.customer) {
      const customer = await Customer.findOne({
        _id: sale.customer,
        createdBy: req.user._id,
      }).session(session);
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

    return ok(res, sale, "Payment status updated successfully");
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating payment status:", error);
    return fail(res, error, "Failed to update payment status");
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
    const sale = await Sale.findOne({
      _id: req.params.id,
<<<<<<< HEAD
      createdBy: req.user._id
=======
      createdBy: req.user._id,
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
    }).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found or access denied",
      });
    }

    // Restore stock for all items
    const stockUpdates = [];
    for (const item of sale.items) {
      stockUpdates.push({
        updateOne: {
          filter: { _id: item.product, createdBy: req.user._id },
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
      const customer = await Customer.findOne({
        _id: sale.customer,
        createdBy: req.user._id,
      }).session(session);
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

    return ok(res, null, "Sale deleted successfully");
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting sale:", error);
    return fail(res, error, "Failed to delete sale");
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

    const baseFilter = { 
      createdBy: req.user._id,
      createdAt: { $gte: startDate } 
    };

    const [totalSales, totalRevenue, recentSales] = await Promise.all([
<<<<<<< HEAD
      Sale.countDocuments(baseFilter),
      Sale.aggregate([
        { 
          $match: { 
            ...baseFilter,
            paymentStatus: "paid" 
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Sale.find(baseFilter)
=======
      Sale.countDocuments({
        createdBy: req.user._id,
        createdAt: { $gte: startDate },
      }),
      Sale.aggregate([
        {
          $match: {
            createdBy: req.user._id,
            createdAt: { $gte: startDate },
            paymentStatus: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Sale.find({ createdBy: req.user._id, createdAt: { $gte: startDate } })
>>>>>>> 188d7edda56e9426cbca7998bd0d4d6de0fd0747
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    return ok(res, {
      totalSales,
      totalRevenue: revenue,
      recentSales,
      period: parseInt(period),
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return fail(res, error, "Failed to fetch sales statistics");
  }
};

module.exports = {
  getSales,
  generateSalePDF,
  getSale,
  createSale,
  updateSalePayment,
  deleteSale,
  getSalesStats,
};
