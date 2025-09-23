const mongoose = require("mongoose");

// ref is used for refering the documents from the other collections in mongo....
const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false, // Allow sales without customer (walk-in customers)
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true }, // Store product name for invoice history
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "netbanking", "credit"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "paid",
    },
    invoiceNumber: { type: String, unique: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate invoice number
saleSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Find the last invoice number for today
    const lastInvoice = await this.constructor
      .findOne({
        invoiceNumber: { $regex: `^INV-${year}${month}${day}` },
      })
      .sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split("-")[3]); // Fix: should be index 3, not 2
      sequence = lastSequence + 1;
    }

    this.invoiceNumber = `INV-${year}${month}${day}-${String(sequence).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

// Calculate totals before saving
saleSchema.pre("save", function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculate discount amount
  this.discountAmount = (this.subtotal * this.discountPercentage) / 100;

  // Calculate final total
  this.totalAmount = this.subtotal - this.discountAmount;

  next();
});

module.exports = mongoose.model("Sale", saleSchema);
