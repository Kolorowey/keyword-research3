const express = require('express');
const axios = require('axios');
const moment = require('moment');

const router = express.Router();

router.post('/search', async (req, res) => {
    const { keywords, location_code, language_code, limit } = req.body;

    if (!keywords || !location_code || !language_code) {
        return res.status(400).json({
            message: 'keywords, location_code, and language_code are required',
        });
    }

    try {
        // Adjust date_from if needed (e.g., last full month)
        const dateFrom = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');

        const apiUrl = `https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live`;

        const payload = [
            {
                keywords,
                location_code,
                language_code,
                limit: limit || 200,
                date_from: dateFrom, 
            },
        ];

        console.log('Payload Sent:', JSON.stringify(payload, null, 2));

        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${process.env.DATAFORSEO_API_KEY}`,
            },
        });

        console.log('Full API Response:', JSON.stringify(response.data, null, 2));

        const extractedKeywords = response.data.tasks
            ?.flatMap((task) => task.result?.map((item) => item.keyword) || [])
            .filter(Boolean);

        console.log('Extracted Keywords:', extractedKeywords);

        if (extractedKeywords.length === 0) {
            return res.status(404).json({
                message: 'No keywords found for the given query',
                details: response.data,
            });
        }

        res.status(200).json({ keywords: extractedKeywords });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to fetch keywords',
            error: error.response?.data || error.message,
        });
    }
});

module.exports = router;
