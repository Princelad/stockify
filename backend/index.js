const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Dummy user for demonstration
const DUMMY_USER = {
    email: 'user@example.com',
    password: 'password123' // In production, use hashed passwords!
};

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
        // In production, return a JWT or session
        return res.json({ success: true, message: 'Login successful' });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/', (req, res) => {
    res.send('Welcome to the Stockify backend API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
