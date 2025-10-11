const Category = require("../models/Category");
const Product = require("../models/Product");
const { ok, fail } = require("../utils/responder");

/**
 * GET ALL CATEGORIES
 * Purpose: Get all categories with product counts and dynamic popular categories
 */
const getCategories = async (req, res) => {
  try {
    if (!req.user) {
      return fail(res, null, "Authentication required", 401);
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

    return ok(res, {
      categories: categoriesArray,
      popular: categoriesArray.filter((cat) => cat.isPopular),
      userCreated: categoriesArray.filter((cat) => cat.type === "user_created"),
      fromProducts: categoriesArray.filter(
        (cat) => cat.type === "from_products"
      ),
      total: categoriesArray.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return fail(res, error, "Error fetching categories");
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
      return fail(res, null, "Category name is required", 400);
    }

    // Check if category already exists (case-insensitive, per-tenant)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isActive: true,
      createdBy: req.user._id,
    });

    if (existingCategory) {
      return fail(res, null, "Category already exists", 400);
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      createdBy: req.user._id,
      isPopular: false,
      isDefault: false,
    });

    const savedCategory = await category.save();

    return ok(res, savedCategory, "Category created successfully", 201);
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return fail(res, null, "Category with this name already exists", 400);
    }

    return fail(res, error, "Error creating category");
  }
};

/**
 * GET POPULAR CATEGORIES
 * Purpose: Get dynamically determined popular categories based on usage
 */
const getPopularCategories = async (req, res) => {
  try {
    if (!req.user) {
      return fail(res, null, "Authentication required", 401);
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

    return ok(res, popularCategories);
  } catch (error) {
    console.error("Get popular categories error:", error);
    return fail(res, error, "Error fetching popular categories");
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
      return fail(
        res,
        null,
        "Category not found or you do not have permission to update it",
        404
      );
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
        return fail(res, null, "Category with this name already exists", 400);
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description?.trim();
    }

    const updatedCategory = await category.save();

    return ok(res, updatedCategory, "Category updated successfully");
  } catch (error) {
    console.error("Update category error:", error);
    return fail(res, error, "Error updating category");
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
      return fail(
        res,
        null,
        "Category not found or you do not have permission to delete it",
        404
      );
    }

    // Check if category is being used by products
    const productsUsingCategory = await Product.countDocuments({
      category: category.name,
      isActive: true,
      createdBy: req.user._id,
    });

    if (productsUsingCategory > 0) {
      return fail(
        res,
        null,
        `Cannot delete category. It is being used by ${productsUsingCategory} product(s).`,
        400
      );
    }

    category.isActive = false;
    await category.save();

    return ok(res, null, "Category deleted successfully");
  } catch (error) {
    console.error("Delete category error:", error);
    return fail(res, error, "Error deleting category");
  }
};

module.exports = {
  getCategories,
  createCategory,
  getPopularCategories,
  updateCategory,
  deleteCategory,
};
