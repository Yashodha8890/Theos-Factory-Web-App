const express = require('express');
const GalleryItem = require('../models/GalleryItem');
const router = express.Router();

router.get('/', async (req, res) => {
  const items = await GalleryItem.find({
    $or: [
      { status: 'Public' },
      { status: { $exists: false } },
    ],
  });
  res.json(items);
});

module.exports = router;
