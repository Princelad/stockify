const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sku: {
      // stock keeping identifier
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    // Pricing
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    wholesalePrice: {
      type: Number,
      min: 0,
    },
    // Stock Management
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    maxStockLevel: {
      type: Number,
      min: 0,
    },
    // Supplier Information - supports both reference and embedded for backward compatibility
    supplier: {
      // For backward compatibility - embedded supplier info
      name: String,
      contact: String,
      email: String,
      address: String,
    },
    // New supplier reference field
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    // Product Details
    barcode: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Images
    images: [
      {
        type: String,
      },
    ],
    // Tracking
    totalSold: {
      type: Number,
      default: 0,
    },
    lastSoldDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for low stock check
productSchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.minStockLevel;
});

// Virtual for out of stock check
productSchema.virtual("isOutOfStock").get(function () {
  return this.currentStock === 0;
});

// Index for better search performance
productSchema.index({ createdBy: 1, sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ "supplier.name": 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
