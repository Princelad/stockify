const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Sale = require("../models/Sale");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const getCollectionStats = async () => {
  try {
    const stats = {
      users: await User.countDocuments(),
      categories: await Category.countDocuments(),
      products: await Product.countDocuments(),
      customers: await Customer.countDocuments(),
      suppliers: await Supplier.countDocuments(),
      sales: await Sale.countDocuments(),
    };

    console.log("\n📊 Database Statistics:");
    console.log("=======================");
    console.log(`👥 Users: ${stats.users}`);
    console.log(`📂 Categories: ${stats.categories}`);
    console.log(`📦 Products: ${stats.products}`);
    console.log(`👤 Customers: ${stats.customers}`);
    console.log(`🏭 Suppliers: ${stats.suppliers}`);
    console.log(`💰 Sales: ${stats.sales}`);
    console.log(
      `📊 Total Documents: ${Object.values(stats).reduce((a, b) => a + b, 0)}`
    );

    return stats;
  } catch (error) {
    console.error("❌ Error getting collection stats:", error.message);
  }
};

const getRecentActivity = async () => {
  try {
    console.log("\n🔥 Recent Activity (Last 24 hours):");
    console.log("=====================================");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentSales = await Sale.countDocuments({
      createdAt: { $gte: yesterday },
    });
    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: yesterday },
    });
    const recentCustomers = await Customer.countDocuments({
      createdAt: { $gte: yesterday },
    });

    console.log(`💰 Recent Sales: ${recentSales}`);
    console.log(`📦 New Products: ${recentProducts}`);
    console.log(`👤 New Customers: ${recentCustomers}`);

    // Top selling products
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    if (topProducts.length > 0) {
      console.log("\n🏆 Top Selling Products:");
      topProducts.forEach((product, index) => {
        console.log(
          `${index + 1}. ${product._id} - Qty: ${
            product.totalSold
          }, Revenue: $${product.totalRevenue.toFixed(2)}`
        );
      });
    }

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
      isActive: true,
    })
      .select("name currentStock minStockLevel")
      .limit(5);

    if (lowStockProducts.length > 0) {
      console.log("\n⚠️  Low Stock Alerts:");
      lowStockProducts.forEach((product) => {
        console.log(
          `• ${product.name} - Stock: ${product.currentStock}/${product.minStockLevel} (min)`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error getting recent activity:", error.message);
  }
};

const clearDatabase = async () => {
  try {
    console.log("🗑️ Clearing all collections...");

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Sale.deleteMany({});

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
  }
};

const validateData = async () => {
  try {
    console.log("\n🔍 Data Validation:");
    console.log("==================");

    // Check for products without categories
    const productsWithoutCategory = await Product.countDocuments({
      $or: [{ category: null }, { category: "" }],
    });

    // Check for sales without customers (walk-ins are OK)
    const salesWithoutCustomer = await Sale.countDocuments({ customer: null });

    // Check for inactive products
    const inactiveProducts = await Product.countDocuments({ isActive: false });

    // Check for products with zero stock
    const zeroStockProducts = await Product.countDocuments({ currentStock: 0 });

    console.log(`📦 Products without category: ${productsWithoutCategory}`);
    console.log(`💰 Walk-in sales: ${salesWithoutCustomer}`);
    console.log(`❌ Inactive products: ${inactiveProducts}`);
    console.log(`📉 Zero stock products: ${zeroStockProducts}`);

    // Check for orphaned references
    const salesWithInvalidProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productExists",
        },
      },
      { $match: { productExists: { $size: 0 } } },
      { $count: "count" },
    ]);

    const orphanedSales =
      salesWithInvalidProducts.length > 0
        ? salesWithInvalidProducts[0].count
        : 0;
    console.log(`🔗 Sales with invalid product references: ${orphanedSales}`);
  } catch (error) {
    console.error("❌ Error validating data:", error.message);
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const action = args[0] || "stats";

  try {
    await connectDB();

    switch (action) {
      case "stats":
      case "status":
        await getCollectionStats();
        await getRecentActivity();
        await validateData();
        break;

      case "clear":
        const confirm = args.includes("--confirm");
        if (!confirm) {
          console.log("⚠️  This will delete all data from the database!");
          console.log('Use "npm run db:clear -- --confirm" to proceed.');
          process.exit(1);
        }
        await clearDatabase();
        break;

      case "validate":
        await validateData();
        break;

      case "activity":
        await getRecentActivity();
        break;

      default:
        console.log(`
🛠️  Stockify Database Utilities

Usage:
  node scripts/dbUtils.js [action]

Actions:
  stats (default)  Show database statistics and recent activity
  clear --confirm  Clear all data from database (use with caution!)
  validate        Run data validation checks
  activity        Show recent activity only

Examples:
  npm run db:stats     # Show database stats
  npm run db:clear -- --confirm  # Clear database
  npm run db:validate  # Validate data integrity
        `);
    }
  } catch (error) {
    console.error("❌ Database utility failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
    process.exit(0);
  }
};

main();
