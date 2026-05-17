const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const defaultAdminEmail = 'admin@theosfactory.com';
const isDefaultAdminUser = (user) => user?.email?.toLowerCase() === defaultAdminEmail;

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  status: user.status || 'Active',
  createdAt: user.createdAt,
});

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, phone });

  const token = signToken(user);
  res.status(201).json({ token, user: buildUserResponse(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (['Suspended', 'Pending'].includes(user.status)) {
    return res.status(403).json({ message: 'This account is not active' });
  }

  const token = signToken(user);
  res.json({ token, user: buildUserResponse(user) });
});

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and security key are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access is restricted to authorized personnel' });
  }
  if (isDefaultAdminUser(user) && user.status !== 'Active') {
    user.status = 'Active';
    await user.save();
  }
  if (['Suspended', 'Pending'].includes(user.status)) {
    return res.status(403).json({ message: 'This admin account is not active' });
  }

  const token = signToken(user);
  res.json({ token, user: buildUserResponse(user) });
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
