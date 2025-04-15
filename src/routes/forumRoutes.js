const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./Uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images and videos are allowed!"));
  },
});

// Authentication middleware
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};


// Get all posts with sorting and filtering
router.get("/posts", async (req, res) => {
  try {
    const { sort = "newest", time = "all", search = "" } = req.query;

    let query = { isDraft: false };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (time === "today") {
      query.createdAt = {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    }

    let sortOption = {};
    if (sort === "newest") {
      sortOption.createdAt = -1;
    }

    const posts = await Post.find(query).sort(sortOption);    
    res.json(posts);
  } catch (error) {
    console.error("Error in GET /posts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// React to a post
router.post("/posts/:id/react", isAuthenticated, async (req, res) => {
  try {
    const { reactionType } = req.body;
    if (!["like", "love", "laugh", "wow", "angry", "sad"].includes(reactionType)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userId = req.user.id;
    const existingReaction = post.userReactions.find(
      (r) => r.userId.toString() === userId
    );

    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction
        post.userReactions = post.userReactions.filter(
          (r) => r.userId.toString() !== userId
        );
        post.reactions[reactionType] = Math.max(
          0,
          (post.reactions[reactionType] || 0) - 1
        );
      } else {
        // Update reaction
        post.reactions[existingReaction.reactionType] = Math.max(
          0,
          (post.reactions[existingReaction.reactionType] || 0) - 1
        );
        existingReaction.reactionType = reactionType;
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      }
    } else {
      // Add new reaction
      post.userReactions.push({ userId, reactionType });
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    }

    await post.save();
    res.json({ reactions: post.reactions, userReaction: reactionType });
  } catch (error) {
    console.error("Error in POST /react:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single post by ID
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new post
router.post("/posts", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { title, content, contentType, author } = req.body;
    const finalAuthor = author || req.user.firstName || "Anonymous";

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (contentType === "html" && !content) {
      return res.status(400).json({ error: "Content is required for text posts" });
    }

    if (["image", "video"].includes(contentType) && !req.file) {
      return res.status(400).json({ error: "Media is required for image/video posts" });
    }

    const newPost = new Post({
      title,
      content: content || "",
      contentType: contentType || "html",
      image: req.file ? `/Uploads/${req.file.filename}` : null,
      author: finalAuthor,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save draft
router.post("/posts/draft", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { title, content, contentType, author } = req.body;
    const finalAuthor = author || req.user.firstName || "Anonymous";

    const draftPost = new Post({
      title: title || "Untitled Draft",
      content: content || "",
      contentType: contentType || "html",
      image: req.file ? `/Uploads/${req.file.filename}` : null,
      author: finalAuthor,
      isDraft: true,
    });

    await draftPost.save();
    res.status(201).json(draftPost);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a comment
router.post(
  "/posts/:id/comments",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const { content, author, parentId } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post || post.isDraft) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = {
        content: content || "",
        author: author || req.user.firstName || "Anonymous",
        image: req.file ? `/Uploads/${req.file.filename}` : null,
        parentId: parentId || null,
        createdAt: new Date(),
      };

      post.comments.push(comment);
      await post.save();

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Like a comment
router.post("/posts/:id/comments/:commentId/like", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.likes = (comment.likes || 0) + 1;
    await post.save();

    res.json({ message: "Comment liked" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Unlike a comment
router.post("/posts/:id/comments/:commentId/unlike", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.likes = Math.max(0, (comment.likes || 0) - 1);
    await post.save();

    res.json({ message: "Comment unliked" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Dislike a comment
router.post(
  "/posts/:id/comments/:commentId/dislike",
  isAuthenticated,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post || post.isDraft) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.dislikes = (comment.dislikes || 0) + 1;
      await post.save();

      res.json({ message: "Comment disliked" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Undislike a comment
router.post(
  "/posts/:id/comments/:commentId/undislike",
  isAuthenticated,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post || post.isDraft) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);
      await post.save();

      res.json({ message: "Comment undisliked" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;