const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getSpammyKeywordsAndScore = async (blogText) => {
  try {
    const prompt = `Analyze the following blog text and return the spammy keywords and spam score:\n\n${blogText}`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    console.log(
      "Full response from Gemini API:",
      JSON.stringify(result, null, 2)
    ); // Improved logging

    // **Robustly access the text:**

    let generatedText = null;

    if (
      result &&
      result.response &&
      result.response.candidates &&
      result.response.candidates.length > 0
    ) {
      for (const candidate of result.response.candidates) {
        // Iterate through candidates (important!)

        if (
          candidate &&
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          for (const part of candidate.content.parts) {
            if (part && part.text) {
              generatedText = part.text; // Take the first text part we find

              break; // Exit inner loop once text is found
            }
          }
        }

        if (generatedText) break; // Exit outer loop if text is found
      }
    }

    if (generatedText) {
      return generatedText;
    } else {
      console.error(
        "Unexpected response structure:",
        JSON.stringify(result, null, 2)
      ); // Log the full response for debugging

      return "Unexpected response structure"; // Or throw an error
    }
  } catch (error) {
    console.error("Error generating content:", error);

    throw new Error("Failed to analyze the blog text");
  }
};

router.post("/analyze-blog", async (req, res) => {
  const { blogText } = req.body;

  if (!blogText) {
    return res.status(400).json({ error: "Blog text is required" });
  }

  try {
    const analysisResult = await getSpammyKeywordsAndScore(blogText);

    res.json({ analysisResult }); // Send the result back to the client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const optimizeContent = async (content) => {
  try {
    const prompt = `Optimize the following content for clarity, readability, and SEO. Add relevant keywords where appropriate and remove any spammy or low-quality keywords.  Return the optimized content:\n\n${content}`;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    console.log(
      "Full response from Gemini API (Optimization):",
      JSON.stringify(result, null, 2)
    );

    let optimizedContent = null;

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
              optimizedContent = part.text;
              break;
            }
          }
        }
        if (optimizedContent) break;
      }
    }

    if (optimizedContent) {
      return optimizedContent;
    } else {
      console.error(
        "Unexpected response structure (Optimization):",
        JSON.stringify(result, null, 2)
      );
      return "Unexpected response structure";
    }
  } catch (error) {
    console.error("Error optimizing content:", error);
    throw new Error("Failed to optimize content");
  }
};

router.post("/optimize", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const optimizedContent = await optimizeContent(content);
    res.json({ optimizedContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
