const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
  },
  route: {
    type: String,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  queryParams: {
    type: Object,
    default: {},
  },
  requestBody: {
    type: Object,
    default: {},
  },
  responseStatus: {
    type: Number,
  },
  responseData: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserActivity', userActivitySchema);