const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true },
  eventDate: { type: String, required: true },
  guestCount: { type: String, required: true },
  budgetRange: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Review', 'Pending Review', 'Approved', 'Rejected', 'Closed'], default: 'Pending Review' },
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
