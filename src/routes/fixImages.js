const mongoose = require("mongoose");
const connectDB = require("../config/dbConfig");
const Blog = require("../models/Blog");

const fixImagePaths = async () => {
  try {
    await connectDB();
    const blogs = await Blog.find({ published: true });
    for (const blog of blogs) {
      if (blog.images.original && !blog.images.original.includes("blogs_image")) {
        blog.images = {
          original: blog.images.original.replace("/uploads/", "/uploads/blogs_image/"),
          hero: blog.images.hero.replace("/uploads/", "/uploads/blogs_image/"),
          thumbnail: blog.images.thumbnail.replace("/uploads/", "/uploads/blogs_image/")
        };
        await blog.save();
        console.log(`Updated blog: ${blog.slug}`);
      }
    }
    console.log("Image paths updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error updating image paths:", error);
    process.exit(1);
  }
};

fixImagePaths();