const { seedDatabase, connectDB } = require("./seedDatabase");

// CLI argument parser
const args = process.argv.slice(2);
const options = {
  clear: args.includes("--clear"),
  users: args.includes("--users"),
  products: args.includes("--products"),
  sales: args.includes("--sales"),
  help: args.includes("--help") || args.includes("-h"),
  verbose: args.includes("--verbose") || args.includes("-v"),
};

const showHelp = () => {
  console.log(`
🌱 Stockify Database Seeder

Usage:
  npm run seed [options]

Options:
  --clear         Clear all existing data before seeding
  --users         Seed only users data
  --products      Seed only products and related data (categories, suppliers)
  --sales         Seed only sales data (requires existing users, products, customers)
  --verbose, -v   Show detailed logging
  --help, -h      Show this help message

Examples:
  npm run seed                    # Full database seed
  npm run seed -- --clear         # Clear and reseed all data
  npm run seed -- --users         # Seed only users
  npm run seed -- --products      # Seed products, categories, and suppliers
  npm run seed -- --verbose       # Detailed logging
  
Default login credentials after seeding:
  Admin:   admin@stockify.com / admin123
  Manager: manager@stockify.com / manager123
  Staff:   staff@stockify.com / staff123
  `);
};

const main = async () => {
  try {
    if (options.help) {
      showHelp();
      process.exit(0);
    }

    console.log("🚀 Stockify Database Seeder");
    console.log("============================");

    await connectDB();

    if (options.verbose) {
      console.log("Seeding options:", options);
    }

    await seedDatabase();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

main();
