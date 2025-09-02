const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId
            }
        },
        googleId: {
            type: String,
            sparse: true // it allows multiple null values
        },
        avtar:
        {
            type: String,
            default: null
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
        lastlogin: {
            type: Date,
            default: null
        },
    },
    { timestamps: true }
)
module.exports = mongoose.model("users", userSchema, "users")