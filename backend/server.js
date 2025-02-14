const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/dbConfig');
const authRoutes = require('./src/routes/authRoutes');
const keywordRoutes = require('./src/routes/keywordRoutes');
const scraperRoutes = require('./src/routes/scraperRoutes');
const geminiSpamCheckerRoutes = require('./src/routes/gemini_api_tool');
const keywordMetricsRoutes = require('./src/routes/keywordMetricsRoutes'); // Added keyword-metrics route

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (Can be restricted later)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json()); // Built-in JSON parser

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/gemini', geminiSpamCheckerRoutes);
app.use('/api/keyword-metrics', keywordMetricsRoutes);

// Start Server after DB connection
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1); // Exit on DB failure
  }
};

startServer();
