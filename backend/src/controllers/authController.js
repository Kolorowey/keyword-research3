const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Middleware for authentication & admin access
const { protect, adminMiddleware } = require('../middlewares/authMiddleware');

// Register User
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, isAdmin } = req.body;
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ firstName, lastName, email, password, isAdmin });

        if (user) {
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin, // Include isAdmin in response
                token: generateToken(user.id, user.isAdmin), // Include isAdmin in JWT
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
                isAdmin: user.isAdmin, // Include isAdmin in response
                createdAt: user.createdAt, // Include timestamps
                updatedAt: user.updatedAt,
                token: generateToken(user.id, user.isAdmin), // Include isAdmin in JWT
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { registerUser, loginUser, protect, adminMiddleware };
