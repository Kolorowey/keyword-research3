const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile with Base64 image
// @access  Private
router.put('/profile', protect, upload.single('profileImage'), asyncHandler(async (req, res) => {   
    if (!req.file) {
        return res.status(400).json({ message: "No file selected" });
    }

    // File size limit check (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
        return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    const { firstName, lastName, username, email, phoneNumber, country } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check for unique email
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        user.email = email;
    }

    // Check for unique username
    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = username;
    }

    // Update other fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.country = country || user.country;

    // Convert image to Base64 and store in MongoDB
    if (req.file) {
        user.profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
        message: 'Profile updated successfully',
        updatedUser: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            username: updatedUser.username,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            country: updatedUser.country,
            profileImage: updatedUser.profileImage 
        }
    });
}));


module.exports = router;
