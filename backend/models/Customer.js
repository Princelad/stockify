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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
