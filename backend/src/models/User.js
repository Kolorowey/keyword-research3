const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { 
        type: String, 
        unique: true, 
        sparse: true, // Allows multiple null values for unique fields
        match: [/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"] 
    },
    phoneNumber: { type: String }, // Optional
    country: { type: String }, // Optional
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }, 
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
