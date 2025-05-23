const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const mongoose = require("mongoose");

// Configure DOMPurify
const window = new JSDOM("").window;
const purify = DOMPurify(window);

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
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing after Bearer" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded);
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ error: `Invalid token: ${error.message}` });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }

    // Derive username if not present
    user.username = user.username || `${user.firstName} ${user.lastName}`.trim();

    console.log("Authenticated User:", {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Authentication failed" });
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

// Utility function to parse author (JSON string or plain string)
const parseAuthor = (author) => {
  if (typeof author === "string") {
    try {
      if (author.startsWith("{")) {
        const parsed = JSON.parse(author);
        return (parsed.username || "Anonymous").toLowerCase();
      }
      return author.toLowerCase();
    } catch (e) {
      console.warn(`Failed to parse author: ${author}`);
      return "Anonymous";
    }
  }
  return (author || "Anonymous").toLowerCase();
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

    const posts = await Post.find(query).sort(sortOption).lean();

    // Manually fetch author data for each post
    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        let author = { username: post.username || "Unknown User", profileImage: null };
        try {
          // Check if author is a valid ObjectId
          if (mongoose.isValidObjectId(post.author)) {
            const user = await User.findById(post.author).select("username firstName lastName profileImage").lean();
            if (user) {
              const username = user.username || `${user.firstName} ${user.lastName}`.trim();
              author = {
                username: username || post.username || "Unknown User",
                profileImage: user.profileImage || null,
              };
            }
          } else {
            console.warn(`Invalid author ID ${post.author} for post ${post._id}`);
          }
        } catch (error) {
          console.warn(`Failed to fetch user for author ID ${post.author}:`, error.message);
        }
        return { ...post, author };
      })
    );

    res.json(postsWithAuthor);
  } catch (error) {
    console.error("Error in GET /posts:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single post by ID
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Manually fetch author data
    let author = { username: post.username || "Unknown User", profileImage: null };
    try {
      if (mongoose.isValidObjectId(post.author)) {
        const user = await User.findById(post.author).select("username firstName lastName profileImage").lean();
        if (user) {
          const username = user.username || `${user.firstName} ${user.lastName}`.trim();
          author = {
            username: username || post.username || "Unknown User",
            profileImage: user.profileImage || null,
          };
        }
      } else {
        console.warn(`Invalid author ID ${post.author} for post ${post._id}`);
      }
    } catch (error) {
      console.warn(`Failed to fetch user for author ID ${post.author}:`, error.message);
    }

    res.json({ ...post, author });
  } catch (error) {
    console.error(`Error in GET /posts/:id for ID ${req.params.id}:`, error.message);
    res.status(404).json({ error: "Post not found" });
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

    const userId = req.user._id;
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
      username: req.user.username || `${req.user.firstName} ${req.lastName}`.trim(),
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
router.post("/posts/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    const { content, image, parentId } = req.body;
    const user = req.user;

    const comment = {
      content: content || "",
      author: user.username, // Store username as string
      image: image || null,
      createdAt: new Date(),
      parentId: parentId || null,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      message: "Comment added",
      comment: {
        _id: comment._id,
        content: comment.content,
        author: user.username,
        image: comment.image,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
        likes: comment.likes,
        dislikes: comment.dislikes,
        likedBy: comment.likedBy,
        dislikedBy: comment.dislikedBy,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Server error: Unable to add comment" });
  }
});

// Like a comment
router.post("/posts/:id/comments/:commentId/like", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    // Initialize likedBy if undefined
    comment.likedBy = comment.likedBy || [];
    if (comment.likedBy.includes(userId)) {
      return res.status(400).json({ error: "You have already liked this comment" });
    }

    // Initialize dislikedBy if undefined
    comment.dislikedBy = comment.dislikedBy || [];
    // Remove user from dislikedBy if present
    if (comment.dislikedBy.includes(userId)) {
      comment.dislikedBy = comment.dislikedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);
    }

    // Add user to likedBy
    comment.likedBy.push(userId);
    comment.likes = (comment.likes || 0) + 1;

    await post.save();

    res.json({
      message: "Comment liked",
      comment: {
        _id: comment._id,
        likes: comment.likes,
        dislikes: comment.dislikes,
        likedBy: comment.likedBy,
        dislikedBy: comment.dislikedBy,
      },
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Server error: Unable to like comment" });
  }
});

// Unlike a comment
router.post("/posts/:id/comments/:commentId/unlike", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    // Initialize likedBy if undefined
    comment.likedBy = comment.likedBy || [];
    if (!comment.likedBy.includes(userId)) {
      return res.status(400).json({ error: "You have not liked this comment" });
    }

    // Remove user from likedBy
    comment.likedBy = comment.likedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    comment.likes = Math.max(0, (comment.likes || 0) - 1);

    await post.save();

    res.json({
      message: "Comment unliked",
      comment: {
        _id: comment._id,
        likes: comment.likes,
        dislikes: comment.dislikes,
        likedBy: comment.likedBy,
        dislikedBy: comment.dislikedBy || [],
      },
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json({ error: "Server error: Unable to unlike comment" });
  }
});

// Dislike a comment
router.post("/posts/:id/comments/:commentId/dislike", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    // Initialize dislikedBy if undefined
    comment.dislikedBy = comment.dislikedBy || [];
    if (comment.dislikedBy.includes(userId)) {
      return res.status(400).json({ error: "You have already disliked this comment" });
    }

    // Initialize likedBy if undefined
    comment.likedBy = comment.likedBy || [];
    // Remove user from likedBy if present
    if (comment.likedBy.includes(userId)) {
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
    }

    // Add user to dislikedBy
    comment.dislikedBy.push(userId);
    comment.dislikes = (comment.dislikes || 0) + 1;

    await post.save();

    res.json({
      message: "Comment disliked",
      comment: {
        _id: comment._id,
        likes: comment.likes,
        dislikes: comment.dislikes,
        likedBy: comment.likedBy,
        dislikedBy: comment.dislikedBy,
      },
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    res.status(500).json({ error: "Server error: Unable to dislike comment" });
  }
});

// Undislike a comment
router.post("/posts/:id/comments/:commentId/undislike", isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    // Initialize dislikedBy if undefined
    comment.dislikedBy = comment.dislikedBy || [];
    if (!comment.dislikedBy.includes(userId)) {
      return res.status(400).json({ error: "You have not disliked this comment" });
    }

    // Remove user from dislikedBy
    comment.dislikedBy = comment.dislikedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);

    await post.save();

    res.json({
      message: "Comment undisliked",
      comment: {
        _id: comment._id,
        likes: comment.likes,
        dislikes: comment.dislikes,
        likedBy: comment.likedBy || [],
        dislikedBy: comment.dislikedBy,
      },
    });
  } catch (error) {
    console.error("Error undisliking comment:", error);
    res.status(500).json({ error: "Server error: Unable to undislike comment" });
  }
});

