const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" }, // Optional with default empty string
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true, match: [/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"] },
    phoneNumber: { type: String },
    country: { type: String },
    password: { type: String },
    profileImage: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
  }, { timestamps: true });

// Hash password before saving, but only if password exists and is modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next(); // Skip hashing if no password or not modified
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false; // No password set (e.g., for Google users), so no match
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);