const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const user = require('../models/Users')

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const exisstingUser = await user.findOne({ email })
        if (exisstingUser) {
            return res.status(400).json({ msg: "User already exist" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = new user({
            name,
            email,
            password: hashedPass,
            role: 'staff',
            isActive: true
        })
        await newUser.save()

        const token = jwt.sign(
            {
                id: newUser._id, role: newUser.role
            }, process.env.JWT_SECRET, { expiresIn: '7d' }
        )
        res.status(201).json({
            message: 'User registered Successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }, token
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}