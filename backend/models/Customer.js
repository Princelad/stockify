const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    isDealer: { type: Boolean, default: false },
    totalDue: { type: Number, default: 0 },
    purchaseHistory: [
      {
        saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
        amount: Number,
        date: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Per-tenant unique index on name
customerSchema.index({ createdBy: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);
