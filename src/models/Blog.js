const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true // Remove extra whitespace
    },
    metaTitle: { 
      type: String, 
      trim: true, 
      maxlength: 60 // Ideal length for SEO title
    }, // Dedicated SEO title, falls back to title
    slug: { 
      type: String, 
      required: true, 
      unique: true, // Ensure unique URLs
      lowercase: true, 
      trim: true 
    }, // SEO-friendly URL slug
    topic: { 
      type: String, 
      required: true,
      trim: true 
    },
    shortDescription: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 160 // Ideal length for meta description
    }, // Will double as meta description if metaDescription not set
    metaDescription: { 
      type: String, 
      trim: true, 
      maxlength: 160 // Dedicated SEO description
    }, // Dedicated SEO description, falls back to shortDescription
    content: { 
      type: String, 
      required: true 
    },
    images: {
      original: { type: String, default: null }, // Original uploaded image
      hero: { type: String, default: null },     // 16:9 version
      thumbnail: { type: String, default: null }, // 1:1 version
    },
    imageAlt: { type: String, default: null },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // Reference to admin user
    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true // Standardize tags
    }], // Keywords for searchability
    published: { 
      type: Boolean, 
      default: false 
    }, // Draft or live
    metaKeywords: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }], // Optional SEO keywords
  },
  { 
    timestamps: true // createdAt & updatedAt for sitemap and schema
  }
);

// Add text index for efficient search
blogSchema.index({ title: "text", content: "text", tags: "text" });

// Pre-save hook to set defaults for metaTitle and metaDescription
blogSchema.pre("save", function (next) {
  if (!this.metaTitle) this.metaTitle = this.title;
  if (!this.metaDescription) this.metaDescription = this.shortDescription;
  next();
});

module.exports = mongoose.model("Blog", blogSchema);