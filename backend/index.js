const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config();

// Import passport configuration
require('./config/passport');
const passport = require('passport');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products'); // ADD THIS LINE

// Middleware
app.use(express.json());

// Enhanced CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173'
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Stockify Backend API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            health: '/',
            documentation: '/api/products/test/routes'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // ADD THIS LINE

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
            console.log(`📋 API Documentation: http://localhost:${port}/api/products/test/routes`);
            console.log(`🔐 Google OAuth: http://localhost:${port}/api/auth/google`);
            console.log(`📦 Products API: http://localhost:${port}/api/products`);
            console.log(`📊 Dashboard Stats: http://localhost:${port}/api/products/dashboard-stats`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    
    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            error: 'Origin not allowed'
        });
    }
    
    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler - must be last
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            auth: '/api/auth/*',
            products: '/api/products/*',
            documentation: '/api/products/test/routes'
        }
    });
});

