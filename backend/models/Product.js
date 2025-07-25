const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true },// stoke keeping identifier ...
    category: { type: String },
    priceRetail: { type: Number, required: true },
    priceWholesale: { type: Number },
    quantity: { type: Number, default: 0 },
    supplier: { type: String },
    lowStockAlert: { type: Number, default: 10 },
    description: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
