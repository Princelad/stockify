const Customer = require("../models/Customer");

/**
 * Get all customers with pagination and search
 */
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const filters = {
      createdBy: req.user._id, // Add user scoping
    };
    
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

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

/**
 * Get a single customer by ID
 */
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "purchaseHistory.saleId"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
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
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    // Check if customer with same phone already exists for this user
    if (phone) {
      const existingCustomer = await Customer.findOne({ 
        phone,
        createdBy: req.user._id 
      });
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: "Customer with this phone number already exists",
        });
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

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Customer with this phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

/**
 * Update a customer
 */
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, isDealer } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if phone is being changed and if new phone already exists
    if (phone && phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: "Another customer with this phone number already exists",
        });
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (isDealer !== undefined) customer.isDealer = isDealer;

    await customer.save();

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another customer with this phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

/**
 * Delete a customer
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if customer has outstanding dues
    if (customer.totalDue > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete customer with outstanding dues",
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

/**
 * Search customers by name or phone (for quick selection in billing)
 */
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const customers = await Customer.find({
      createdBy: req.user._id, // Add user scoping
      $or: [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ],
    })
      .select("name phone email isDealer")
      .limit(10);

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search customers",
      error: error.message,
    });
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
