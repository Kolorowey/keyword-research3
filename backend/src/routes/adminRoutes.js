const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect, admin } = require("../middlewares/authMiddleware");
const User = require("../models/User");

const router = express.Router();

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

module.exports = router;
