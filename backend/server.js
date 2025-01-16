const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./src/config/dbConfig'); 
const authRoutes = require('./src/routes/authRoutes'); 
const keywordRoutes = require('./src/routes/keywordRoutes'); 

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB(); // Calls the existing MongoDB connection logic from dbConfig

// Create Express App
const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
