const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  status: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
