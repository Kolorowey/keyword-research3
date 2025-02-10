const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const axios = require('axios');
const cheerio = require('cheerio');

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


const getSEOSuggestions = async (text) => {
  try {
      const prompt = `Provide SEO suggestions for the following blog text, including:
* **Keyword Suggestions:**  Suggest relevant keywords that could be added to improve search engine ranking.
* **Title Optimization:** Suggest improvements to the title to make it more compelling and SEO-friendly.
* **Meta Description Suggestions:** Suggest a compelling meta description that accurately summarizes the content and encourages clicks from search results.
* **Content Structure Suggestions:**  Suggest improvements to the content structure, such as headings, subheadings, and formatting, to make it more readable and SEO-friendly.
* **Link Building Opportunities:**  Suggest potential link-building opportunities, such as relevant websites or resources that could be linked to.

Blog Text:\n\n${text}`;

      const result = await model.generateContent({
          contents: [{ parts: [{ text: prompt }] }],
      });

      console.log(
          "Full response from Gemini API (SEO Suggestions):",
          JSON.stringify(result, null, 2)
      );

      let seoSuggestions = null;

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
                          seoSuggestions = part.text;
                          break;
                      }
                  }
              }
              if (seoSuggestions) break;
          }
      }

      if (seoSuggestions) {
          return seoSuggestions;
      } else {
          console.error(
              "Unexpected response structure (SEO Suggestions):",
              JSON.stringify(result, null, 2)
          );
          return "Unexpected response structure";
      }
  } catch (error) {
      console.error("Error getting SEO suggestions:", error);
      throw new Error("Failed to get SEO suggestions");
  }
};

// Function to fetch blog content from a URL (optimized for text extraction)
async function fetchBlogText(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Example: Extract text from the main content (adjust the selector if necessary)
    const mainContent = $('article').text().trim(); // Targeting the article tag for main content
    
    if (!mainContent) {
      throw new Error('No main content found');
    }

    // Clean up the text by removing extra spaces, line breaks, and other unwanted characters
    const cleanText = mainContent
      .replace(/\s+/g, ' ')  // Replace multiple spaces, tabs, newlines with a single space
      .replace(/^\s+|\s+$/g, '')  // Trim leading and trailing spaces
      .replace(/\n/g, ' ')  // Replace line breaks with a space
      .replace(/\r/g, '');  // Remove any carriage returns

    return cleanText;
  } catch (error) {
    throw new Error('Error fetching blog text: ' + error.message);
  }
}

// Route for SEO suggestions
router.post("/seo-suggestions", async (req, res) => {
  const { blogUrl } = req.body;

  if (!blogUrl) {
      return res.status(400).json({ error: "Blog URL is required" });
  }

  try {
      // Fetch blog text from URL
      const blogText = await fetchBlogText(blogUrl);

      if (!blogText) {
          return res.status(400).json({ error: "Failed to extract text from the blog" });
      }

      // Get SEO suggestions based on the extracted text
      const suggestions = await getSEOSuggestions(blogText);

      // Respond with SEO suggestions
      res.json({ seoSuggestions: suggestions });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



const generateBlogContent = async (prompt) => {
  try {
      const fullPrompt = `Write a blog post based on the following prompt, aiming for approximately 100 lines in length:\n\n${prompt}`;

      const result = await model.generateContent({
          contents: [{ parts: [{ text: fullPrompt }] }],
      });

      console.log(
          "Full response from Gemini API (Blog Creation):",
          JSON.stringify(result, null, 2)
      );

      let blogContent = null;

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
                          blogContent = part.text;
                          break;
                      }
                  }
              }
              if (blogContent) break;
          }
      }

      if (blogContent) {
          return blogContent;
      } else {
          console.error(
              "Unexpected response structure (Blog Creation):",
              JSON.stringify(result, null, 2)
          );
          return "Unexpected response structure";
      }
  } catch (error) {
      console.error("Error generating blog content:", error);
      throw new Error("Failed to generate blog content");
  }
};

router.post("/create-blog", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
  }

  try {
      const blogContent = await generateBlogContent(prompt);
      res.json({ blogContent });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});





module.exports = router;
