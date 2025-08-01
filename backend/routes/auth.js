const express = require('express')
const router = express.Router()
const rigisterUser = require('../controllers/authController')
const validateRegister = require('../middleware/validation')


router.post('/register', validateRegister, rigisterUser)
module.exports = router
