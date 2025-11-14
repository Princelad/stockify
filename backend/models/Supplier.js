const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },

    contactPerson: {
      type: String,
      trim: true,
      maxlength: [50, "Contact person name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: "India" },
      full: String, // Complete address as a single string
    },

    category: {
      type: String,
      enum: [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports",
        "Books",
        "Beauty",
        "Other",
      ],
      default: "Other",
    },

    paymentTerms: {
      type: String,
      enum: [
        "15 days",
        "30 days",
        "45 days",
        "60 days",
        "90 days",
        "Cash on delivery",
        "Net 10",
        "Net 30",
      ],
      default: "30 days",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    // Business Information
    businessType: {
      type: String,
      enum: [
        "manufacturer",
        "wholesaler",
        "distributor",
        "retailer",
        "service_provider",
      ],
      default: "wholesaler",
    },

    taxId: String, // GST number or tax identification

    // Financial Information
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, "Credit limit cannot be negative"],
    },

    // Additional Information
    website: String,
    notes: String,

    // Relationship tracking
    totalOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Total order value cannot be negative"],
    },

    lastOrderDate: Date,

    // Product count (calculated field)
    productCount: {
      type: Number,
      default: 0,
      min: [0, "Product count cannot be negative"],
    },

    // User association for multi-tenancy
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
supplierSchema.index({ name: 1, createdBy: 1 });
supplierSchema.index({ email: 1, createdBy: 1 });
supplierSchema.index({ category: 1, createdBy: 1 });
supplierSchema.index({ status: 1, createdBy: 1 });
supplierSchema.index({ createdBy: 1, isActive: 1 });

// Virtual for full address
supplierSchema.virtual("fullAddress").get(function () {
  if (this.address && this.address.full) {
    return this.address.full;
  }

  const parts = [];
  if (this.address) {
    if (this.address.street) parts.push(this.address.street);
    if (this.address.city) parts.push(this.address.city);
    if (this.address.state) parts.push(this.address.state);
    if (this.address.postalCode) parts.push(this.address.postalCode);
    if (this.address.country && this.address.country !== "India")
      parts.push(this.address.country);
  }

  return parts.join(", ");
});

// Virtual for total value (calculated from products)
supplierSchema.virtual("totalValue").get(function () {
  return this.totalOrderValue || 0;
});

// Pre-save middleware to update the full address
supplierSchema.pre("save", function (next) {
  if (this.address && !this.address.full) {
    const parts = [];
    if (this.address.street) parts.push(this.address.street);
    if (this.address.city) parts.push(this.address.city);
    if (this.address.state) parts.push(this.address.state);
    if (this.address.postalCode) parts.push(this.address.postalCode);
    if (this.address.country && this.address.country !== "India")
      parts.push(this.address.country);

    this.address.full = parts.join(", ");
  }
  next();
});

// Static method to get suppliers with product statistics
supplierSchema.statics.getWithStats = async function (userId, filters = {}) {
  const matchConditions = {
    createdBy: new mongoose.Types.ObjectId(userId),
    isActive: true,
    ...filters,
  };

  return this.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: "products",
        let: { supplierName: "$name" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$supplier.name", "$$supplierName"] },
                  { $eq: ["$createdBy", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
        ],
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" },
        totalStockValue: {
          $sum: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                $multiply: ["$$product.currentStock", "$$product.costPrice"],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        products: 0, // Remove products array to reduce response size
      },
    },
    { $sort: { name: 1 } },
  ]);
};

// Instance method to update product statistics
supplierSchema.methods.updateProductStats = async function () {
  const Product = mongoose.model("Product");

  const stats = await Product.aggregate([
    {
      $match: {
        "supplier.name": this.name,
        createdBy: this.createdBy,
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        productCount: { $sum: 1 },
        totalValue: {
          $sum: { $multiply: ["$currentStock", "$costPrice"] },
        },
      },
    },
  ]);

  if (stats.length > 0) {
    this.productCount = stats[0].productCount;
    this.totalOrderValue = stats[0].totalValue;
  } else {
    this.productCount = 0;
    this.totalOrderValue = 0;
  }

  return this.save();
};

module.exports = mongoose.model("Supplier", supplierSchema);
