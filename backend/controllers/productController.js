const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * GET DASHBOARD STATISTICS
 * Purpose: Provides comprehensive business overview for dashboard
 * Features: Stock alerts, sales trends, supplier analytics, multi-tier pricing insights
 */
const getDashboardStats = async (req, res) => {
    try {
        // Basic product counts
        const totalProducts = await Product.countDocuments({ isActive: true });
        const lowStockProducts = await Product.countDocuments({
            isActive: true,
            $expr: { $lte: ['$currentStock', '$minStockLevel'] }
        });
        const outOfStockProducts = await Product.countDocuments({
            isActive: true,
            currentStock: 0
        });

        // Multi-tier pricing analysis
        const pricingAnalysis = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCostValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
                    totalRetailValue: { $sum: { $multiply: ['$currentStock', '$sellingPrice'] } },
                    totalWholesaleValue: { $sum: { $multiply: ['$currentStock', '$wholesalePrice'] } },
                    avgRetailMargin: { 
                        $avg: { 
                            $divide: [
                                { $subtract: ['$sellingPrice', '$costPrice'] },
                                '$costPrice'
                            ]
                        }
                    },
                    avgWholesaleMargin: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$wholesalePrice', '$costPrice'] },
                                '$costPrice'
                            ]
                        }
                    }
                }
            }
        ]);

        // Supplier analytics
        const supplierStats = await Product.aggregate([
            { $match: { isActive: true, 'supplier.name': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$supplier.name',
                    productCount: { $sum: 1 },
                    totalStockValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
                    avgCostPrice: { $avg: '$costPrice' },
                    lowStockItems: {
                        $sum: {
                            $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { productCount: -1 } },
            { $limit: 10 }
        ]);

        // Category distribution with stock levels
        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    productCount: { $sum: 1 },
                    totalStock: { $sum: '$currentStock' },
                    totalValue: { $sum: { $multiply: ['$currentStock', '$sellingPrice'] } },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { productCount: -1 } }
        ]);

        // Recent stock movements (products added/updated recently)
        const recentActivity = await Product.find({ isActive: true })
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('name sku currentStock updatedAt category supplier.name')
            .populate('createdBy', 'name');

        // Top selling products (by totalSold)
        const topSellingProducts = await Product.find({ 
            isActive: true,
            totalSold: { $gt: 0 }
        })
        .sort({ totalSold: -1 })
        .limit(5)
        .select('name sku totalSold sellingPrice category lastSoldDate');

        // Critical alerts
        const criticalAlerts = await Product.find({
            isActive: true,
            currentStock: 0
        }).select('name sku category supplier.name');

        res.json({
            success: true,
            data: {
                overview: {
                    totalProducts,
                    lowStockProducts,
                    outOfStockProducts,
                    totalSuppliers: supplierStats.length,
                    totalCategories: categoryStats.length
                },
                pricingAnalysis: pricingAnalysis[0] || {},
                supplierStats,
                categoryStats,
                recentActivity,
                topSellingProducts,
                criticalAlerts
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

/**
 * GET ALL PRODUCTS WITH ADVANCED FILTERING
 * Purpose: Product listing with multi-supplier support and comprehensive filters
 * Features: Search, supplier filter, price range, stock status, sorting
 */
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            brand,
            supplier,
            lowStock,
            outOfStock,
            priceMin,
            priceMax,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build dynamic filter
        const filter = { isActive: true };

        // Multi-field search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'supplier.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Brand filter
        if (brand && brand !== 'all') {
            filter.brand = brand;
        }

        // Supplier filter
        if (supplier && supplier !== 'all') {
            filter['supplier.name'] = supplier;
        }

        // Stock status filters
        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
        }
        if (outOfStock === 'true') {
            filter.currentStock = 0;
        }

        // Price range filter
        if (priceMin || priceMax) {
            filter.sellingPrice = {};
            if (priceMin) filter.sellingPrice.$gte = parseFloat(priceMin);
            if (priceMax) filter.sellingPrice.$lte = parseFloat(priceMax);
        }

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(filter)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('createdBy', 'name email')
            .lean();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

/**
 * MULTI-SUPPLIER PRODUCT MANAGEMENT
 * Purpose: Handle same products from different suppliers with unified inventory
 * Used by: Supplier comparison, purchase decisions, cost analysis
 */
const getProductsBySupplier = async (req, res) => {
    try {
        const { supplierName } = req.params;
        
        const products = await Product.find({
            'supplier.name': { $regex: supplierName, $options: 'i' },
            isActive: true
        }).sort({ name: 1 });

        // Group same products from different suppliers
        const productGroups = {};
        products.forEach(product => {
            const key = `${product.name.toLowerCase()}-${product.category.toLowerCase()}`;
            if (!productGroups[key]) {
                productGroups[key] = {
                    productName: product.name,
                    category: product.category,
                    suppliers: []
                };
            }
            productGroups[key].suppliers.push({
                supplier: product.supplier,
                sku: product.sku,
                costPrice: product.costPrice,
                sellingPrice: product.sellingPrice,
                currentStock: product.currentStock,
                lastUpdated: product.updatedAt
            });
        });

        res.json({
            success: true,
            data: {
                supplier: supplierName,
                totalProducts: products.length,
                productGroups: Object.values(productGroups)
            }
        });
    } catch (error) {
        console.error('Get products by supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching supplier products',
            error: error.message
        });
    }
};

/**
 * BULK IMPORT PRODUCTS FROM SUPPLIERS
 * Purpose: Import complete product catalogs from suppliers
 * Features: Duplicate handling, validation, supplier linking
 */
const bulkImportProducts = async (req, res) => {
    try {
        const { products, supplierInfo, importOptions = {} } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required'
            });
        }

        const results = {
            successful: [],
            failed: [],
            duplicates: [],
            updated: []
        };

        for (let productData of products) {
            try {
                // Add supplier info to each product
                const enrichedProduct = {
                    ...productData,
                    supplier: supplierInfo,
                    createdBy: req.user._id
                };

                // Check for existing SKU
                const existingProduct = await Product.findOne({ 
                    sku: productData.sku 
                });

                if (existingProduct) {
                    if (importOptions.updateExisting) {
                        // Update existing product
                        const updated = await Product.findByIdAndUpdate(
                            existingProduct._id,
                            enrichedProduct,
                            { new: true, runValidators: true }
                        );
                        results.updated.push(updated);
                    } else {
                        results.duplicates.push({
                            sku: productData.sku,
                            name: productData.name,
                            reason: 'SKU already exists'
                        });
                    }
                } else {
                    // Create new product
                    const newProduct = new Product(enrichedProduct);
                    const saved = await newProduct.save();
                    results.successful.push(saved);
                }
            } catch (error) {
                results.failed.push({
                    product: productData,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk import completed',
            data: {
                summary: {
                    total: products.length,
                    successful: results.successful.length,
                    failed: results.failed.length,
                    duplicates: results.duplicates.length,
                    updated: results.updated.length
                },
                results
            }
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during bulk import',
            error: error.message
        });
    }
};

