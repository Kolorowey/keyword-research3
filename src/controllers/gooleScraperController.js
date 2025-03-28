const axios = require('axios');

// Fetch suggestions from Google Suggest API
const fetchSuggestions = async (query) => {
    try {
        const response = await axios.get('https://suggestqueries.google.com/complete/search', {
            params: {
                client: 'firefox',
                q: query,
                hl: 'en',
                gl: 'IN',
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        return response.data[1] || [];
    } catch (error) {
        console.error(`Error fetching suggestions for "${query}":`, error.message);
        return [];
    }
};

// Scrape Keywords Controller
const scrapeKeywords = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const collectedKeywords = new Set();
    const queue = [query];

    try {
        console.log(`Starting scrape for query: "${query}"`);

        while (queue.length && collectedKeywords.size < 200) {
            const currentQuery = queue.shift();
            // console.log(`Fetching suggestions for: "${currentQuery}"`);

            const suggestions = await fetchSuggestions(currentQuery);

            for (const suggestion of suggestions) {
                if (!collectedKeywords.has(suggestion)) {
                    collectedKeywords.add(suggestion);
                    queue.push(suggestion);
                }

                if (collectedKeywords.size >= 100) break;
            }
        }

        if (collectedKeywords.size === 0) {
            return res.status(404).json({ message: 'No keywords found' });
        }

        console.log(`Scraping completed. Total keywords collected: ${collectedKeywords.size}`);
        res.status(200).json({ keywords: Array.from(collectedKeywords) });
    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape keywords', details: error.message });
    }
};

module.exports = { scrapeKeywords };
