const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { ok, fail } = require("../utils/responder");

/**
 * GET ALL SUPPLIERS
 * Purpose: Retrieve all suppliers for the authenticated user with optional filtering
 * Features: Search, category filter, pagination, statistics
 */
const getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      status = "active",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    // Build filter conditions
    const filterConditions = {
      createdBy: req.user._id,
      isActive: true,
    };

    // Add status filter
    if (status && status !== "all") {
      filterConditions.status = status;
    }

    // Add category filter
    if (category && category !== "all") {
      filterConditions.category = category;
    }

    // Add search filter
    if (search) {
      filterConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get suppliers with product statistics
    const suppliersWithStats = await Supplier.aggregate([
      { $match: filterConditions },
      {
        $lookup: {
          from: "products",
          let: { supplierName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$supplier.name", "$$supplierName"] },
                    { $eq: ["$createdBy", req.user._id] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
          totalValue: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  $multiply: ["$$product.currentStock", "$$product.costPrice"],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          products: 0, // Remove products array to reduce response size
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // Get total count for pagination
    const totalCount = await Supplier.countDocuments(filterConditions);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    return ok(
      res,
      {
        suppliers: suppliersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      },
      `Retrieved ${suppliersWithStats.length} suppliers`
    );
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return fail(res, error, "Failed to fetch suppliers");
  }
};

/**
 * GET SINGLE SUPPLIER
 */
const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Find supplier and populate with product statistics
    const supplier = await Supplier.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (
      !supplier ||
      supplier.createdBy.toString() !== req.user._id.toString()
    ) {
      return fail(res, null, "Supplier not found", 404);
    }

    // Get products for this supplier
    const products = await Product.find({
      "supplier.name": supplier.name,
      createdBy: req.user._id,
      isActive: true,
    }).select("name category currentStock costPrice sellingPrice");

    // Calculate statistics
    const productCount = products.length;
    const totalValue = products.reduce((sum, product) => {
      return sum + product.currentStock * product.costPrice;
    }, 0);

    // Add calculated fields to supplier object
    const supplierData = supplier.toObject();
    supplierData.productCount = productCount;
    supplierData.totalValue = totalValue;
    supplierData.products = products;

    return ok(res, supplierData, "Supplier retrieved successfully");
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return fail(res, error, "Failed to fetch supplier");
  }
};

/**
 * CREATE NEW SUPPLIER
 */
const createSupplier = async (req, res) => {
  try {
    const supplierData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Handle address field - if it's a string, convert to address object
    if (typeof supplierData.address === "string") {
      supplierData.address = { full: supplierData.address };
    }

    // Check for duplicate supplier name for this user
    const existingSupplier = await Supplier.findOne({
      name: { $regex: new RegExp(`^${supplierData.name}$`, "i") },
      createdBy: req.user._id,
      isActive: true,
    });

    if (existingSupplier) {
      return fail(res, null, "A supplier with this name already exists", 400);
    }

    const supplier = new Supplier(supplierData);
    const savedSupplier = await supplier.save();

    // Add initial stats
    const supplierWithStats = savedSupplier.toObject();
    supplierWithStats.productCount = 0;
    supplierWithStats.totalValue = 0;

    return ok(res, supplierWithStats, "Supplier created successfully", 201);
  } catch (error) {
    console.error("Error creating supplier:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return fail(res, { errors: validationErrors }, "Validation failed", 400);
    }

    return fail(res, error, "Failed to create supplier");
  }
};

/**
 * UPDATE SUPPLIER
 */
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle address field
    if (typeof updateData.address === "string") {
      updateData.address = { full: updateData.address };
    }

    // Find supplier
    const supplier = await Supplier.findById(id);

    if (
      !supplier ||
      supplier.createdBy.toString() !== req.user._id.toString()
    ) {
      return fail(res, null, "Supplier not found", 404);
    }

    // Check for duplicate name if name is being changed
    if (updateData.name && updateData.name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        createdBy: req.user._id,
        isActive: true,
        _id: { $ne: id },
      });

      if (existingSupplier) {
        return fail(res, null, "A supplier with this name already exists", 400);
      }

      // If name is changing, update all products with this supplier
      await Product.updateMany(
        {
          "supplier.name": supplier.name,
          createdBy: req.user._id,
        },
        {
          $set: { "supplier.name": updateData.name },
        }
      );
    }

    // Update supplier
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    // Update product statistics
    await updatedSupplier.updateProductStats();

    return ok(res, updatedSupplier, "Supplier updated successfully");
  } catch (error) {
    console.error("Error updating supplier:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return fail(res, { errors: validationErrors }, "Validation failed", 400);
    }

    return fail(res, error, "Failed to update supplier");
  }
};

/**
 * DELETE SUPPLIER (Soft Delete)
 */
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (
      !supplier ||
      supplier.createdBy.toString() !== req.user._id.toString()
    ) {
      return fail(res, null, "Supplier not found", 404);
    }

    // Check if supplier has active products
    const productCount = await Product.countDocuments({
      "supplier.name": supplier.name,
      createdBy: req.user._id,
      isActive: true,
    });

    if (productCount > 0) {
      return fail(
        res,
        null,
        `Cannot delete supplier. ${productCount} active products are associated with this supplier. Please reassign or remove products first.`,
        400
      );
    }

    // Soft delete
    supplier.isActive = false;
    supplier.status = "inactive";
    await supplier.save();

    return ok(res, null, "Supplier deleted successfully");
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return fail(res, error, "Failed to delete supplier");
  }
};

/**
 * GET SUPPLIER STATISTICS
 */
const getSupplierStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Supplier.aggregate([
      {
        $match: {
          createdBy: userId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactiveSuppliers: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          totalCreditLimit: { $sum: "$creditLimit" },
        },
      },
    ]);

    // Get category breakdown
    const categoryStats = await Supplier.aggregate([
      {
        $match: {
          createdBy: userId,
          isActive: true,
          status: "active",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent suppliers
    const recentSuppliers = await Supplier.find({
      createdBy: userId,
      isActive: true,
    })
      .select("name category status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const result = {
      overview: stats[0] || {
        totalSuppliers: 0,
        activeSuppliers: 0,
        inactiveSuppliers: 0,
        totalCreditLimit: 0,
      },
      categoryBreakdown: categoryStats,
      recentSuppliers,
    };

    return ok(res, result, "Supplier statistics retrieved successfully");
  } catch (error) {
    console.error("Error fetching supplier stats:", error);
    return fail(res, error, "Failed to fetch supplier statistics");
  }
};

/**
 * SEARCH SUPPLIERS
 */
const searchSuppliers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return fail(res, null, "Search query is required", 400);
    }

    const suppliers = await Supplier.find({
      createdBy: req.user._id,
      isActive: true,
      status: "active",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { contactPerson: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ],
    })
      .select("name contactPerson email phone category status")
      .limit(parseInt(limit))
      .sort({ name: 1 });

    return ok(res, suppliers, `Found ${suppliers.length} suppliers`);
  } catch (error) {
    console.error("Error searching suppliers:", error);
    return fail(res, error, "Failed to search suppliers");
  }
};

module.exports = {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats,
  searchSuppliers,
};
