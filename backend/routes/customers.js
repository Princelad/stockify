const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} = require("../controllers/customerController");

const auth = require("../middleware/auth");

// All customer routes require authentication
router.use(auth);

/**
 * @route   GET /api/customers/search
 * @desc    Search customers by name or phone
 * @access  Private
 */
router.get("/search", searchCustomers);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination
 * @access  Private
 */
router.get("/", getCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get a single customer by ID
 * @access  Private
 */
router.get("/:id", getCustomer);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private
 */
router.post("/", createCustomer);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Private
 */
router.put("/:id", updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Private
 */
router.delete("/:id", deleteCustomer);

module.exports = router;
