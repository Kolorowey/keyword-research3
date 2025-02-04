const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const connectDB = require('./src/config/dbConfig'); 
const authRoutes = require('./src/routes/authRoutes'); 
const keywordRoutes = require('./src/routes/keywordRoutes'); 
const scraperRoutes = require('./src/routes/scraperRoutes'); 

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB(); 

// Create Express App
const app = express();

// Middleware
app.use(cors({ origin: 'https://keyword-research3-2.onrender.com' })); // Allow requests from your React app
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/scraper', scraperRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
