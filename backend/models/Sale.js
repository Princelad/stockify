const mongoose = require("mongoose");


// ref is used for refering the documents from the other collections in mongo....
const saleSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                quantity: Number,
                price: Number,
            },
        ],
        totalAmount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi", "credit"],
            default: "cash",
        },
        status: {
            type: String,
            enum: ["paid", "due"],
            default: "paid",
        },
        invoiceNumber: { type: String, unique: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
