const express = require('express');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { serviceType, preferredDate, preferredTime, notes } = req.body;
  if (!serviceType || !preferredDate || !preferredTime) {
    return res.status(400).json({ message: 'Service type, preferred date, and preferred time are required' });
  }

  const appointment = await Appointment.create({
    userId: req.user._id,
    serviceType,
    preferredDate,
    preferredTime,
    notes,
  });
  res.status(201).json(appointment);
});

router.get('/me', auth, async (req, res) => {
  const appointments = await Appointment.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(appointments);
});

module.exports = router;
