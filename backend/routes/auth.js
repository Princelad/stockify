const express = require('express')
const router = express.router()
const { rigisterUser } = require('../controllers/authController')
const validateRegister = require('../middleware/validation')


router.post('/register', validateRegister, registerUser)           
module.exports = router
