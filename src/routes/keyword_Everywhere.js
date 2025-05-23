const express = require("express");
const router = express.Router();
require("dotenv").config();
const UserActivity = require('../models/UserActivity');

// Keywords Everywhere API Endpoint
const KE_API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";

router.post("/keyword-Everywhere-Volume", async (req, res) => {
  const userId = req.headers['x-user-id'] || '';
  const userName = req.headers['x-user-name'] || '';
  let responseData = { error: 'No response data' };
  let responseStatus = 500;

  try {
    const fetch = (await import("node-fetch")).default; // Dynamic import

    const { keywords, country = "us", currency = "USD" } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      responseStatus = 400;
      responseData = { error: "Invalid or missing keywords array" };
      res.status(400).json(responseData);
    } else {
      const response = await fetch(KE_API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.KEYWORDS_EVERYWHERE_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams([
          ["dataSource", "gkp"],
          ["country", country],
          ["currency", currency],
          ...keywords.map((kw) => ["kw[]", kw]),
        ]),
      });

      const data = await response.json();

      responseStatus = response.status;
      responseData = data;

      if (!response.ok) {
        res.status(response.status).json({ error: data });
      } else {
        res.json(data);
      }
    }

    // Log user activity
    const activity = new UserActivity({
      userId,
      userName,
      route: req.originalUrl,
      method: req.method,
      queryParams: req.query,
      requestBody: req.body,
      responseStatus,
      responseData,
    });

    await activity.save().catch((err) => {
      console.error('Error saving user activity:', err.message);
    });
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    responseStatus = 500;
    responseData = { error: "Internal Server Error" };
    res.status(500).json(responseData);

    // Log user activity for error
    const activity = new UserActivity({
      userId,
      userName,
      route: req.originalUrl,
      method: req.method,
      queryParams: req.query,
      requestBody: req.body,
      responseStatus,
      responseData,
    });

    await activity.save().catch((err) => {
      console.error('Error saving user activity:', err.message);
    });
  }
});

module.exports = router;