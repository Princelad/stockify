const express = require("express");
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  updateSalePayment,
  deleteSale,
  getSalesStats,
} = require("../controllers/salesController");

const auth = require("../middleware/auth");

// All sales routes require authentication
router.use(auth);

/**
 * @route   GET /api/sales/stats
 * @desc    Get sales dashboard statistics
 * @access  Private
 */
router.get("/stats", getSalesStats);

/**
 * @route   GET /api/sales
 * @desc    Get all sales with pagination and filters
 * @access  Private
 */
router.get("/", getSales);

/**
 * @route   GET /api/sales/:id
 * @desc    Get a single sale by ID
 * @access  Private
 */
router.get("/:id", getSale);

/**
 * @route   POST /api/sales
 * @desc    Create a new sale/bill
 * @access  Private
 */
router.post("/", createSale);

/**
 * @route   PUT /api/sales/:id/payment
 * @desc    Update sale payment status
 * @access  Private
 */
router.put("/:id/payment", updateSalePayment);

/**
 * @route   DELETE /api/sales/:id
 * @desc    Delete a sale (admin only)
 * @access  Private
 */
router.delete("/:id", deleteSale);

module.exports = router;
