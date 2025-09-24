const express = require("express");
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats,
  searchSuppliers,
} = require("../controllers/supplierController");

const auth = require("../middleware/auth");

// All supplier routes require authentication
router.use(auth);

/**
 * @route   GET /api/suppliers/search
 * @desc    Search suppliers by name, contact, email, or phone
 * @access  Private
 * @params  q (required), limit (optional, default: 10)
 */
router.get("/search", searchSuppliers);

/**
 * @route   GET /api/suppliers/stats
 * @desc    Get supplier statistics and analytics
 * @access  Private
 */
router.get("/stats", getSupplierStats);

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with pagination and filtering
 * @access  Private
 * @params  page, limit, search, category, status, sortBy, sortOrder
 */
router.get("/", getSuppliers);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get a single supplier by ID with product statistics
 * @access  Private
 */
router.get("/:id", getSupplier);

/**
 * @route   POST /api/suppliers
 * @desc    Create a new supplier
 * @access  Private
 * @body    { name, contactPerson, email, phone, address, category, paymentTerms, ... }
 */
router.post("/", createSupplier);

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update an existing supplier
 * @access  Private
 * @body    { name, contactPerson, email, phone, address, category, paymentTerms, ... }
 */
router.put("/:id", updateSupplier);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete a supplier (soft delete)
 * @access  Private
 */
router.delete("/:id", deleteSupplier);

module.exports = router;
