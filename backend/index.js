const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Stockify backend API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
