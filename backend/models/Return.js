const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false, // Allow returns without customer info (walk-in)
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        quantityReturned: { type: Number, required: true, min: 1 },
        originalQuantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalRefunded: { type: Number, required: true, min: 0 },
        reason: {
          type: String,
          enum: [
            "defective",
            "wrong-item",
            "customer-changed-mind",
            "damaged",
            "expired",
            "other",
          ],
          required: true,
        },
      },
    ],
    totalRefundAmount: { type: Number, required: true, min: 0 },
    refundMethod: {
      type: String,
      enum: ["cash", "card", "upi", "netbanking", "store-credit"],
      required: true,
    },
    refundStatus: {
      type: String,
      enum: ["pending", "processed", "rejected"],
      default: "pending",
    },
    returnNumber: { type: String, unique: true },
    notes: { type: String, default: "" },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Set when return is processed
    },
    processedAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate return number
returnSchema.pre("save", async function (next) {
  if (!this.returnNumber) {
    const count = await mongoose.models.Return.countDocuments({
      createdBy: this.createdBy,
    });
    this.returnNumber = `RET-${Date.now()}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Index for efficient queries
returnSchema.index({ createdBy: 1, createdAt: -1 });
returnSchema.index({ sale: 1 });
returnSchema.index({ returnNumber: 1 });

// Virtual for return age
returnSchema.virtual("returnAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

module.exports = mongoose.model("Return", returnSchema);
