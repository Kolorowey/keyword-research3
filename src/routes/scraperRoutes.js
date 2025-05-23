const express = require('express');
const asyncHandler = require('express-async-handler');
const UserActivity = require('../models/UserActivity');
const { scrapeKeywords: scrapeGoogleKeywords } = require('../controllers/gooleScraperController');
const { scrapeBingKeywords } = require('../controllers/bingScrapperController');
const { scrapeYahooKeywords } = require('../controllers/yahooScrapperController');

const router = express.Router();

// @route   GET /api/scraper/scrape
// @desc    Scrape keywords based on search engine
// @access  Public
router.get(
  '/scrape',
  asyncHandler(async (req, res) => {
    const { engine } = req.query;
    const userId = req.headers['x-user-id'] || '';
    const userName = req.headers['x-user-name'] || '';
    let responseData = { error: 'No response data' };
    let responseStatus = 500;

    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function (data) {
      responseData = data;
      responseStatus = res.statusCode || 200;
      return originalJson.call(this, data);
    };

    try {
      switch (engine) {
        case 'google':
          await scrapeGoogleKeywords(req, res);
          break;
        case 'bing':
          await scrapeBingKeywords(req, res);
          break;
        case 'yahoo':
          await scrapeYahooKeywords(req, res);
          break;
        default:
          responseStatus = 400;
          responseData = { error: 'Invalid or missing search engine. Use ?engine=google, ?engine=bing, or ?engine=yahoo' };
          res.status(400).json(responseData);
      }

      // Log user activity
      const activity = new UserActivity({
        userId,
        userName,
        route: req.originalUrl,
        method: req.method,
        queryParams: req.query,
        requestBody: req.body,
        responseStatus,
        responseData,
      });

      await activity.save().catch((err) => {
        console.error('Error saving user activity:', err.message);
      });

      if (engine === 'google' || engine === 'bing' || engine === 'yahoo') {
        return; // Response already sent by controller
      }
    } catch (error) {
      responseStatus = 500;
      responseData = { error: 'Internal server error' };
      res.status(500).json(responseData);

      // Log error activity
      const activity = new UserActivity({
        userId,
        userName,
        route: req.originalUrl,
        method: req.method,
        queryParams: req.query,
        requestBody: req.body,
        responseStatus,
        responseData,
      });

      await activity.save().catch((err) => {
        console.error('Error saving user activity:', err.message);
      });
    }
  })
);

module.exports = router;