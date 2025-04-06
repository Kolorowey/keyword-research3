const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    metaTitle: { 
      type: String, 
      trim: true, 
      maxlength: 60 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true, 
      trim: true 
    },
    topic: { 
      type: String, 
      required: true,
      trim: true 
    },
    shortDescription: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 160 
    },
    metaDescription: { 
      type: String, 
      trim: true, 
      maxlength: 160 
    },
    content: { 
      type: String, 
      required: true 
    },
    images: {
      original: { type: String, default: null },
      hero: { type: String, default: null },
      thumbnail: { type: String, default: null },
    },
    imageAlt: { type: String, default: null },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }],
    published: { 
      type: Boolean, 
      default: false 
    },
    metaKeywords: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }],
    publishedBy: { 
      type: String, 
      required: true,
      trim: true 
    }, // Added required publishedBy field
    publisherLinkedIn: { 
      type: String, 
      trim: true,
      default: null 
    }, // Added optional publisherLinkedIn field
  },
  { 
    timestamps: true 
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