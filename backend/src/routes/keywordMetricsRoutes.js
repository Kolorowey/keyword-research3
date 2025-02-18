const express = require('express');
const axios = require('axios');

const router = express.Router();

// Load API credentials from .env
const apiKey = process.env.DATAFORSEO_API_KEY;
if (!apiKey) {
    console.error('DATAFORSEO_API_KEY is missing in .env');
    process.exit(1);
}

// Function to fetch keyword search volume
async function getKeywordVolume(keyword, location_code, language_code) {
    const url = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';
    const payload = [
        {
            keywords: [keyword],
            location_code,
            language_code
        }
    ];

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${apiKey}`
            }
        });

        // Check if the response contains the expected structure
        const task = response.data?.tasks?.[0];
        if (task && task.result && task.result[0]) {
            return task.result[0].search_volume || 'Unknown';
        } else {
            console.error(`Unexpected response structure for keyword ${keyword}:`, response.data);
            return 'Unknown';
        }
    } catch (error) {
        console.error(`Error fetching volume for ${keyword}:`, error.response?.data || error.message);
        return 'Unknown';
    }
}

// Function to fetch keyword difficulty
async function getKeywordDifficulty(keyword, location_code, language_code) {
    const url = 'https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live';
    const requestBody = [
        {
            keywords: [keyword],
            location_code,
            language_code
        }
    ];

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${apiKey}` 
            }
        });

        return response.data.tasks?.[0]?.result?.[0]?.items?.[0]?.keyword_difficulty || "Unknown";
    } catch (error) {
        console.error('Error fetching keyword difficulty:', error.response?.data || error.message);
        return "Unknown";
    }
}


// Route: Get keyword volume
router.get('/keyword-volume', async (req, res) => {
    const { keyword, location_code = 2840, language_code = 'en' } = req.query;

    if (!keyword) {
        return res.status(400).json({ message: 'Keyword is required' });
    }

    try {
        const searchVolume = await getKeywordVolume(keyword, location_code, language_code);

        res.status(200).json({
            keyword,
            searchVolume
        });
    } catch (error) {
        console.error('Error fetching keyword volume:', error.message);
        res.status(500).json({ message: 'Failed to fetch keyword volume', error: error.message });
    }
});

// Route: Get keyword volume & difficulty
router.get('/', async (req, res) => {
    const { keyword, location_code = 2840, language_code = 'en' } = req.query;

    if (!keyword) {
        return res.status(400).json({ message: 'Keyword is required' });
    }

    try {
        const [searchVolume, keywordDifficulty] = await Promise.all([
            getKeywordVolume(keyword, location_code, language_code),
            getKeywordDifficulty(keyword, location_code, language_code)
        ]);

        res.status(200).json({
            keyword,
            searchVolume,
            keywordDifficulty
        });
    } catch (error) {
        console.error('Error fetching keyword metrics:', error.message);
        res.status(500).json({ message: 'Failed to fetch keyword metrics', error: error.message });
    }
});

module.exports = router;
