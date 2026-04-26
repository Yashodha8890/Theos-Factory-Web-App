const express = require('express');
const GalleryItem = require('../models/GalleryItem');
const router = express.Router();

router.get('/', async (req, res) => {
  const items = await GalleryItem.find({});
  res.json(items);
});

module.exports = router;
