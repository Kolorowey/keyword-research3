const express = require('express');
const { scrapeKeywords: scrapeGoogleKeywords } = require('../controllers/gooleScraperController');
const { scrapeBingKeywords } = require('../controllers/bingScrapperController');
const { scrapeYahooKeywords } = require('../controllers/yahooScrapperController');

const router = express.Router();

// Scraper Route with Search Engine Selection
router.get('/scrape', (req, res) => {
    const { engine } = req.query;

    switch (engine) {
        case 'google':
            return scrapeGoogleKeywords(req, res);
        case 'bing':
            return scrapeBingKeywords(req, res);
        case 'yahoo':
            return scrapeYahooKeywords(req, res);
        default:
            return res.status(400).json({ error: 'Invalid or missing search engine. Use ?engine=google, ?engine=bing, or ?engine=yahoo' });
    }
});

module.exports = router;