/**
 * GOODS IN/OUT TRACKING
 * Purpose: Track products coming in and going out of the shop
 * Features: Stock movement logging, delivery tracking, sales integration
 */
const trackStockMovement = async (req, res) => {
    try {
        const { 
            productId, 
            movementType, // 'in' or 'out'
            quantity, 
            reason, 
            referenceNumber,
            supplierInfo,
            customerInfo 
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const oldStock = product.currentStock;
        let newStock;

        if (movementType === 'in') {
            newStock = oldStock + quantity;
            product.currentStock = newStock;
        } else if (movementType === 'out') {
            newStock = Math.max(0, oldStock - quantity);
            product.currentStock = newStock;
            
            // Update sales tracking
            product.totalSold = (product.totalSold || 0) + quantity;
            product.lastSoldDate = new Date();
        }

        await product.save();

        // Create movement record (you might want a separate StockMovement model)
        const movementRecord = {
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            movementType,
            quantity,
            oldStock,
            newStock,
            reason,
            referenceNumber,
            supplierInfo,
            customerInfo,
            performedBy: req.user._id,
            timestamp: new Date()
        };

        res.json({
            success: true,
            message: `Stock ${movementType === 'in' ? 'received' : 'issued'} successfully`,
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    sku: product.sku,
                    oldStock,
                    newStock
                },
                movement: movementRecord
            }
        });
    } catch (error) {
        console.error('Stock movement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking stock movement',
            error: error.message
        });
    }
};

/**
 * MULTI-TIER PRICING SUPPORT
 * Purpose: Get product with different pricing for retail vs wholesale
 * Features: Customer type-based pricing, bulk pricing tiers
 */
const getProductPricing = async (req, res) => {
    try {
        const { productId } = req.params;
        const { customerType = 'retail', quantity = 1 } = req.query;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let applicablePrice;
        let priceType;

        // Determine pricing based on customer type and quantity
        if (customerType === 'wholesale' && product.wholesalePrice) {
            applicablePrice = product.wholesalePrice;
            priceType = 'wholesale';
        } else {
            applicablePrice = product.sellingPrice;
            priceType = 'retail';
        }

        // Calculate total for quantity
        const totalPrice = applicablePrice * quantity;
        const totalCost = product.costPrice * quantity;
        const profit = totalPrice - totalCost;
        const profitMargin = ((profit / totalCost) * 100).toFixed(2);

        res.json({
            success: true,
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    sku: product.sku,
                    currentStock: product.currentStock
                },
                pricing: {
                    costPrice: product.costPrice,
                    retailPrice: product.sellingPrice,
                    wholesalePrice: product.wholesalePrice,
                    applicablePrice,
                    priceType,
                    quantity,
                    totalPrice,
                    profit,
                    profitMargin: `${profitMargin}%`
                },
                availability: {
                    inStock: product.currentStock >= quantity,
                    availableQuantity: product.currentStock,
                    isLowStock: product.currentStock <= product.minStockLevel
                }
            }
        });
    } catch (error) {
        console.error('Get product pricing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product pricing',
            error: error.message
        });
    }
};

