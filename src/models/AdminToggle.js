const mongoose = require('mongoose');

const AdminToggleControlSchema = new mongoose.Schema({
  sidePanel: {
    relatedKeywords: {
      type: Boolean,
      default: true,
      description: 'Visibility of Related Keywords component in side panel',
    },
    longTailKeywords: {
      type: Boolean,
      default: true,
      description: 'Visibility of Long-Tail Keywords component in side panel',
    },
    searchVolume: {
      type: Boolean,
      default: true,
      description: 'Visibility of Search Volume component in side panel',
    },
    keywordDifficulty: {
      type: Boolean,
      default: true,
      description: 'Visibility of Keyword Difficulty component in side panel',
    },
    keywordSpamScore: {
      type: Boolean,
      default: true,
      description: 'Visibility of Keyword Spam Score component in side panel',
    },
    keywordTrend: {
      type: Boolean,
      default: true,
      description: 'Visibility of Keyword Trend component in side panel',
    },
    cpc: {
      type: Boolean,
      default: true,
      description: 'Visibility of Cost Per Click component in side panel',
    },
    adCompetitions: {
      type: Boolean,
      default: true,
      description: 'Visibility of Ad Competitions component in side panel',
    },
  },
  navigation: {
    Research: {
      type: Boolean,
      default: true,
      description: 'Visibility of Research link in navigation',
    },
    Blog: {
      type: Boolean,
      default: true,
      description: 'Visibility of Blog link in navigation',
    },
    Forum: {
      type: Boolean,
      default: true,
      description: 'Visibility of Forum link in navigation',
    },
    Courses: {
      type: Boolean,
      default: true,
      description: 'Visibility of Courses link in navigation',
    },
    Admin: {
      type: Boolean,
      default: true,
      description: 'Visibility of Admin link in navigation',
    },
  },
  socialLinks: {
    linkedin: {
      type: String,
      default: '',
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Invalid LinkedIn URL'],
      description: 'URL for LinkedIn profile or page',
    },
    instagram: {
      type: String,
      default: '',
      trim: true,
      match: [/^https?:\/\/(www\.)?instagram\.com\/.*$/, 'Invalid Instagram URL'],
      description: 'URL for Instagram profile',
    },
    youtube: {
      type: String,
      default: '',
      trim: true,
      match: [/^https?:\/\/(www\.)?youtube\.com\/.*$/, 'Invalid YouTube URL'],
      description: 'URL for YouTube channel',
    },
    facebook: {
      type: String,
      default: '',
      trim: true,
      match: [/^https?:\/\/(www\.)?facebook\.com\/.*$/, 'Invalid Facebook URL'],
      description: 'URL for Facebook page or profile',
    },
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'User who last updated the settings',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: 'Timestamp of the last update',
  },
});

// Update the `updatedAt` timestamp before saving
AdminToggleControlSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AdminToggleControl', AdminToggleControlSchema);