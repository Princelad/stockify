const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getCategories,
    createCategory,
    getPopularCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Public routes (no auth required)
router.get('/popular', getPopularCategories);

// Protected routes (require authentication)
router.get('/', auth, getCategories);
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
