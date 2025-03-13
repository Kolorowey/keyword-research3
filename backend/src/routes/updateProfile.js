const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.single('profileImage'), asyncHandler(async (req, res) => {
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

    // Update profile image if uploaded
    if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
        message: 'Profile updated successfully',
        user: {
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
