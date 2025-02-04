const express = require('express');
const { scrapeKeywords } = require('../controllers/scraperController');

const router = express.Router();

// Scraper Route
router.get('/scrape', scrapeKeywords);

module.exports = router;
