const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            default: 'staff'
        },
        isActive: {
            type: Boolean,
            dafault: true
        },
    },
    { timestamps: true }
)
module.exports = mongoose.model("users", userSchema, "users")