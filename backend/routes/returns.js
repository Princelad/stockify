const express = require("express");
const router = express.Router();
const returnController = require("../controllers/returnController");
const auth = require("../middleware/auth");
const { validateReturn } = require("../middleware/validation");

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route   GET /api/returns
 * @desc    Get all returns with pagination and filtering
 * @access  Private
 */
router.get("/", returnController.getReturns);

/**
 * @route   GET /api/returns/:id
 * @desc    Get a specific return by ID
 * @access  Private
 */
router.get("/:id", returnController.getReturnById);

/**
 * @route   POST /api/returns
 * @desc    Create a new return/refund
 * @access  Private
 */
router.post("/", validateReturn, returnController.createReturn);

/**
 * @route   PUT /api/returns/:id/process
 * @desc    Process a return (approve/reject)
 * @access  Private
 */
router.put("/:id/process", returnController.processReturn);

/**
 * @route   GET /api/returns/eligibility/:saleId
 * @desc    Check return eligibility for a sale
 * @access  Private
 */
router.get("/eligibility/:saleId", returnController.getReturnEligibility);

module.exports = router;
