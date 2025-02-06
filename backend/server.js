const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/dbConfig');
const authRoutes = require('./src/routes/authRoutes');
const keywordRoutes = require('./src/routes/keywordRoutes');
const scraperRoutes = require('./src/routes/scraperRoutes');
const geminiSpamCheckerRoutes = require('./src/routes/gemini_spam_checker'); // Import the gemini_spam_checker route

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App (MUST be before app.use)
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://keyword-research3-2.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/gemini', geminiSpamCheckerRoutes); // Add this route

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
