const Category = require("../models/Category");
const Product = require("../models/Product");

/**
 * GET ALL CATEGORIES
 * Purpose: Get all categories with product counts and dynamic popular categories
 */
const getCategories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user-created categories
    const userCategories = await Category.find({
      isActive: true,
      createdBy: req.user._id,
    }).sort({ name: 1 });

    // Get categories from existing products with their counts
    const productCategories = await Product.aggregate([
      {
        $match: {
          isActive: true,
          createdBy: req.user._id,
          category: { $exists: true, $ne: "", $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]);

    // Combine and deduplicate categories
    const categoryMap = new Map();

    // Add user categories with their product counts
    for (const cat of userCategories) {
      const productCount = await Product.countDocuments({
        category: { $regex: new RegExp(`^${cat.name}$`, "i") },
        isActive: true,
        createdBy: req.user._id,
      });

      categoryMap.set(cat.name.toLowerCase(), {
        _id: cat._id,
        name: cat.name,
        description: cat.description,
        count: productCount,
        type: "user_created",
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
          type: "from_products",
        });
      }
    }

    // Convert to array and calculate popular categories dynamically
    const categoriesArray = Array.from(categoryMap.values());

    // Determine popular categories (top 25% by product count, minimum 3 products)
    const minProductsForPopular = 3;
    const popularThreshold = Math.ceil(categoriesArray.length * 0.25);
    const sortedByCount = [...categoriesArray].sort(
      (a, b) => b.count - a.count
    );

    // Mark categories as popular based on product count
    const popularCategoryNames = new Set();
    let popularCount = 0;
    for (const cat of sortedByCount) {
      if (
        cat.count >= minProductsForPopular &&
        popularCount < Math.max(popularThreshold, 3)
      ) {
        popularCategoryNames.add(cat.name);
        popularCount++;
      }
    }

    // Add isPopular flag to categories
    categoriesArray.forEach((cat) => {
      cat.isPopular = popularCategoryNames.has(cat.name);
    });

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
        popular: categoriesArray.filter((cat) => cat.isPopular),
        userCreated: categoriesArray.filter(
          (cat) => cat.type === "user_created"
        ),
        fromProducts: categoriesArray.filter(
          (cat) => cat.type === "from_products"
        ),
        total: categoriesArray.length,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
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
        message: "Category name is required",
      });
    }

    // Check if category already exists (case-insensitive, per-tenant)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isActive: true,
      createdBy: req.user._id,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      createdBy: req.user._id,
      isPopular: false,
      isDefault: false,
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

/**
 * GET POPULAR CATEGORIES
 * Purpose: Get dynamically determined popular categories based on usage
 */
const getPopularCategories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get categories with product counts
    const productCategories = await Product.aggregate([
      {
        $match: {
          isActive: true,
          createdBy: req.user._id,
          category: { $exists: true, $ne: "", $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]);

    // Determine popular categories (top 25% by product count, minimum 3 products)
    const minProductsForPopular = 3;
    const popularThreshold = Math.ceil(productCategories.length * 0.25);

    const popularCategories = productCategories
      .filter((cat) => cat.count >= minProductsForPopular)
      .slice(0, Math.max(popularThreshold, 3))
      .map((cat) => ({
        _id: cat._id,
        name: cat._id,
        count: cat.count,
        isPopular: true,
        type: "popular",
      }));

    res.json({
      success: true,
      data: popularCategories,
    });
  } catch (error) {
    console.error("Get popular categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular categories",
      error: error.message,
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
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found or you do not have permission to update it",
      });
    }

    if (name && name.trim()) {
      // Check if new name conflicts with existing category
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id },
        isActive: true,
        createdBy: req.user._id,
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
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
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
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
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found or you do not have permission to delete it",
      });
    }

    // Check if category is being used by products
    const productsUsingCategory = await Product.countDocuments({
      category: category.name,
      isActive: true,
      createdBy: req.user._id,
    });

    if (productsUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${productsUsingCategory} product(s).`,
      });
    }

    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getPopularCategories,
  updateCategory,
  deleteCategory,
};
