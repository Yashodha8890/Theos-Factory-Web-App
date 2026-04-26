const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Quotation = require('../models/Quotation');
const RentalBooking = require('../models/RentalBooking');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

router.patch('/me', auth, async (req, res) => {
  const { name, phone, avatar, password } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    updates.password = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
  res.json(user);
});

router.delete('/me', auth, async (req, res) => {
  await Promise.all([
    Appointment.deleteMany({ userId: req.user._id }),
    Quotation.deleteMany({ userId: req.user._id }),
    RentalBooking.deleteMany({ userId: req.user._id }),
    User.findByIdAndDelete(req.user._id),
  ]);
  res.json({ message: 'Account deleted successfully' });
});

module.exports = router;
