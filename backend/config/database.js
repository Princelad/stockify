const mongoose = require("mongoose");

const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `✅ MongoDB connected successfully to: ${conn.connection.host}`
    );
    console.log(`📂 Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
module.exports = ConnectDb;
