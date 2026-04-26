const express = require('express');
const auth = require('../middleware/auth');
const RentalItem = require('../models/RentalItem');
const RentalBooking = require('../models/RentalBooking');
const router = express.Router();

router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const query = { availability: true };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await RentalItem.find(query).sort({ category: 1, name: 1 });
  res.json(items);
});

router.post('/book', auth, async (req, res) => {
  const { itemId, startDate, endDate, quantity } = req.body;
  if (!itemId || !startDate || !endDate || !quantity) {
    return res.status(400).json({ message: 'Item, rental dates, and quantity are required' });
  }

  const item = await RentalItem.findById(itemId);
  if (!item || !item.availability) {
    return res.status(404).json({ message: 'Rental item is not available' });
  }
  if (quantity < 1 || quantity > item.quantity) {
    return res.status(400).json({ message: `Quantity must be between 1 and ${item.quantity}` });
  }

  const booking = await RentalBooking.create({
    userId: req.user._id,
    itemId,
    startDate,
    endDate,
    quantity,
  });

  res.status(201).json(booking);
});

router.get('/me', auth, async (req, res) => {
  const bookings = await RentalBooking.find({ userId: req.user._id }).populate('itemId');
  res.json(bookings);
});

module.exports = router;
