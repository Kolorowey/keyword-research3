const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");

// Middleware for authentication & admin access
const { protect, adminMiddleware } = require("../middlewares/authMiddleware");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, isAdmin } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      isAdmin,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user.id, user.isAdmin),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
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
        token: generateToken(user.id, user.isAdmin),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const googleLogin = async (req, res) => {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;
  
      // Check if user exists by googleId or email
      let user = await User.findOne({ $or: [{ googleId }, { email }] });
  
      if (!user) {
        // Create a new user if they don't exist, with a fallback for lastName
        user = await User.create({
          googleId,
          email,
          firstName,
          lastName: lastName || "", // Fallback to empty string if lastName is undefined
          isAdmin: false,
        });
      } else if (!user.googleId) {
        // Link Google ID if user exists via email but not linked to Google
        user.googleId = googleId;
        if (!user.lastName && lastName) {
          user.lastName = lastName; // Update lastName if provided by Google
        }
        await user.save();
      }
  
      res.status(200).json({
        _id: user.id,
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
        token: generateToken(user.id, user.isAdmin),
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      res.status(400).json({ message: "Google login failed" });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  protect,
  adminMiddleware,
};
