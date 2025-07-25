const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// MongoDB connection URI
const uri = 'mongodb+srv://stocify:sgp_5@inventory-data.huosoy9.mongodb.net/Data?retryWrites=true&w=majority';

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // In production, hash the password!
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Endpoint to register a user
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create and save the new user
        const newUser = new User({ email, password }); // In production, hash the password!
        await newUser.save();
        return res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error during registration' });
    }
});

// Endpoint to login a user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ email });

        if (user && user.password === password) { // In production, compare hashed passwords
            return res.json({ success: true, message: 'Login successful' });
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error during login' });
    }
});

// Test endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Stockify backend API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
