const Return = require("../models/Return");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { ok, fail } = require("../utils/responder");

/**
 * CREATE RETURN
 * Purpose: Process a product return/refund
 */
const createReturn = async (req, res) => {
  try {
    const { saleId, items, refundMethod, notes } = req.body;

    // Validate required fields
    if (!saleId || !items || !Array.isArray(items) || items.length === 0) {
      return fail(res, null, "Sale ID and items are required", 400);
    }

    // Find the original sale
    const originalSale = await Sale.findOne({
      _id: saleId,
      createdBy: req.user._id,
    }).populate("items.product");

    if (!originalSale) {
      return fail(res, null, "Original sale not found", 404);
    }

    // Validate return items against original sale
    let totalRefundAmount = 0;
    const validatedItems = [];

    for (const returnItem of items) {
      const { productId, quantityReturned, reason } = returnItem;

      // Find the item in the original sale
      const originalItem = originalSale.items.find(
        (item) => item.product._id.toString() === productId
      );

      if (!originalItem) {
        return fail(
          res,
          null,
          `Product ${productId} not found in original sale`,
          400
        );
      }

      // Check if return quantity is valid
      if (quantityReturned <= 0 || quantityReturned > originalItem.quantity) {
        return fail(
          res,
          null,
          `Invalid return quantity for product ${originalItem.productName}`,
          400
        );
      }

      // Check if this product was already returned (partially or fully)
      const existingReturns = await Return.find({
        sale: saleId,
        "items.product": productId,
        refundStatus: { $in: ["pending", "processed"] },
      });

      let alreadyReturnedQuantity = 0;
      existingReturns.forEach((returnDoc) => {
        const returnedItem = returnDoc.items.find(
          (item) => item.product.toString() === productId
        );
        if (returnedItem) {
          alreadyReturnedQuantity += returnedItem.quantityReturned;
        }
      });

      const availableToReturn = originalItem.quantity - alreadyReturnedQuantity;
      if (quantityReturned > availableToReturn) {
        return fail(
          res,
          null,
          `Only ${availableToReturn} units available to return for ${originalItem.productName}`,
          400
        );
      }

      const itemRefundAmount = quantityReturned * originalItem.unitPrice;
      totalRefundAmount += itemRefundAmount;

      validatedItems.push({
        product: productId,
        productName: originalItem.productName,
        quantityReturned,
        originalQuantity: originalItem.quantity,
        unitPrice: originalItem.unitPrice,
        totalRefunded: itemRefundAmount,
        reason: reason || "other",
      });
    }

    // Create the return document
    const returnDoc = new Return({
      sale: saleId,
      customer: originalSale.customer,
      items: validatedItems,
      totalRefundAmount,
      refundMethod: refundMethod || "cash",
      notes: notes || "",
      createdBy: req.user._id,
    });

    await returnDoc.save();

    // Return the created return with populated data
    const populatedReturn = await Return.findById(returnDoc._id)
      .populate("sale", "invoiceNumber createdAt")
      .populate("customer", "name email phone")
      .populate("items.product", "name sku");

    return ok(res, populatedReturn, "Return processed successfully", 201);
  } catch (error) {
    console.error("Error creating return:", error);
    return fail(res, error, "Failed to process return");
  }
};

/**
 * GET RETURNS
 * Purpose: Get all returns with pagination and filtering
 */
const getReturns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      customerId,
      search,
    } = req.query;

    const userFilter = { createdBy: req.user._id };

    // Add status filter
    if (status) {
      userFilter.refundStatus = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      userFilter.createdAt = {};
      if (startDate) userFilter.createdAt.$gte = new Date(startDate);
      if (endDate) userFilter.createdAt.$lte = new Date(endDate);
    }

    // Add customer filter
    if (customerId) {
      userFilter.customer = customerId;
    }

    // Search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { returnNumber: { $regex: search, $options: "i" } },
          { "items.productName": { $regex: search, $options: "i" } },
          { notes: { $regex: search, $options: "i" } },
        ],
      };
    }

    const finalFilter = { ...userFilter, ...searchFilter };

    // Get total count for pagination
    const total = await Return.countDocuments(finalFilter);

    const returns = await Return.find(finalFilter)
      .populate("sale", "invoiceNumber createdAt totalAmount")
      .populate("customer", "name email phone")
      .populate("items.product", "name sku currentStock")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Calculate summary statistics
    const stats = await Return.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: null,
          totalReturns: { $sum: 1 },
          totalRefundAmount: { $sum: "$totalRefundAmount" },
          pendingReturns: {
            $sum: { $cond: [{ $eq: ["$refundStatus", "pending"] }, 1, 0] },
          },
          processedReturns: {
            $sum: { $cond: [{ $eq: ["$refundStatus", "processed"] }, 1, 0] },
          },
        },
      },
    ]);

    const summary = stats[0] || {
      totalReturns: 0,
      totalRefundAmount: 0,
      pendingReturns: 0,
      processedReturns: 0,
    };

    return ok(
      res,
      {
        returns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReturns: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        summary,
      },
      "Returns retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching returns:", error);
    return fail(res, error, "Failed to fetch returns");
  }
};

/**
 * GET RETURN BY ID
 * Purpose: Get a specific return with full details
 */
const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnDoc = await Return.findOne({
      _id: id,
      createdBy: req.user._id,
    })
      .populate("sale", "invoiceNumber createdAt totalAmount paymentMethod")
      .populate("customer", "name email phone address")
      .populate("items.product", "name sku currentStock category")
      .populate("processedBy", "name email")
      .populate("createdBy", "name email");

    if (!returnDoc) {
      return fail(res, null, "Return not found", 404);
    }

    return ok(res, returnDoc, "Return details retrieved successfully");
  } catch (error) {
    console.error("Error fetching return:", error);
    return fail(res, error, "Failed to fetch return details");
  }
};

/**
 * PROCESS RETURN
 * Purpose: Process a pending return (approve/reject)
 */
const processReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!action || !["approve", "reject"].includes(action)) {
      return fail(res, null, "Action must be 'approve' or 'reject'", 400);
    }

    const returnDoc = await Return.findOne({
      _id: id,
      createdBy: req.user._id,
      refundStatus: "pending",
    }).populate("items.product");

    if (!returnDoc) {
      return fail(res, null, "Pending return not found", 404);
    }

    if (action === "approve") {
      // Update product stock for approved returns
      for (const item of returnDoc.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { currentStock: item.quantityReturned },
        });
      }

      returnDoc.refundStatus = "processed";
      returnDoc.processedAt = new Date();
      returnDoc.processedBy = req.user._id;
    } else {
      returnDoc.refundStatus = "rejected";
      returnDoc.processedAt = new Date();
      returnDoc.processedBy = req.user._id;
    }

    if (notes) {
      returnDoc.notes =
        (returnDoc.notes || "") + `\n[${action.toUpperCase()}] ${notes}`;
    }

    await returnDoc.save();

    const populatedReturn = await Return.findById(returnDoc._id)
      .populate("sale", "invoiceNumber")
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .populate("processedBy", "name email");

    return ok(res, populatedReturn, `Return ${action}d successfully`);
  } catch (error) {
    console.error("Error processing return:", error);
    return fail(res, error, "Failed to process return");
  }
};

/**
 * GET RETURN ELIGIBILITY
 * Purpose: Check if items in a sale are eligible for return
 */
const getReturnEligibility = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await Sale.findOne({
      _id: saleId,
      createdBy: req.user._id,
    }).populate("items.product", "name sku");

    if (!sale) {
      return fail(res, null, "Sale not found", 404);
    }

    // Get existing returns for this sale
    const existingReturns = await Return.find({
      sale: saleId,
      refundStatus: { $in: ["pending", "processed"] },
    });

    // Calculate returned quantities for each product
    const returnedQuantities = {};
    existingReturns.forEach((returnDoc) => {
      returnDoc.items.forEach((item) => {
        const productId = item.product.toString();
        returnedQuantities[productId] =
          (returnedQuantities[productId] || 0) + item.quantityReturned;
      });
    });

    // Check eligibility for each item
    const eligibleItems = sale.items
      .map((item) => {
        const productId = item.product._id.toString();
        const alreadyReturned = returnedQuantities[productId] || 0;
        const availableToReturn = item.quantity - alreadyReturned;

        return {
          productId: productId,
          productName: item.productName,
          originalQuantity: item.quantity,
          alreadyReturned,
          availableToReturn,
          unitPrice: item.unitPrice,
          isEligible: availableToReturn > 0,
        };
      })
      .filter((item) => item.isEligible);

    return ok(
      res,
      {
        sale: {
          id: sale._id,
          invoiceNumber: sale.invoiceNumber,
          createdAt: sale.createdAt,
          totalAmount: sale.totalAmount,
        },
        eligibleItems,
        hasEligibleItems: eligibleItems.length > 0,
      },
      "Return eligibility checked successfully"
    );
  } catch (error) {
    console.error("Error checking return eligibility:", error);
    return fail(res, error, "Failed to check return eligibility");
  }
};

module.exports = {
  createReturn,
  getReturns,
  getReturnById,
  processReturn,
  getReturnEligibility,
};
