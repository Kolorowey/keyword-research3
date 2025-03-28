require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const MetaTag = require('../models/MetaTag');

// Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Meta tags data
const metaTags = [
  {
    pageSlug: 'home',
    title: 'Keyword Raja - Boost Your SEO Today',
    description: 'Discover top SEO tools with Keyword Raja to optimize your site and rank higher now!',
  },
  {
    pageSlug: 'related-keywords',
    title: 'Related Keywords - Keyword Raja',
    description: 'Find related keywords to enhance your SEO strategy with Keyword Raja’s powerful tools.',
  },
  {
    pageSlug: 'long-tail-keywords',
    title: 'Long-Tail Keywords - Keyword Raja',
    description: 'Explore long-tail keywords for targeted traffic with Keyword Raja’s SEO solutions.',
  },
  {
    pageSlug: 'search-volume',
    title: 'Search Volume - Keyword Raja',
    description: 'Analyze search volume trends with Keyword Raja to optimize your keyword strategy.',
  },
  {
    pageSlug: 'keyword-difficulty',
    title: 'Keyword Difficulty - Keyword Raja',
    description: 'Check keyword difficulty with Keyword Raja to target winnable SEO opportunities.',
  },
  {
    pageSlug: 'keyword-spam-score',
    title: 'Keyword Spam Score - Keyword Raja',
    description: 'Evaluate keyword spam scores with Keyword Raja for cleaner, effective SEO.',
  },
  {
    pageSlug: 'keyword-trends',
    title: 'Keyword Trends - Keyword Raja',
    description: 'Stay ahead with keyword trends analysis from Keyword Raja’s SEO toolkit.',
  },
  {
    pageSlug: 'cpc',
    title: 'CPC Analysis - Keyword Raja',
    description: 'Optimize ad spend with CPC insights from Keyword Raja’s keyword tools.',
  },
  {
    pageSlug: 'ad-competitions',
    title: 'Ad Competition - Keyword Raja',
    description: 'Assess ad competition with Keyword Raja to refine your PPC and SEO strategy.',
  },
];

// Function to seed the database
const seedDB = async () => {
  try {
    // Clear existing data (optional, remove if you want to append instead)
    await MetaTag.deleteMany({});
    console.log('Existing meta tags cleared');

    // Insert new meta tags
    await MetaTag.insertMany(metaTags);
    console.log('Meta tags seeded successfully');
  } catch (error) {
    console.error('Error seeding meta tags:', error);
  } finally {
    mongoose.connection.close(); // Close the connection after seeding
  }
};

// Run the seed function
seedDB();