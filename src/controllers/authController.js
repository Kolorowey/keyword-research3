const express = require("express");
const { body, validationResult } = require("express-validator"); // For input validation
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { protect, adminMiddleware } = require("../middlewares/authMiddleware");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In production, replace with Redis or MongoDB for OTP storage
const otpStore = new Map();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot Password
const forgotPassword = [
  body("email").isEmail().normalizeEmail(), // Validate and sanitize email
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Reset Password
const resetPassword = [
  body("email").isEmail().normalizeEmail(),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;
    try {
      const storedOtp = otpStore.get(email);
      if (!storedOtp || storedOtp.expires < Date.now()) {
        return res.status(400).json({ message: "OTP expired or invalid" });
      }

      if (storedOtp.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = newPassword; // Mongoose pre-save hook should hash this
      await user.save();

      otpStore.delete(email);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Register User
const registerUser = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("isAdmin").optional().isBoolean().withMessage("isAdmin must be a boolean"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { firstName, lastName, email, password, isAdmin = false } = req.body;

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Ensure password is hashed in User model
        isAdmin,
      });

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, user.isAdmin),
      });
    } catch (error) {
      console.error("Register User Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Login User
const loginUser = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          username: user.username,
          country: user.country,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profileImage: user.profileImage,
          token: generateToken(user._id, user.isAdmin),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Login User Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

// Google Login
const googleLogin = [
  body("token").notEmpty().withMessage("Google token is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        user = await User.create({
          googleId,
          email,
          firstName,
          lastName: lastName || "",
          isAdmin: false,
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (!user.lastName && lastName) {
          user.lastName = lastName;
        }
        await user.save();
      }

      res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        username: user.username,
        country: user.country,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.isAdmin),
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      res.status(400).json({ message: "Google login failed" });
    }
  },
];

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  protect,
  adminMiddleware,
};