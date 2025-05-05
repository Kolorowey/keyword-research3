const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Blog = require("../models/Blog");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const winston = require("winston");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "admin-actions.log" }),
    new winston.transports.Console(),
  ],
});

// Rate limiter: max 100 requests per 15 minutes per IP
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware to enhance security headers
router.use(helmet());

// Enhanced admin middleware with explicit role check and logging
const enhancedAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    logger.warn(`Unauthorized access attempt to admin route: ${req.originalUrl}`);
    return res.status(401).json({ message: "Unauthorized: No user authenticated" });
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.isAdmin) {
    logger.warn(`Non-admin access attempt by user ${req.user._id} to ${req.originalUrl}`);
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  logger.info(`Admin ${user.email} accessed ${req.originalUrl}`);
  next();
});

// Define upload directory
const uploadDir = path.join(__dirname, "../../Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed!"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Multer config for ads.txt uploads
const textStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "ads.txt"), // Always save as ads.txt
});
const textUpload = multer({
  storage: textStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain") cb(null, true);
    else cb(new Error("Only .txt files are allowed!"), false);
  },
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get(
  "/users",
  protect,
  enhancedAdmin,
  adminRateLimiter,
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find({}, "firstName lastName email username -_id");
      const userCount = await User.countDocuments();

      res.json({ userCount, users });
    } catch (error) {
      logger.error(`Error fetching users by admin ${req.user.email}: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// @route   GET /api/admin/blogs/count
// @desc    Get counts of published and draft blogs (Admin only)
// @access  Private (Admin)
router.get(
  "/blogs/count",
  protect,
  enhancedAdmin,
  adminRateLimiter,
  asyncHandler(async (req, res) => {
    try {
      const publishedCount = await Blog.countDocuments({ published: true });
      const draftCount = await Blog.countDocuments({ published: false });
      const totalCount = publishedCount + draftCount;

      logger.info(`Blog counts retrieved by admin ${req.user.email}: Published=${publishedCount}, Draft=${draftCount}, Total=${totalCount}`);

      res.status(200).json({
        publishedCount,
        draftCount,
        totalCount,
      });
    } catch (error) {
      logger.error(`Error fetching blog counts by admin ${req.user.email}: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// @route   PUT /api/admin/blogs/:slug
// @desc    Update a blog post (Admin only)
// @access  Private (Admin)
router.put(
  "/blogs/:slug",
  protect,
  enhancedAdmin,
  adminRateLimiter,
  imageUpload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const {
        title,
        metaTitle,
        slug: newSlug,
        topic,
        shortDescription,
        metaDescription,
        content,
        imageUrl,
        imageAlt,
        tags,
        metaKeywords,
        published,
        publishedBy,
        publisherLinkedIn,
      } = req.body;

      const blog = await Blog.findOne({ slug: req.params.slug });
      if (!blog) {
        logger.warn(`Blog not found for slug ${req.params.slug} by admin ${req.user.email}`);
        return res.status(404).json({ message: "Blog not found" });
      }

      // Check if new slug is taken (excluding the current blog)
      if (newSlug && newSlug !== req.params.slug) {
        const slugExists = await Blog.findOne({ slug: newSlug });
        if (slugExists) {
          logger.warn(`Slug ${newSlug} already exists, attempted by admin ${req.user.email}`);
          return res.status(400).json({ message: "Slug already exists" });
        }
      }

      let imageData = blog.images;
      if (req.file) {
        const originalPath = `/Uploads/${req.file.filename}`;
        const heroPath = `/Uploads/hero-${req.file.filename}`;
        const thumbnailPath = `/Uploads/thumb-${req.file.filename}`;

        try {
          await sharp(req.file.path)
            .resize({ width: 1600, height: 900, fit: "cover" })
            .toFile(path.join(uploadDir, `hero-${req.file.filename}`));
          await sharp(req.file.path)
            .resize({ width: 400, height: 400, fit: "cover" })
            .toFile(path.join(uploadDir, `thumb-${req.file.filename}`));
        } catch (err) {
          logger.error(`Image processing failed for blog ${req.params.slug} by admin ${req.user.email}: ${err.message}`);
          return res.status(500).json({ message: "Image processing failed" });
        }

        imageData = { original: originalPath, hero: heroPath, thumbnail: thumbnailPath };
      } else if (imageUrl) {
        const isValidUrl = /^(https?:\/\/)/i.test(imageUrl);
        if (!isValidUrl) {
          logger.warn(`Invalid image URL provided by admin ${req.user.email}: ${imageUrl}`);
          return res.status(400).json({ message: "Invalid image URL" });
        }
        imageData = { original: imageUrl, hero: imageUrl, thumbnail: imageUrl };
      }

      // Update blog fields
      blog.title = title || blog.title;
      blog.metaTitle = metaTitle || blog.metaTitle;
      blog.slug = newSlug || blog.slug;
      blog.topic = topic || blog.topic;
      blog.shortDescription = shortDescription || blog.shortDescription;
      blog.metaDescription = metaDescription || blog.metaDescription;
      blog.content = content || blog.content;
      blog.images = imageData;
      blog.imageAlt = imageAlt || blog.imageAlt;
      blog.tags = tags ? JSON.parse(tags) : blog.tags;
      blog.metaKeywords = metaKeywords ? JSON.parse(metaKeywords) : blog.metaKeywords;
      blog.published = published === "true" ? true : blog.published;
      blog.publishedBy = publishedBy || blog.publishedBy;
      blog.publisherLinkedIn = publisherLinkedIn || blog.publisherLinkedIn;

      const updatedBlog = await blog.save();
      const populatedBlog = await Blog.findById(updatedBlog._id).populate("author", "name");

      logger.info(`Blog ${req.params.slug} updated successfully by admin ${req.user.email}`);
      res.status(200).json({ message: "Blog updated successfully", blog: populatedBlog });
    } catch (error) {
      logger.error(`Error updating blog ${req.params.slug} by admin ${req.user.email}: ${error.message}`);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// @route   POST /api/admin/upload-ads-txt
// @desc    Upload ads.txt file (Admin only)
// @access  Private (Admin)
router.post(
  "/upload-ads-txt",
  protect,
  enhancedAdmin,
  adminRateLimiter,
  textUpload.single("adsTxt"),
  asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        logger.warn(`No file uploaded for ads.txt by admin ${req.user.email}`);
        return res.status(400).json({ message: "No file uploaded" });
      }

      logger.info(`ads.txt uploaded successfully by admin ${req.user.email}`);
      res.status(200).json({ message: "ads.txt uploaded successfully" });
    } catch (error) {
      logger.error(`Error uploading ads.txt by admin ${req.user.email}: ${error.message}`);
      res.status(500).json({ message: "Error uploading ads.txt", error: error.message });
    }
  })
);

module.exports = router;