const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const scraperRoutes = require("./src/routes/scraperRoutes");
const geminiSpamCheckerRoutes = require("./src/routes/gemini_api_tool");
const commonRoutes = require("./src/routes/common_route");
const keywordEverywhereRoutes = require("./src/routes/keyword_Everywhere");
const updateProfileRoutes = require("./src/routes/updateProfile");
const adminRoutes = require("./src/routes/adminRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const metaTagRoutes = require("./src/routes/metaTags");  

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Adjust to your domain in production (e.g., "https://yourdomain.com")
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json()); // Built-in JSON parser
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, "dist"))); // Serve files from dist

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/gemini", geminiSpamCheckerRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/keywords", keywordEverywhereRoutes);
app.use("/api/update-profile", updateProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/meta', metaTagRoutes);

app.get("/robots.txt", (req, res) => {
  const robots = `
    User-agent: *
    Allow: /
    Sitemap: https://www.keywordraja.com/api/blogs/sitemap.xml
  `;
  res.type("text/plain");
  res.send(robots);
});

// Handle Client-Side Routing (for React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get("/api/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID, // Use backend .env variable
  });
});

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