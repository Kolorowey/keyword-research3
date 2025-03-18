const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, admin } = require("../middlewares/authMiddleware");
const Blog = require("../models/Blog");

const router = express.Router();

// @route   POST /api/blogs
// @desc    Create a new blog post (Admin only)
// @access  Private (Admin)
router.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { title, topic, shortDescription, content, image, tags } = req.body;

    // Validate required fields
    if (!title || !topic || !shortDescription || !content) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Create a new blog
    const blog = new Blog({
      title,
      topic,
      shortDescription,
      content,
      image: image || "", // Optional image
      author: req.user._id, // Admin user creating the blog
      tags: tags || [], // Optional tags
    });

    // Save to database
    const createdBlog = await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog: createdBlog });
  })
);

module.exports = router;
