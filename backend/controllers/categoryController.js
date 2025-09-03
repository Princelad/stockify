const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * GET ALL CATEGORIES
 * Purpose: Get all categories with product counts, popular categories, and user-created categories
 */
const getCategories = async (req, res) => {
    try {
        // Get default/popular categories
        const defaultCategories = await Category.find({
            isActive: true,
            $or: [
                { isDefault: true },
                { isPopular: true },
                { createdBy: { $exists: false } }
            ]
        }).sort({ isPopular: -1, name: 1 });

        // Get user-created categories
        const userCategories = req.user ? await Category.find({
            isActive: true,
            createdBy: req.user._id
        }).sort({ name: 1 }) : [];

        // Get categories from existing products with their counts (for backward compatibility)
        const productCategories = req.user ? await Product.aggregate([
            { 
                $match: { 
                    isActive: true, 
                    createdBy: req.user._id,
                    category: { $exists: true, $ne: '', $ne: null }
                } 
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1, _id: 1 } }
        ]) : [];

        // Combine and deduplicate categories
        const categoryMap = new Map();

        // Add default/popular categories
        for (const cat of defaultCategories) {
            // Get actual product count for this category
            const productCount = req.user ? await Product.countDocuments({
                category: { $regex: new RegExp(`^${cat.name}$`, 'i') },
                isActive: true,
                createdBy: req.user._id
            }) : 0;

            categoryMap.set(cat.name.toLowerCase(), {
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                count: productCount,
                isPopular: cat.isPopular,
                isDefault: cat.isDefault,
                type: cat.isPopular ? 'predefined' : 'default'
            });
        }

        // Add user categories
        for (const cat of userCategories) {
            // Get actual product count for this category
            const productCount = await Product.countDocuments({
                category: { $regex: new RegExp(`^${cat.name}$`, 'i') },
                isActive: true,
                createdBy: req.user._id
            });

            categoryMap.set(cat.name.toLowerCase(), {
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                count: productCount,
                isPopular: false,
                isDefault: false,
                type: 'user_created'
            });
        }

        // Add product categories that don't exist in Category collection
        for (const cat of productCategories) {
            const categoryKey = cat._id.toLowerCase();
            if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                    _id: cat._id, // Use category name as _id for categories from products
                    name: cat._id,
                    count: cat.count,
                    isPopular: false,
                    isDefault: false,
                    type: 'from_products'
                });
            }
        }

        // Convert to array and sort
        const categoriesArray = Array.from(categoryMap.values());
        
        // Sort: Popular first, then by count, then alphabetically
        categoriesArray.sort((a, b) => {
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            if (a.count !== b.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
        });

        res.json({
            success: true,
            data: {
                categories: categoriesArray,
                popular: categoriesArray.filter(cat => cat.isPopular),
                userCreated: categoriesArray.filter(cat => cat.type === 'user_created'),
                fromProducts: categoriesArray.filter(cat => cat.type === 'from_products'),
                total: categoriesArray.length
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
 * CREATE NEW CATEGORY
 * Purpose: Allow users to create custom categories
 */
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category already exists (case-insensitive)
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            isActive: true
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const category = new Category({
            name: name.trim(),
            description: description?.trim(),
            createdBy: req.user._id,
            isPopular: false,
            isDefault: false
        });

        const savedCategory = await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

/**
 * GET POPULAR CATEGORIES
 * Purpose: Get predefined popular categories for quick selection
 */
const getPopularCategories = async (req, res) => {
    try {
        const popularCategories = await Category.find({
            isActive: true,
            isPopular: true
        }).sort({ name: 1 });

        res.json({
            success: true,
            data: popularCategories
        });
    } catch (error) {
        console.error('Get popular categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching popular categories',
            error: error.message
        });
    }
};

/**
 * UPDATE CATEGORY
 * Purpose: Update category details (only user-created categories)
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findOne({
            _id: id,
            createdBy: req.user._id,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found or you do not have permission to update it'
            });
        }

        if (name && name.trim()) {
            // Check if new name conflicts with existing category
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: id },
                isActive: true
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }

            category.name = name.trim();
        }

        if (description !== undefined) {
            category.description = description?.trim();
        }

        const updatedCategory = await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

/**
 * DELETE CATEGORY (SOFT DELETE)
 * Purpose: Soft delete user-created categories
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({
            _id: id,
            createdBy: req.user._id,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found or you do not have permission to delete it'
            });
        }

        // Check if category is being used by products
        const productsUsingCategory = await Product.countDocuments({
            category: category.name,
            isActive: true,
            createdBy: req.user._id
        });

        if (productsUsingCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is being used by ${productsUsingCategory} product(s).`
            });
        }

        category.isActive = false;
        await category.save();

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

/**
 * SEED DEFAULT CATEGORIES
 * Purpose: Initialize popular categories for new installations
 */
const seedDefaultCategories = async () => {
    try {
        const defaultCategories = [
            { name: 'Electronics', description: 'Electronic devices and accessories', isPopular: true },
            { name: 'Clothing', description: 'Apparel and fashion items', isPopular: true },
            { name: 'Home & Garden', description: 'Home improvement and garden supplies', isPopular: true },
            { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', isPopular: true },
            { name: 'Books & Media', description: 'Books, movies, and media content', isPopular: true },
            { name: 'Health & Beauty', description: 'Health and beauty products', isPopular: true },
            { name: 'Food & Beverages', description: 'Food items and beverages', isPopular: true },
            { name: 'Automotive', description: 'Car parts and automotive accessories', isPopular: true },
            { name: 'Office Supplies', description: 'Office and business supplies', isPopular: true },
            { name: 'Toys & Games', description: 'Toys and gaming products', isPopular: true }
        ];

        for (const catData of defaultCategories) {
            const existingCategory = await Category.findOne({ name: catData.name });
            if (!existingCategory) {
                const category = new Category({
                    ...catData,
                    isDefault: true
                });
                await category.save();
            }
        }

        console.log('Default categories seeded successfully');
    } catch (error) {
        console.error('Error seeding default categories:', error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    getPopularCategories,
    updateCategory,
    deleteCategory,
    seedDefaultCategories
};
