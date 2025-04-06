const express = require("express");
const { protect, admin } = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Define upload directory
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
    // Fetch published blogs
    const blogs = await Blog.find({ published: true }).select("slug updatedAt");
    const baseUrl = "https://www.keywordraja.com";

    // Static keyword research pages
    const staticPages = [
      { path: "/", changefreq: "daily", priority: "1.0", lastmod: "2025-04-06" },
      { path: "/related-keywords", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/long-tail-keywords", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/keyword-difficulty", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/keyword-spam-score", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/keyword-trend", changefreq: "daily", priority: "0.9", lastmod: "2025-04-06" },
      { path: "/search-volume", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/cpc", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
      { path: "/ad-competition", changefreq: "weekly", priority: "0.8", lastmod: "2025-04-06" },
    ];

    // Generate sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages
          .map(
            (page) => `
          <url>
            <loc>${baseUrl}${page.path}</loc>
            <lastmod>${page.lastmod}</lastmod>
            <changefreq>${page.changefreq}</changefreq>
            <priority>${page.priority}</priority>
          </url>`
          )
          .join("")}
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

// @route   GET /api/admin/blogs/count
// @desc    Get total number of blogs
// @access  Public (no protection)
router.get(
  "/count",
  asyncHandler(async (req, res) => {
    console.log("Blog count endpoint hit");
    const blogCount = await Blog.countDocuments({});
    console.log("Blog count:", blogCount);
    res.status(200).json({ blogCount });
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
      published,
    } = req.body;

    if (!title || !slug || !topic || !shortDescription || !content) {
      return res.status(400).json({ message: "All required fields must be provided!" });
    }

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ message: "Slug already exists. Please choose a unique slug!" });
    }

    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedMetaKeywords = metaKeywords ? JSON.parse(metaKeywords) : [];
    let imageData = { original: null, hero: null, thumbnail: null };

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
      const isValidUrl = /^(https?:\/\/)/i.test(imageUrl);
      if (!isValidUrl) {
        return res.status(400).json({ message: "Invalid image URL. Must start with http:// or https://" });
      }
      imageData = { original: imageUrl, hero: imageUrl, thumbnail: imageUrl };
    } else {
      return res.status(400).json({ message: "Please provide an image file or URL!" });
    }

    const blog = new Blog({
      title,
      metaTitle,
      slug,
      topic,
      shortDescription,
      metaDescription,
      content,
      images: imageData,
      imageAlt,
      author: req.user._id,
      tags: parsedTags,
      metaKeywords: parsedMetaKeywords,
      published: published === "true" || true,
    });

    const createdBlog = await blog.save();
    const populatedBlog = await Blog.findById(createdBlog._id).populate("author", "name");

    res.status(201).json({ message: "Blog created successfully", blog: populatedBlog });
  })
);

module.exports = router;