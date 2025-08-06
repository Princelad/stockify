const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');
const passport = require('../config/passport');


router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes working!'
    });
});
// Test route for Google OAuth configuration
router.get('/test-google', (req, res) => {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    res.json({
        success: true,
        message: 'Google OAuth configuration test',
        configured: isConfigured,
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'
    });
});

// Registration route
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// token varificaton
router.get('/verify',auth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                avatar: req.user.avatar
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token verification'
        });
    }
});

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/signup?error=auth_failed` }),
    async (req, res) => {
        try {
            console.log('Google OAuth callback hit, user:', req.user?.email);
            
            // Generate JWT token
            const token = jwt.sign(
                { id: req.user._id, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Update last login
            req.user.lastLogin = new Date();
            await req.user.save();

            console.log('Google OAuth success, redirecting with token');

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Google auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/signup?error=server_error`);
        }
    }
);

module.exports = router;
