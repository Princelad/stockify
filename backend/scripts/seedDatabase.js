const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Sale = require("../models/Sale");

// Database connection
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

// Sample data
const sampleUsers = [
  {
    name: "John Admin",
    email: "admin@stockify.com",
    password: "admin123",
    role: "admin",
    phone: "+1234567890",
    bio: "System Administrator",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      darkMode: false,
      language: "English",
      currency: "USD",
    },
  },
  {
    name: "Sarah Manager",
    email: "manager@stockify.com",
    password: "manager123",
    role: "manager",
    phone: "+1234567891",
    bio: "Store Manager",
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      darkMode: false,
      language: "English",
      currency: "USD",
    },
  },
  {
    name: "Mike Staff",
    email: "staff@stockify.com",
    password: "staff123",
    role: "staff",
    phone: "+1234567892",
    bio: "Sales Staff",
    preferences: {
      emailNotifications: false,
      smsNotifications: true,
      darkMode: true,
      language: "English",
      currency: "USD",
    },
  },
];

const sampleCategories = [
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    isPopular: true,
    isDefault: true,
  },
  {
    name: "Clothing",
    description: "Apparel and fashion items",
    isPopular: true,
    isDefault: true,
  },
  {
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    isPopular: false,
    isDefault: true,
  },
  {
    name: "Sports & Outdoors",
    description: "Sporting goods and outdoor equipment",
    isPopular: true,
    isDefault: true,
  },
  {
    name: "Books & Media",
    description: "Books, magazines, and media content",
    isPopular: false,
    isDefault: true,
  },
  {
    name: "Beauty & Personal Care",
    description: "Beauty products and personal care items",
    isPopular: true,
    isDefault: true,
  },
  {
    name: "Automotive",
    description: "Car parts and automotive accessories",
    isPopular: false,
    isDefault: true,
  },
  {
    name: "Food & Beverages",
    description: "Food items and beverages",
    isPopular: true,
    isDefault: true,
  },
  {
    name: "Health & Wellness",
    description: "Health supplements and wellness products",
    isPopular: false,
    isDefault: true,
  },
  {
    name: "Toys & Games",
    description: "Toys for children and board games",
    isPopular: true,
    isDefault: true,
  },
];

const sampleSuppliers = [
  {
    name: "TechWorld Supplies",
    contactPerson: "David Johnson",
    email: "david@techworld.com",
    phone: "+1555-0101",
    address: {
      street: "123 Tech Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
      full: "123 Tech Street, San Francisco, CA 94105, USA",
    },
    category: "Electronics",
    paymentTerms: "30 days",
    status: "active",
    businessType: "manufacturer",
    taxId: "TX123456789",
    creditLimit: 50000,
    currentBalance: 0,
  },
  {
    name: "Fashion Forward Inc",
    contactPerson: "Emma Wilson",
    email: "emma@fashionforward.com",
    phone: "+1555-0102",
    address: {
      street: "456 Fashion Ave",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      full: "456 Fashion Ave, New York, NY 10001, USA",
    },
    category: "Clothing",
    paymentTerms: "45 days",
    status: "active",
    businessType: "distributor",
    taxId: "TX987654321",
    creditLimit: 75000,
    currentBalance: 0,
  },
  {
    name: "HomeGoods Direct",
    contactPerson: "Robert Chen",
    email: "robert@homegoods.com",
    phone: "+1555-0103",
    address: {
      street: "789 Home Street",
      city: "Chicago",
      state: "IL",
      postalCode: "60601",
      country: "USA",
      full: "789 Home Street, Chicago, IL 60601, USA",
    },
    category: "Home & Garden",
    paymentTerms: "30 days",
    status: "active",
    businessType: "wholesaler",
    taxId: "TX456789123",
    creditLimit: 40000,
    currentBalance: 0,
  },
];

