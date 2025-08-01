// main file for the backend
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const authRoutes = require('./routes/auth');

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/auth', authRoutes)

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("MongoDB connected successfully")
        const port = process.env.PORT || 5000
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    }).catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });