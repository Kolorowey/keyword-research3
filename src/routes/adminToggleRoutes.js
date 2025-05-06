const express = require('express');
const router = express.Router();
const AdminToggleControl = require('../models/AdminToggle');
const jwt = require('jsonwebtoken');
const config = require('../config/dbConfig'); // Assume you have a config file with JWT_SECRET

// Middleware to verify JWT and admin status
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET: Fetch AdminToggleControl settings
router.get('/', async (req, res) => {
  try {
    let settings = await AdminToggleControl.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new AdminToggleControl();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching AdminToggleControl:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update AdminToggleControl settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    let settings = await AdminToggleControl.findOne();
    if (!settings) {
      settings = new AdminToggleControl();
    }

    // Update fields
    settings.sidePanel = { ...settings.sidePanel, ...updates.sidePanel };
    settings.navigation = { ...settings.navigation, ...updates.navigation };
    settings.socialLinks = { ...settings.socialLinks, ...updates.socialLinks };
    if (req.user && req.user._id) {
      settings.updatedBy = req.user._id;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating AdminToggleControl:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;