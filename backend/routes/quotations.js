const express = require('express');
const auth = require('../middleware/auth');
const Quotation = require('../models/Quotation');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { eventType, eventDate, guestCount, budgetRange, serviceCategory, notes } = req.body;
  if (!eventType || !eventDate || !guestCount || !budgetRange || !serviceCategory) {
    return res.status(400).json({ message: 'Event type, date, guest count, budget, and service category are required' });
  }

  const quotation = await Quotation.create({
    userId: req.user._id,
    eventType,
    eventDate,
    guestCount,
    budgetRange,
    serviceCategory,
    notes,
  });
  res.status(201).json(quotation);
});

router.get('/me', auth, async (req, res) => {
  const quotations = await Quotation.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(quotations);
});

module.exports = router;
