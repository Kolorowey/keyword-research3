const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, admin } = require("../middlewares/authMiddleware");
const Blog = require("../models/Blog");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Define upload directory (uploads is at backend/uploads/, outside src/routes/)
const uploadDir = path.join(__dirname, "../../uploads"); // From src/routes/ to backend/uploads/
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create uploads folder if it doesn’t exist
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed!"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ published: true })
      .select("title shortDescription images slug")
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  })
);

// @route   GET /api/blogs/sitemap.xml
// @desc    Generate and serve sitemap
// @access  Public
router.get(
  "/sitemap.xml",
  asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ published: true }).select("slug updatedAt");
    const baseUrl = "http://localhost:5173";
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}/</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        ${blogs
          .map(
            (blog) => `
          <url>
            <loc>${baseUrl}/blog/${blog.slug}</loc>
            <lastmod>${blog.updatedAt.toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>`
          )
          .join("")}
      </urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  })
);

// @route   GET /api/blogs/:slug
// @desc    Get a single blog by slug
// @access  Public
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
      .populate("author", "name")
      .select("title metaTitle shortDescription metaDescription content images imageAlt author slug tags metaKeywords createdAt");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  })
);

// @route   POST /api/blogs
// @desc    Create a new blog post (Admin only)
// @access  Private (Admin)
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const {
      title,
      metaTitle,
      slug,
      topic,
      shortDescription,
      metaDescription,
      content,
      imageUrl,
      imageAlt,
      tags,
      metaKeywords,
      published, // Optional: allow admin to set published status
    } = req.body;

    // Validate required fields
    if (!title || !slug || !topic || !shortDescription || !content) {
      return res.status(400).json({ message: "All required fields must be provided!" });
    }

    // Check for unique slug
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ message: "Slug already exists. Please choose a unique slug!" });
    }

    // Parse tags and metaKeywords
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedMetaKeywords = metaKeywords ? JSON.parse(metaKeywords) : [];
    let imageData = { original: null, hero: null, thumbnail: null };

    // Handle image upload or URL
    if (req.file) {
      const originalPath = `/uploads/${req.file.filename}`;
      const heroPath = `/uploads/hero-${req.file.filename}`;
      const thumbnailPath = `/uploads/thumb-${req.file.filename}`;

      try {
        await sharp(req.file.path)
          .resize({ width: 1600, height: 900, fit: "cover" })
          .toFile(path.join(uploadDir, `hero-${req.file.filename}`));
        await sharp(req.file.path)
          .resize({ width: 400, height: 400, fit: "cover" })
          .toFile(path.join(uploadDir, `thumb-${req.file.filename}`));
      } catch (err) {
        return res.status(500).json({ message: "Image processing failed", error: err.message });
      }

      imageData = { original: originalPath, hero: heroPath, thumbnail: thumbnailPath };
    } else if (imageUrl) {
      // Basic URL validation
      const isValidUrl = /^(https?:\/\/)/i.test(imageUrl);
      if (!isValidUrl) {
        return res.status(400).json({ message: "Invalid image URL. Must start with http:// or https://" });
      }
      imageData = { original: imageUrl, hero: imageUrl, thumbnail: imageUrl };
    } else {
      return res.status(400).json({ message: "Please provide an image file or URL!" });
    }

    // Create blog instance
    const blog = new Blog({
      title,
      metaTitle, // Defaults to title via pre-save hook if not provided
      slug,
      topic,
      shortDescription,
      metaDescription, // Defaults to shortDescription via pre-save hook
      content,
      images: imageData,
      imageAlt,
      author: req.user._id,
      tags: parsedTags,
      metaKeywords: parsedMetaKeywords,
      published: published === "true" || true, // Default to true if not specified
    });

    // Save and populate author
    const createdBlog = await blog.save();
    const populatedBlog = await Blog.findById(createdBlog._id).populate("author", "name");

    res.status(201).json({ message: "Blog created successfully", blog: populatedBlog });
  })
);


module.exports = router;