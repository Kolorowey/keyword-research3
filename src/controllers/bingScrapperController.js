const axios = require('axios');

// Fetch suggestions from Bing Suggest API
const fetchBingSuggestions = async (query) => {
    try {
        const response = await axios.get('https://api.bing.com/osjson.aspx', {
            params: {
                query,
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        return response.data[1] || [];
    } catch (error) {
        console.error(`Error fetching suggestions for "${query}" from Bing:`, error.message);
        return [];
    }
};

// Scrape Keywords Controller for Bing
const scrapeBingKeywords = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const collectedKeywords = new Set();
    const queue = [query];

    try {
        console.log(`Starting scrape for query: "${query}" from Bing`);

        while (queue.length && collectedKeywords.size < 200) {
            const currentQuery = queue.shift();

            const suggestions = await fetchBingSuggestions(currentQuery);

            for (const suggestion of suggestions) {
                if (!collectedKeywords.has(suggestion)) {
                    collectedKeywords.add(suggestion);
                    queue.push(suggestion);
                }

                if (collectedKeywords.size >= 100) break;
            }
        }

        if (collectedKeywords.size === 0) {
            return res.status(404).json({ message: 'No keywords found from Bing' });
        }

        console.log(`Bing scraping completed. Total keywords collected: ${collectedKeywords.size}`);
        res.status(200).json({ keywords: Array.from(collectedKeywords) });
    } catch (error) {
        console.error('Bing Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape Bing keywords', details: error.message });
    }
};

module.exports = { scrapeBingKeywords };
