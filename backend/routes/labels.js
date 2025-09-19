const express = require('express');
const router = express.Router();
const {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateLabels,
    generateLabelPDF
} = require('../controllers/labelController');
const auth = require('../middleware/auth');

// =====================================================
// MIDDLEWARE - All routes require authentication
// =====================================================
router.use(auth);

// =====================================================
// TEMPLATE MANAGEMENT ROUTES
// =====================================================

/**
 * GET /api/labels/templates
 * Purpose: Get all label templates for the user
 * Used by: Label printing page template selection
 */
router.get('/templates', getTemplates);

/**
 * POST /api/labels/templates
 * Purpose: Create a new custom label template
 * Used by: Template creation/customization
 * Body: { name, size, fields, layout, customSettings }
 */
router.post('/templates', createTemplate);

/**
 * PUT /api/labels/templates/:id
 * Purpose: Update existing template
 * Used by: Template editing
 */
router.put('/templates/:id', updateTemplate);

/**
 * DELETE /api/labels/templates/:id
 * Purpose: Delete a custom template
 * Used by: Template management
 */
router.delete('/templates/:id', deleteTemplate);

// =====================================================
// LABEL GENERATION ROUTES
// =====================================================

/**
 * POST /api/labels/generate
 * Purpose: Generate label data for preview/printing
 * Used by: Label preview, print preparation
 * Body: { templateId, products, customText, quantity }
 */
router.post('/generate', generateLabels);

/**
 * POST /api/labels/pdf
 * Purpose: Generate printable PDF labels
 * Used by: Label printing, PDF export
 * Body: { templateId, products, customText, quantity, options }
 */
router.post('/pdf', generateLabelPDF);

// =====================================================
// ROUTE DOCUMENTATION
// =====================================================

/**
 * GET /api/labels/test/routes
 * Purpose: List all available routes for testing/documentation
 * Used by: Development, API documentation
 */
router.get('/test/routes', (req, res) => {
    res.json({
        success: true,
        message: 'Label API Routes',
        routes: {
            templates: {
                'GET /templates': 'Get all label templates',
                'POST /templates': 'Create new template',
                'PUT /templates/:id': 'Update template',
                'DELETE /templates/:id': 'Delete template'
            },
            generation: {
                'POST /generate': 'Generate label data for preview',
                'POST /pdf': 'Generate printable PDF labels'
            }
        },
        examples: {
            createTemplate: {
                name: 'Custom Price Tag',
                size: '2x1',
                fields: ['name', 'price', 'sku'],
                layout: 'single',
                customSettings: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    backgroundColor: '#ffffff',
                    textColor: '#000000'
                }
            },
            generateLabels: {
                templateId: '507f1f77bcf86cd799439011',
                products: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
                quantity: 2
            },
            generateCustomLabels: {
                templateId: '507f1f77bcf86cd799439011',
                customText: 'Sale - 50% Off!',
                quantity: 10
            }
        }
    });
});

module.exports = router;