// Get user's posts, commented posts, and liked posts
router.get("/user-activity", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const username = req.user.username;

    // Fetch posts authored by the user
    const userPosts = await Post.find({ author: userId, isDraft: false })
      .select("title content comments userReactions author")
      .lean();

    // Fetch posts where the user commented
    const commentedPosts = await Post.find({
      "comments.author": username,
      isDraft: false,
    })
      .select("title content comments userReactions author")
      .lean();

    // Fetch posts the user liked
    const likedPosts = await Post.find({
      userReactions: { $elemMatch: { userId, reactionType: "like" } },
      isDraft: false,
    })
      .select("title content comments userReactions author")
      .lean();

    // Combine and deduplicate posts
    const allPosts = [...userPosts, ...commentedPosts, ...likedPosts];
    const uniquePosts = Array.from(
      new Map(allPosts.map((post) => [post._id.toString(), post])).values()
    );

    // Format response to match frontend expectations
    const formattedPosts = uniquePosts.map((post) => {
      // Count total comments
      const commentCount = post.comments.length;

      // Get user's comments
      const userComments = post.comments
        .filter((comment) => comment.author === username)
        .map((comment) => ({
          id: comment._id,
          text: comment.content,
        }));

      // Check if user liked the post
      const isLikedByUser = post.userReactions.some(
        (reaction) =>
          reaction.userId.toString() === userId.toString() &&
          reaction.reactionType === "like"
      );

      // Check if post is authored by user, handle missing author
      const isUserPost = post.author
        ? post.author.toString() === userId.toString()
        : false;

      if (!post.author) {
        console.warn(`Post ${post._id} has missing author field`);
      }

      // Count likes from userReactions
      const likes = post.userReactions.filter(
        (reaction) => reaction.reactionType === "like"
      ).length;

      return {
        id: post._id,
        title: post.title,
        content: post.content,
        likes,
        comments: commentCount,
        shares: 0, // Not implemented in schema, set to 0
        isUserPost,
        isLikedByUser,
        userComments,
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Server error: Unable to fetch user activity" });
  }
});

// DELETE /api/forum/posts/:postId/comments/:commentId
router.delete("/posts/:postId/comments/:commentId", isAuthenticated, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const user = req.user;

    // Find the post
    const post = await Post.findById(postId);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    // Find the comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Log for debugging
    console.log("User:", { _id: user._id, username: user.username, isAdmin: user.isAdmin });
    console.log("Comment author raw:", comment.author);
    console.log("Comment author parsed:", parseAuthor(comment.author));

    // Check ownership for non-admins (case-insensitive)
    const commentAuthor = parseAuthor(comment.author);
    if (!user.isAdmin && commentAuthor !== user.username.toLowerCase()) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    // Remove the comment and its replies
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId && c.parentId?.toString() !== commentId
    );
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Server error: Unable to delete comment" });
  }
});

// PUT /api/forum/posts/:postId/comments/:commentId
router.put("/posts/:postId/comments/:commentId", isAuthenticated, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Validate input
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Content is required and must be a string" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post || post.isDraft) {
      return res.status(404).json({ error: "Post not found or is a draft" });
    }

    // Find the comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Log for debugging
    console.log("User:", { _id: user._id, username: user.username, isAdmin: user.isAdmin });
    console.log("Comment author raw:", comment.author);
    console.log("Comment author parsed:", parseAuthor(comment.author));

    // Check ownership for non-admins (case-insensitive)
    const commentAuthor = parseAuthor(comment.author);
    if (!user.isAdmin && commentAuthor !== user.username.toLowerCase()) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    // Sanitize content to prevent XSS
    comment.content = purify.sanitize(content);
    comment.updatedAt = new Date();
    await post.save();

    res.status(200).json({
      message: "Comment updated successfully",
      content: comment.content,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ error: "Server error: Unable to edit comment" });
  }
});

module.exports = router;