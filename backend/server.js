const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");
const authRoutes = require("./src/routes/authRoutes");
const commonRoutes = require("./src/routes/common_route"); // Updated to use common_route.js

dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json()); // Built-in JSON parser

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/common", commonRoutes); // Unified route for keyword scraping and Gemini keyword details

// Start Server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
