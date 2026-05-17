const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, trim: true },
  category: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RentalItem', rentalItemSchema);
