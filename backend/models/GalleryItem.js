const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
