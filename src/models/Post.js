const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: false },
  contentType: { type: String, enum: ["html", "image", "video"], default: "html" },
  image: { type: String, required: false },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      content: { type: String, required: false },
      author: { type: String, required: true },
      image: { type: String, required: false },
      createdAt: { type: Date, default: Date.now },
      parentId: { type: mongoose.Schema.Types.ObjectId, required: false },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
    },
  ],
  isDraft: { type: Boolean, default: false },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
  },
  userReactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      reactionType: {
        type: String,
        enum: ["like", "love", "laugh", "wow", "angry", "sad"],
        required: true,
      },
    },
  ],
  checkedByAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("Post", PostSchema);