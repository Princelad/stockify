const mongoose = require("mongoose");
require("dotenv").config();

const checkEnvironment = async () => {
  console.log("🔍 Checking Environment for Database Seeding");
  console.log("============================================");

  // Check environment variables
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
  const missingEnvVars = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.log("❌ Missing environment variables:");
    missingEnvVars.forEach((envVar) => {
      console.log(`   • ${envVar}`);
    });
    console.log("\n💡 Please check your .env file");
    return false;
  }

  console.log("✅ Environment variables found");

  // Check database connection
  try {
    console.log("🔗 Testing database connection...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Database connected: ${conn.connection.host}`);
    console.log(`📂 Database name: ${conn.connection.name}`);

    // Check if database is empty or has existing data
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.length === 0) {
      console.log("📭 Database is empty - ready for seeding");
    } else {
      console.log("📊 Existing collections found:");
      for (const collection of collections) {
        const count = await mongoose.connection.db
          .collection(collection.name)
          .countDocuments();
        console.log(`   • ${collection.name}: ${count} documents`);
      }
      console.log(
        '\n⚠️  Consider running "npm run db:clear -- --confirm" before seeding'
      );
    }

    await mongoose.connection.close();
    console.log("\n🎉 Environment is ready for database seeding!");
    console.log("\n🚀 To seed the database, run: npm run seed");
    return true;
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
    console.log("\n💡 Please check:");
    console.log("   • MongoDB server is running");
    console.log("   • MONGO_URI is correct");
    console.log("   • Network connectivity");
    console.log("   • Database credentials");
    return false;
  }
};

// Run the check
checkEnvironment()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Environment check failed:", error);
    process.exit(1);
  });