/**
 * SALES INTEGRATION - UPDATE STOCK AFTER SALE
 * Purpose: Automatically update stock levels when generating customer bills
 * Features: Multi-product updates, stock validation, sales tracking
 */
const processSale = async (req, res) => {
    try {
        const { 
            products, // Array of {productId, quantity, priceUsed}
            customerInfo,
            saleReference,
            paymentMethod 
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const saleResults = [];
            let totalSaleValue = 0;

            for (let saleItem of products) {
                const product = await Product.findById(saleItem.productId).session(session);
                
                if (!product) {
                    throw new Error(`Product not found: ${saleItem.productId}`);
                }

                if (product.currentStock < saleItem.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${saleItem.quantity}`);
                }

                // Update stock
                product.currentStock -= saleItem.quantity;
                product.totalSold = (product.totalSold || 0) + saleItem.quantity;
                product.lastSoldDate = new Date();
                
                await product.save({ session });

                const itemTotal = saleItem.quantity * saleItem.priceUsed;
                totalSaleValue += itemTotal;

                saleResults.push({
                    productId: product._id,
                    name: product.name,
                    sku: product.sku,
                    quantitySold: saleItem.quantity,
                    priceUsed: saleItem.priceUsed,
                    itemTotal,
                    remainingStock: product.currentStock
                });
            }

            await session.commitTransaction();

            res.json({
                success: true,
                message: 'Sale processed successfully',
                data: {
                    saleReference,
                    customerInfo,
                    products: saleResults,
                    totalSaleValue,
                    paymentMethod,
                    processedAt: new Date()
                }
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Process sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing sale',
            error: error.message
        });
    }
};

// ... (keep other existing functions like getProduct, createProduct, updateProduct, deleteProduct, etc.)

/**
 * GET SINGLE PRODUCT BY ID
 */
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const productData = product.toObject({ virtuals: true });

        res.json({
            success: true,
            data: productData
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

/**
 * CREATE NEW PRODUCT
 */
const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user._id
        };

        const product = new Product(productData);
        const savedProduct = await product.save();
        await savedProduct.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });
    } catch (error) {
        console.error('Create product error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

/**
 * UPDATE EXISTING PRODUCT
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

/**
 * DELETE PRODUCT (SOFT DELETE)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

/**
 * UPDATE STOCK LEVELS
 */
const updateStock = async (req, res) => {
    try {
        const { productId, quantity, operation = 'set', reason } = req.body;

        if (!productId || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID or quantity'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const oldStock = product.currentStock;
        let newStock;

        switch (operation) {
            case 'add':
                newStock = oldStock + quantity;
                break;
            case 'subtract':
                newStock = Math.max(0, oldStock - quantity);
                break;
            case 'set':
            default:
                newStock = quantity;
                break;
        }

        product.currentStock = newStock;
        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: {
                productId: product._id,
                name: product.name,
                sku: product.sku,
                oldStock,
                newStock,
                operation,
                reason: reason || 'Manual adjustment'
            }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message
        });
    }
};

/**
 * GET CATEGORIES LIST
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        const categoriesWithCount = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                categories: categories.filter(cat => cat),
                categoriesWithCount: categoriesWithCount.filter(cat => cat._id)
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

/**
 * GET SUPPLIERS LIST
 */
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Product.aggregate([
            { $match: { isActive: true, 'supplier.name': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$supplier.name',
                    contact: { $first: '$supplier.contact' },
                    email: { $first: '$supplier.email' },
                    address: { $first: '$supplier.address' },
                    productCount: { $sum: 1 },
                    totalStockValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
                }
            },
            { $sort: { productCount: -1 } }
        ]);

        // Map the suppliers to match the expected frontend format
        const mappedSuppliers = suppliers.map(supplier => ({
            _id: supplier._id, // Using supplier name as _id since we group by name
            name: supplier._id,
            contact: supplier.contact || '',
            email: supplier.email || '',
            address: supplier.address || '',
            productCount: supplier.productCount,
            totalValue: supplier.totalStockValue
        }));

        res.json({
            success: true,
            data: mappedSuppliers
        });
    } catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suppliers',
            error: error.message
        });
    }
};

module.exports = {
    // Core CRUD
    getDashboardStats,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    
    // Multi-supplier support
    getProductsBySupplier,
    
    // Bulk operations
    bulkImportProducts,
    
    // Stock tracking
    trackStockMovement,
    
    // Pricing
    getProductPricing,
    
    // Sales integration
    processSale,
    
    // Utilities
    getCategories,
    getSuppliers
};
