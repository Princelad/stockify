const joi = require('joi')

const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
})
exports.validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body)
    if (error) return res.status(400).json({
        message: error.details[0].message
    })
    next()
}