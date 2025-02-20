const express = require("express");
const router = express.Router();
require("dotenv").config();

// Keywords Everywhere API Endpoint
const KE_API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";

router.post("/keyword-data", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default; // Dynamic import

    const { keywords, country = "us", currency = "USD" } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: "Invalid or missing keywords array" });
    }

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

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching keyword data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
