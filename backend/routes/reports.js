const express = require("express");
const router = express.Router();
const {
  getInventoryReport,
  getSalesReport,
  getTaxReport,
} = require("../controllers/reportController");

const auth = require("../middleware/auth");

// All report routes require authentication
router.use(auth);

/**
 * @route   GET /api/reports/inventory
 * @desc    Get comprehensive inventory report
 * @access  Private
 * @params  period, category, supplier, lowStock, outOfStock
 */
router.get("/inventory", getInventoryReport);

/**
 * @route   GET /api/reports/sales
 * @desc    Get comprehensive sales report
 * @access  Private
 * @params  period, customer, paymentMethod, category
 */
router.get("/sales", getSalesReport);

/**
 * @route   GET /api/reports/tax
 * @desc    Get comprehensive tax/GST report
 * @access  Private
 * @params  period, gstRate
 */
router.get("/tax", getTaxReport);

module.exports = router;
