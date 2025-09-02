const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Products API is working!'
    });
});

module.exports = router;
