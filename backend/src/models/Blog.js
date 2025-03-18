const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // Optional image URL
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // Only admin users can post
    tags: [{ type: String }], // Optional tags
    published: { type: Boolean, default: false }, // Draft mode
  },
  { timestamps: true } // Auto adds createdAt & updatedAt
);

module.exports = mongoose.model("Blog", blogSchema);
