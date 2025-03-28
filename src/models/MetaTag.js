const mongoose = require('mongoose');

const metaTagSchema = new mongoose.Schema({
  pageSlug: {
    type: String,
    required: true,
    unique: true, // Ensures each page has unique meta tags (e.g., "home", "about")
  },
  title: {
    type: String,
    required: true,
    maxlength: 60, // Enforces SEO best practice
  },
  description: {
    type: String,
    required: true,
    maxlength: 160, // Enforces SEO best practice
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MetaTag', metaTagSchema);