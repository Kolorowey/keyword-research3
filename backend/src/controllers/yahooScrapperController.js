const axios = require('axios');

// Fetch suggestions from Yahoo Suggest API
const fetchYahooSuggestions = async (query) => {
    try {
        const response = await axios.get('https://search.yahoo.com/sugg/gossip/gossip-us-ura/', {
            params: {
                command: query,
                output: 'json',
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        return response.data.gossip.results ? response.data.gossip.results.map(res => res.key) : [];
    } catch (error) {
        console.error(`Error fetching suggestions for "${query}" from Yahoo:`, error.message);
        return [];
    }
};

// Scrape Keywords Controller for Yahoo
const scrapeYahooKeywords = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const collectedKeywords = new Set();
    const queue = [query];

    try {
        console.log(`Starting scrape for query: "${query}" from Yahoo`);

        while (queue.length && collectedKeywords.size < 200) {
            const currentQuery = queue.shift();

            const suggestions = await fetchYahooSuggestions(currentQuery);

            for (const suggestion of suggestions) {
                if (!collectedKeywords.has(suggestion)) {
                    collectedKeywords.add(suggestion);
                    queue.push(suggestion);
                }

                if (collectedKeywords.size >= 100) break;
            }
        }

        if (collectedKeywords.size === 0) {
            return res.status(404).json({ message: 'No keywords found from Yahoo' });
        }

        console.log(`Yahoo scraping completed. Total keywords collected: ${collectedKeywords.size}`);
        res.status(200).json({ keywords: Array.from(collectedKeywords) });
    } catch (error) {
        console.error('Yahoo Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape Yahoo keywords', details: error.message });
    }
};

module.exports = { scrapeYahooKeywords };
