const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Reserved', 'In Transit', 'Out For Delivery', 'Returned', 'Cancelled'], default: 'Reserved' },
}, { timestamps: true });

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
