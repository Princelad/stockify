const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const fs = require("fs");

// Load environment variables first
dotenv.config();

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDirs = [
    "uploads",
    "uploads/avatars",
    "uploads/pdfs",
    "uploads/labels",
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// Import database connection
const ConnectDb = require("./config/database");

// Import passport configuration
require("./config/passport");
const passport = require("passport");

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categoryRoutes");
const salesRoutes = require("./routes/sales");
const customerRoutes = require("./routes/customers");
const supplierRoutes = require("./routes/suppliers");
const labelRoutes = require("./routes/labels");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");

// Middleware
app.use(express.json());

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
      ].filter(Boolean);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${
      req.path
    } - Origin: ${req.get("Origin")}`
  );
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Stockify Backend API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      sales: "/api/sales",
      customers: "/api/customers",
      suppliers: "/api/suppliers",
      categories: "/api/categories",
      labels: "/api/labels",
      reports: "/api/reports",
      users: "/api/users",
      health: "/",
      documentation: "/api/products/test/routes",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to database
    await ConnectDb();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(
        `📋 API Documentation: http://localhost:${port}/api/products/test/routes`
      );
      console.log(`🔐 Google OAuth: http://localhost:${port}/api/auth/google`);
      console.log(`📦 Products API: http://localhost:${port}/api/products`);
      console.log(
        `📊 Dashboard Stats: http://localhost:${port}/api/products/dashboard-stats`
      );
      console.log(`🏷️ Categories API: http://localhost:${port}/api/categories`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      error: "Origin not allowed",
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      auth: "/api/auth/*",
      products: "/api/products/*",
      documentation: "/api/products/test/routes",
    },
  });
});
