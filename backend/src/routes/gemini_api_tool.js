const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const axios = require("axios");
const cheerio = require("cheerio");

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to fetch Keyword Volume, Difficulty, Spam Risk, and Search Intent
const getKeywordDetails = async (keyword) => {
  try {
    // Prepare the prompt to ask for Keyword Volume, Difficulty, Spam Risk, and Search Intent
    const prompt = `For the keyword "${keyword}", provide the following information:
      - Keyword Volume (set to a sample value like 5000 to 50k)
      - Keyword Difficulty (set to a sample percentage)
      - Spam Risk Score (a percentage from 0 to 100)
      - Search Intent (one of the following: informational, commercial)

      only this 4 information is required

    Please return this information as a JSON object.`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
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
              generatedText = part.text; // Take the first text part we find
              break;
            }
          }
        }

        if (generatedText) break;
      }
    }

    if (generatedText) {
      // Clean the generated text to remove markdown (code block formatting)
      const cleanedText = generatedText.replace(/```json\n|\n```/g, "").trim();

      // Parse the cleaned JSON string
      try {
        const parsedResult = JSON.parse(cleanedText);

        if (parsedResult["Keyword Difficulty"]) {
          // Convert Keyword Difficulty to percentage
          parsedResult["Keyword Difficulty"] =
            (parsedResult["Keyword Difficulty"] * 100).toFixed(2) + "%";
        }

        // Generate Spam Risk Score (for now, just a random score between 0-100)
        const spamRiskScore = Math.random() * 100;
        parsedResult["spamRiskScore"] = spamRiskScore.toFixed(2); // Set it with two decimal places

        // Generate Search Intent (for now, randomly choose between informational/commercial)
        const intents = ["informational", "commercial"];
        parsedResult["searchIntent"] =
          intents[Math.floor(Math.random() * intents.length)];

        // Remove the old redundant keys
        delete parsedResult["Spam Risk Score"];
        delete parsedResult["Search Intent"];

        return parsedResult; // Return the modified JSON data
      } catch (error) {
        console.error("Error parsing cleaned JSON:", error);
        throw new Error("Failed to parse cleaned JSON response");
      }
    } else {
      console.error(
        "Unexpected response structure:",
        JSON.stringify(result, null, 2)
      );
      return "Unexpected response structure";
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to fetch keyword details");
  }
};

// Endpoint for fetching Keyword Volume, Difficulty, Spam Risk, and Search Intent
router.post("/get-keyword-details", async (req, res) => {
  const { keyword } = req.body; // Expecting a single keyword

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const analysisResult = await getKeywordDetails(keyword);

    res.json({ analysisResult }); // Send the result back to the client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to fetch Keyword Volume and Difficulty for a single keyword
const getKeywordDifficulty = async (keyword) => {
  try {
    // Prepare the prompt to ask for Keyword Volume and Keyword Difficulty for a single keyword
    const prompt = `I understand that you cannot access real-time data. I just need demo data for testing. For the following keyword, please provide a JSON object containing  Keyword Difficulty("keyword_difficulty" in json) (set to a sample percentage based on difficulty of that keyword) and a 10 words line with description of difficulty of keyword (ex-this is the hardest keyword and has a lot of competition.(difficulty_description in json)).\n\nKeyword: ${keyword}`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    // console.log("Full response from Gemini API:", JSON.stringify(result, null, 2)); // Improved logging

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
              generatedText = part.text; // Take the first text part we find
              break;
            }
          }
        }

        if (generatedText) break;
      }
    }

    if (generatedText) {
      // Clean the generated text to remove markdown (code block formatting)
      const cleanedText = generatedText.replace(/```json\n|\n```/g, "").trim();

      // Parse the cleaned JSON string
      try {
        const parsedResult = JSON.parse(cleanedText);

        if (parsedResult["Keyword Difficulty"]) {
          // Convert Keyword Difficulty to percentage
          parsedResult["Keyword Difficulty"] =
            (parsedResult["Keyword Difficulty"] * 100).toFixed(2) + "%";
        }

        return parsedResult; // Return the modified JSON data with percentage
      } catch (error) {
        console.error("Error parsing cleaned JSON:", error);
        throw new Error("Failed to parse cleaned JSON response");
      }
    } else {
      console.error(
        "Unexpected response structure:",
        JSON.stringify(result, null, 2)
      );
      return "Unexpected response structure";
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to fetch keyword volume and difficulty");
  }
};

// Endpoint for fetching Keyword Volume and Difficulty for a single keyword
router.post("/get-keyword-difficulty", async (req, res) => {
  const { keyword } = req.body; // Expecting a single keyword

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const analysisResult = await getKeywordDifficulty(keyword);

    res.json({ analysisResult }); // Send the result back to the client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to fetch Spam Score for a single keyword
const getKeywordSpamScore = async (keyword) => {
  try {
    // Prepare the prompt to ask for Spam Score of a keyword
    const prompt = `I understand that you cannot access real-time data. I just need demo data for testing. For the following keyword, please provide a JSON object containing Spam Score from scale of 1 - 10("spam_score" in json) (set to a sample marks on scale 1- 10 based on how spammy the keyword is not percentage) and a 10-word description of the spam level of the keyword (ex- this keyword is highly spammy and overused. ("spam_description" in json)).\n\nKeyword: ${keyword}`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
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

        if (parsedResult["spam_score"]) {
          parsedResult["spam_score"] =
            (parsedResult["spam_score"] * 100).toFixed(2) + "%";
        }

        return parsedResult;
      } catch (error) {
        console.error("Error parsing cleaned JSON:", error);
        throw new Error("Failed to parse cleaned JSON response");
      }
    } else {
      console.error(
        "Unexpected response structure:",
        JSON.stringify(result, null, 2)
      );
      return "Unexpected response structure";
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to fetch spam score");
  }
};

// Endpoint for fetching Spam Score for a single keyword
router.post("/get-keyword-spam-score", async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const analysisResult = await getKeywordSpamScore(keyword);
    res.json({ analysisResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