const sampleCustomers = [
  {
    name: "Alice Cooper",
    email: "alice@email.com",
    phone: "+1234567800",
    address: "123 Main St, Anytown, USA",
    isDealer: false,
    totalDue: 0,
  },
  {
    name: "Bob Smith",
    email: "bob@email.com",
    phone: "+1234567801",
    address: "456 Oak Ave, Somewhere, USA",
    isDealer: true,
    totalDue: 0,
  },
  {
    name: "Carol Johnson",
    email: "carol@email.com",
    phone: "+1234567802",
    address: "789 Pine Rd, Elsewhere, USA",
    isDealer: false,
    totalDue: 0,
  },
  {
    name: "David Brown",
    email: "david@email.com",
    phone: "+1234567803",
    address: "321 Elm St, Nowhere, USA",
    isDealer: true,
    totalDue: 0,
  },
];

// Sample products function (to be called after suppliers are created)
const createSampleProducts = (suppliers, adminUserId) => [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system",
    sku: "IPHONE15PRO001",
    category: "Electronics",
    brand: "Apple",
    costPrice: 800,
    sellingPrice: 999,
    wholesalePrice: 900,
    currentStock: 25,
    minStockLevel: 5,
    maxStockLevel: 100,
    supplier: {
      name: suppliers[0].name,
      contact: suppliers[0].phone,
      email: suppliers[0].email,
      address: suppliers[0].address.full,
    },
    barcode: "1234567890123",
    weight: 0.206,
    dimensions: {
      length: 159.9,
      width: 76.7,
      height: 8.25,
    },
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone",
    sku: "GALAXY24001",
    category: "Electronics",
    brand: "Samsung",
    costPrice: 700,
    sellingPrice: 899,
    wholesalePrice: 820,
    currentStock: 30,
    minStockLevel: 5,
    maxStockLevel: 80,
    supplier: {
      name: suppliers[0].name,
      contact: suppliers[0].phone,
      email: suppliers[0].email,
      address: suppliers[0].address.full,
    },
    barcode: "1234567890124",
    weight: 0.196,
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes",
    sku: "NIKE270001",
    category: "Sports & Outdoors",
    brand: "Nike",
    costPrice: 80,
    sellingPrice: 150,
    wholesalePrice: 120,
    currentStock: 50,
    minStockLevel: 10,
    maxStockLevel: 200,
    supplier: {
      name: suppliers[1].name,
      contact: suppliers[1].phone,
      email: suppliers[1].email,
      address: suppliers[1].address.full,
    },
    barcode: "1234567890125",
    weight: 0.8,
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with boost technology",
    sku: "ADIDAS22001",
    category: "Sports & Outdoors",
    brand: "Adidas",
    costPrice: 90,
    sellingPrice: 180,
    wholesalePrice: 140,
    currentStock: 35,
    minStockLevel: 8,
    maxStockLevel: 150,
    supplier: {
      name: suppliers[1].name,
      contact: suppliers[1].phone,
      email: suppliers[1].email,
      address: suppliers[1].address.full,
    },
    barcode: "1234567890126",
    weight: 0.85,
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
  {
    name: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with thermal carafe",
    sku: "COFFEE001",
    category: "Home & Garden",
    brand: "KitchenAid",
    costPrice: 150,
    sellingPrice: 249,
    wholesalePrice: 200,
    currentStock: 15,
    minStockLevel: 3,
    maxStockLevel: 50,
    supplier: {
      name: suppliers[2].name,
      contact: suppliers[2].phone,
      email: suppliers[2].email,
      address: suppliers[2].address.full,
    },
    barcode: "1234567890127",
    weight: 4.5,
    dimensions: {
      length: 35,
      width: 20,
      height: 40,
    },
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    sku: "HEADPHONES001",
    category: "Electronics",
    brand: "Sony",
    costPrice: 120,
    sellingPrice: 199,
    wholesalePrice: 160,
    currentStock: 40,
    minStockLevel: 8,
    maxStockLevel: 120,
    supplier: {
      name: suppliers[0].name,
      contact: suppliers[0].phone,
      email: suppliers[0].email,
      address: suppliers[0].address.full,
    },
    barcode: "1234567890128",
    weight: 0.3,
    isActive: true,
    totalSold: 0,
    createdBy: adminUserId,
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Sale.deleteMany({});

    // Hash passwords for users
    console.log("👥 Creating users...");
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find((user) => user.role === "admin");
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create categories
    console.log("📂 Creating categories...");
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create suppliers
    console.log("🏭 Creating suppliers...");
    const suppliersWithCreatedBy = sampleSuppliers.map((supplier) => ({
      ...supplier,
      createdBy: adminUser._id,
    }));
    const createdSuppliers = await Supplier.insertMany(suppliersWithCreatedBy);
    console.log(`✅ Created ${createdSuppliers.length} suppliers`);

    // Create customers
    console.log("👤 Creating customers...");
    const createdCustomers = await Customer.insertMany(sampleCustomers);
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // Create products
    console.log("📦 Creating products...");
    const productsData = createSampleProducts(createdSuppliers, adminUser._id);
    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create sample sales
    console.log("💰 Creating sample sales...");
    const sampleSales = [
      {
        customer: createdCustomers[0]._id,
        items: [
          {
            product: createdProducts[0]._id,
            productName: createdProducts[0].name,
            quantity: 1,
            unitPrice: createdProducts[0].sellingPrice,
            total: createdProducts[0].sellingPrice,
          },
        ],
        subtotal: createdProducts[0].sellingPrice,
        discountPercentage: 0,
        discountAmount: 0,
        totalAmount: createdProducts[0].sellingPrice,
        paymentMethod: "card",
        paymentStatus: "paid",
        createdBy: adminUser._id,
      },
      {
        customer: createdCustomers[1]._id,
        items: [
          {
            product: createdProducts[2]._id,
            productName: createdProducts[2].name,
            quantity: 2,
            unitPrice: createdProducts[2].wholesalePrice,
            total: createdProducts[2].wholesalePrice * 2,
          },
        ],
        subtotal: createdProducts[2].wholesalePrice * 2,
        discountPercentage: 5,
        discountAmount: createdProducts[2].wholesalePrice * 2 * 0.05,
        totalAmount: createdProducts[2].wholesalePrice * 2 * 0.95,
        paymentMethod: "upi",
        paymentStatus: "paid",
        createdBy: adminUser._id,
      },
    ];

    const createdSales = [];

    // Create sales one by one to ensure pre-save middleware works correctly
    for (const saleData of sampleSales) {
      const sale = new Sale(saleData);
      const savedSale = await sale.save();
      createdSales.push(savedSale);
    }

    console.log(`✅ Created ${createdSales.length} sales`);

    // Update product stock after sales
    console.log("📊 Updating product stock...");
    await Product.findByIdAndUpdate(createdProducts[0]._id, {
      $inc: { currentStock: -1, totalSold: 1 },
      lastSoldDate: new Date(),
    });
    await Product.findByIdAndUpdate(createdProducts[2]._id, {
      $inc: { currentStock: -2, totalSold: 2 },
      lastSoldDate: new Date(),
    });

    // Update category product counts
    console.log("📈 Updating category counts...");
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({
        category: category.name,
        isActive: true,
      });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Seeded data summary:");
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📂 Categories: ${createdCategories.length}`);
    console.log(`🏭 Suppliers: ${createdSuppliers.length}`);
    console.log(`👤 Customers: ${createdCustomers.length}`);
    console.log(`📦 Products: ${createdProducts.length}`);
    console.log(`💰 Sales: ${createdSales.length}`);

    console.log("\n🔑 Login credentials:");
    console.log("Admin: admin@stockify.com / admin123");
    console.log("Manager: manager@stockify.com / manager123");
    console.log("Staff: staff@stockify.com / staff123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase().then(() => {
      console.log("🏁 Seeding process completed. Exiting...");
      process.exit(0);
    });
  });
}

module.exports = { seedDatabase, connectDB };
