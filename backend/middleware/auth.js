const jwt = require('jsonwebtoken');
const User = require('../models/User');

const defaultAdminEmail = 'admin@theosfactory.com';
const isDefaultAdminUser = (user) => user?.email?.toLowerCase() === defaultAdminEmail;

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (isDefaultAdminUser(user) && user.status !== 'Active') {
      user.status = 'Active';
      await user.save();
    }
    if (['Suspended', 'Pending'].includes(user.status)) {
      return res.status(403).json({ message: 'This account is not active' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth;
