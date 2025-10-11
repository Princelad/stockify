const Customer = require("../models/Customer");
const { ok, fail } = require("../utils/responder");

/**
 * Get all customers with pagination and search
 */
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const filters = { createdBy: req.user._id };
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(filters);

    return ok(res, {
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return fail(res, error, "Failed to fetch customers");
  }
};

/**
 * Get a single customer by ID
 */
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("purchaseHistory.saleId");

    if (!customer) {
      return fail(res, null, "Customer not found", 404);
    }

    return ok(res, customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return fail(res, error, "Failed to fetch customer");
  }
};

/**
 * Create a new customer
 */
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, isDealer = false } = req.body;

    // Validate required fields
    if (!name) {
      return fail(res, null, "Customer name is required", 400);
    }

    // Check if customer with same phone already exists for this user
    if (phone) {
      const existingCustomer = await Customer.findOne({
        phone,
        createdBy: req.user._id,
      });
      if (existingCustomer) {
        return fail(
          res,
          null,
          "Customer with this phone number already exists",
          409
        );
      }
    }

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      isDealer,
      createdBy: req.user._id,
    });

    await customer.save();

    return ok(res, customer, "Customer created successfully", 201);
  } catch (error) {
    console.error("Error creating customer:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return fail(
        res,
        null,
        "Customer with this phone number already exists",
        409
      );
    }
    return fail(res, error, "Failed to create customer");
  }
};

/**
 * Update a customer
 */
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, isDealer } = req.body;

    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!customer) {
      return fail(res, null, "Customer not found", 404);
    }

    // Check if phone is being changed and if new phone already exists
    if (phone && phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({
        phone,
        createdBy: req.user._id,
      });
      if (existingCustomer) {
        return fail(
          res,
          null,
          "Another customer with this phone number already exists",
          409
        );
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (isDealer !== undefined) customer.isDealer = isDealer;

    await customer.save();

    return ok(res, customer, "Customer updated successfully");
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.code === 11000) {
      return fail(
        res,
        null,
        "Another customer with this phone number already exists",
        409
      );
    }
    return fail(res, error, "Failed to update customer");
  }
};

/**
 * Delete a customer
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!customer) {
      return fail(res, null, "Customer not found", 404);
    }

    // Check if customer has outstanding dues
    if (customer.totalDue > 0) {
      return fail(
        res,
        null,
        "Cannot delete customer with outstanding dues",
        400
      );
    }

    await Customer.deleteOne({ _id: req.params.id, createdBy: req.user._id });

    return ok(res, null, "Customer deleted successfully");
  } catch (error) {
    console.error("Error deleting customer:", error);
    return fail(res, error, "Failed to delete customer");
  }
};

/**
 * Search customers by name or phone (for quick selection in billing)
 */
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return ok(res, []);
    }

    const customers = await Customer.find({
      createdBy: req.user._id,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ],
    })
      .select("name phone email isDealer")
      .limit(10);

    return ok(res, customers);
  } catch (error) {
    console.error("Error searching customers:", error);
    return fail(res, error, "Failed to search customers");
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
};
