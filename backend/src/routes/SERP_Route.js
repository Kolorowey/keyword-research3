const axios = require('axios');

const API_KEY = "a7f55f201d7ac17544c172600a426b2d"; // Replace with your actual API key
const keyword = "best SEO tools"; // Your target keyword

async function getKeywordVolume() {
    try {
        const response = await axios.get('https://api.serpstack.com/search', {
            params: {
                access_key: API_KEY,
                query: keyword,
                num: 10 // Limit results
            }
        });

        console.log("Keyword Data:", response.data);
    } catch (error) {
        console.error("Error fetching keyword data:", error.message);
    }
}

getKeywordVolume();
