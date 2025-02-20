const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");

const authRoutes = require("./src/routes/authRoutes");
const scraperRoutes = require("./src/routes/scraperRoutes");
const geminiSpamCheckerRoutes = require("./src/routes/gemini_api_tool");
const commonRoutes = require("./src/routes/common_route");
const keywordEverywhereRoutes = require("./src/routes/keyword_Everywhere"); // Adjust the filename if needed

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins (Can be restricted later)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json()); // Built-in JSON parser

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/gemini", geminiSpamCheckerRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/keywords", keywordEverywhereRoutes);

// Start Server after DB connection
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit on DB failure
  }
};

startServer();
