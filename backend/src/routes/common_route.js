const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to fetch Keyword Volume, Difficulty, Spam Risk, and Search Intent
const getKeywordDetails = async (keyword) => {
  try {
    const prompt = `For the keyword "${keyword}", provide the following information:
      - Keyword Volume (set to a sample value like 5000 to 50k)
      - Keyword Difficulty (set to a sample percentage based on )
      - Spam Risk Score (a percentage from 0 to 100 spammyness of keyword)
      - Search Intent (like of the following: informational, commercial, etc)
      
      Return this information as a JSON object.
      
      please follow structure and naming - keyword , keyword_Difficulty, keyword_Volume , search_Intent , spamRiskScore , in json`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    let generatedText = null;

    if (
      result &&
      result.response &&
      result.response.candidates &&
      result.response.candidates.length > 0
    ) {
      for (const candidate of result.response.candidates) {
        if (
          candidate &&
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          for (const part of candidate.content.parts) {
            if (part && part.text) {
              generatedText = part.text;
              break;
            }
          }
        }
        if (generatedText) break;
      }
    }

    if (generatedText) {
      const cleanedText = generatedText.replace(/```json\n|\n```/g, "").trim();

      try {
        const parsedResult = JSON.parse(cleanedText);

        if (parsedResult["Keyword Difficulty"]) {
          parsedResult["Keyword Difficulty"] =
            (parsedResult["Keyword Difficulty"] * 100).toFixed(2) + "%";
        }

        parsedResult["spamRiskScore"] = (Math.random() * 100).toFixed(2);
        const intents = ["informational", "commercial"];
        parsedResult["searchIntent"] =
          intents[Math.floor(Math.random() * intents.length)];

        delete parsedResult["Spam Risk Score"];
        delete parsedResult["Search Intent"];

        return parsedResult;
      } catch (error) {
        console.error("Error parsing cleaned JSON:", error);
        throw new Error("Failed to parse cleaned JSON response");
      }
    } else {
      console.error("Unexpected response structure:", JSON.stringify(result, null, 2));
      return "Unexpected response structure";
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to fetch keyword details");
  }
};

// Fetch suggestions from Google Suggest API
const fetchSuggestions = async (query) => {
  try {
    const response = await axios.get(
      "https://suggestqueries.google.com/complete/search",
      {
        params: {
          client: "firefox",
          q: query,
          hl: "en",
          gl: "IN",
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      }
    );

    return response.data[1] || [];
  } catch (error) {
    console.error(`Error fetching suggestions for "${query}":`, error.message);
    return [];
  }
};

// Scrape Keywords Controller
const scrapeKeywords = async (query) => {
  const collectedKeywords = new Set();
  const queue = [query];

  try {
    console.log(`Starting scrape for query: "${query}"`);

    while (queue.length && collectedKeywords.size < 200) {
      const currentQuery = queue.shift();

      const suggestions = await fetchSuggestions(currentQuery);

      for (const suggestion of suggestions) {
        if (!collectedKeywords.has(suggestion)) {
          collectedKeywords.add(suggestion);
          queue.push(suggestion);
        }

        if (collectedKeywords.size >= 200) break;
      }
    }

    return Array.from(collectedKeywords);
  } catch (error) {
    console.error("Scraping Error:", error);
    throw new Error("Failed to scrape keywords");
  }
};

// Unified Route to Handle Both Requests
router.post("/analyze-keyword", async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const analysisResult = await getKeywordDetails(keyword);
    const scrapedKeywords = await scrapeKeywords(keyword);

    res.json({ analysisResult, scrapedKeywords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
