const express = require('express');
const router = express.Router();
const MetaTag = require('../models/MetaTag');

// GET all meta tags
router.get('/', async (req, res) => {
  try {
    const metaTags = await MetaTag.find();
    res.json(metaTags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET meta tags for a specific page (already exists)
router.get('/:pageSlug', async (req, res) => {
  try {
    const { pageSlug } = req.params;
    const metaTag = await MetaTag.findOne({ pageSlug });
    if (!metaTag) {
      return res.status(404).json({ message: 'Meta tags not found' });
    }
    res.json(metaTag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update meta tag by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedMetaTag = await MetaTag.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedMetaTag) {
      return res.status(404).json({ message: 'Meta tag not found' });
    }
    res.json(updatedMetaTag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;