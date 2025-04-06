const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, admin } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Blog = require("../models/Blog");

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get(
  "/users",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find({}, "firstName lastName email username"); // Fetch only required fields
      const userCount = await User.countDocuments();

      res.json({ userCount, users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
);

// @route   GET /api/admin/blogs/count
// @desc    Get counts of published and draft blogs (Admin only)
// @access  Private (Admin)
router.get(
  "/blogs/count",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    console.log("Blog count endpoint hit");

    const publishedCount = await Blog.countDocuments({ published: true });
    const draftCount = await Blog.countDocuments({ published: false });
    const totalCount = publishedCount + draftCount;

    console.log("Published blogs:", publishedCount);
    console.log("Draft blogs:", draftCount);
    console.log("Total blogs:", totalCount);

    res.status(200).json({
      publishedCount,
      draftCount,
      totalCount,
    });
  })
);

module.exports = router;