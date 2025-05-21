const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./Uploads/forum/",
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

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      console.error("Non-admin user attempted access:", req.user._id);
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get notifications for the authenticated user
router.get("/notifications", isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get unread notification count
router.get("/notifications/unread-count", isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.warn("User authentication failed:", req.user);
      return res.status(401).json({ error: "User not authenticated or missing ID" });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error in GET /notifications/unread-count:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to mark all notifications as read
router.put("/notifications/mark-read", isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.warn("User authentication failed:", req.user);
      return res.status(401).json({ error: "User not authenticated or missing ID" });
    }

    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
   
    res.status(200).json({ message: "Notifications marked as read", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error in PUT /notifications/mark-read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all posts with sorting and filtering (public, checked posts)
router.get("/posts", async (req, res) => {
  try {
    const { sort = "newest", time = "all", search = "" } = req.query;

    let query = { isDraft: false, checkedByAdmin: true };
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

// Get all unchecked posts (admin only)
router.get("/admin/posts", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ checkedByAdmin: false, isDraft: false }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error in GET /admin/posts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Approve post (admin only)
router.put("/admin/posts/:id/check", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.checkedByAdmin) {
      return res.status(400).json({ error: "Post already checked" });
    }
    post.checkedByAdmin = true;
    await post.save();
    const user = await User.findById(post.author);
    if (!user) {
      console.warn(`User with ID "${post.author}" not found for notification`);
      return res.json({ message: "Post approved successfully, no notification created (user not found)", post });
    }
    const notification = new Notification({
      userId: post.author,
      message: `Your post "${post.title}" has been approved by an admin.`,
      postId: post._id,
    });
    await notification.save();
    res.json({ message: "Post approved successfully", post });
  } catch (error) {
    console.error("Error in PUT /admin/posts/:id/check:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a post (admin only)
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await post.deleteOne();
    
    // Create notification for the post author
    const user = await User.findById(post.author);
    if (user) {
      const notification = new Notification({
        userId: post.author,
        message: `Your post "${post.title}" has been deleted by an admin.`,
        postId: post._id,
      });
      await notification.save();
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /posts/:id:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit a post (admin only)
router.put("/forum/edit/:id", isAuthenticated, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, contentType, username } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (contentType === "html" && !content) {
      return res.status(400).json({ error: "Content is required for text posts" });
    }

    // Update post fields
    post.title = title;
    post.content = content || post.content;
    post.contentType = contentType || post.contentType;
    post.username = username;
    if (req.file) {
      post.image = `/Uploads/forum/${req.file.filename}`;
    }
    
    await post.save();

    // Create notification for the post author
    const user = await User.findById(post.author);
    if (user) {
      const notification = new Notification({
        userId: post.author,
        message: `Your post "${post.title}" has been edited by an admin.`,
        postId: post._id,
      });
      await notification.save();
    }

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error in PUT /posts/:id:", error);
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
        post.userReactions = post.userReactions.filter(
          (r) => r.userId.toString() !== userId
        );
        post.reactions[reactionType] = Math.max(
          0,
          (post.reactions[reactionType] || 0) - 1
        );
      } else {
        post.reactions[existingReaction.reactionType] = Math.max(
          0,
          (post.reactions[existingReaction.reactionType] || 0) - 1
        );
        existingReaction.reactionType = reactionType;
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      }
    } else {
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
    const { title, content, contentType, username } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated or missing ID" });
    }
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
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
      image: req.file ? `/Uploads/forum/${req.file.filename}` : null,
      author: req.user._id,
      username: username,
      isDraft: false,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in POST /posts:", error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${error.message}` });
    }
    if (error.message.includes("Only images and videos")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Save a draft post
router.post("/posts/draft", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { title, content, contentType } = req.body;
    if (!req.user || !req.user._id) {
      console.warn("User authentication failed:", req.user);
      return res.status(401).json({ error: "User not authenticated or missing ID" });
    }
    const newPost = new Post({
      title: title || "Untitled Draft",
      content: content || "",
      contentType: contentType || "html",
      image: req.file ? `/Uploads/forum/${req.file.filename}` : null,
      author: req.user._id,
      isDraft: true,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in POST /posts/draft:", error);
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
        image: req.file ? `/Uploads/forum/${req.file.filename}` : null,
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