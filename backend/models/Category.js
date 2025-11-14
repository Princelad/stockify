const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
    productCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Now all categories must be user-created
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and per-tenant uniqueness
categorySchema.index({ createdBy: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdBy: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
