const express = require('express');
const bcrypt = require('bcrypt');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Quotation = require('../models/Quotation');
const RentalItem = require('../models/RentalItem');
const RentalBooking = require('../models/RentalBooking');
const Service = require('../models/Service');
const GalleryItem = require('../models/GalleryItem');

const router = express.Router();

router.use(adminAuth);

const activeRentalStatuses = ['Reserved', 'In Transit', 'Out For Delivery'];
const rentalBookingStatuses = ['Reserved', 'In Transit', 'Out For Delivery', 'Returned', 'Cancelled'];
const userStatuses = ['Active', 'Suspended', 'Pending'];
const userRoles = ['user', 'admin', 'staff'];
const userRoleLabels = {
  user: 'Customer',
  admin: 'Admin',
  staff: 'Staff',
};
const defaultAdminEmail = 'admin@theosfactory.com';
const isDefaultAdminUser = (user) => user?.email?.toLowerCase() === defaultAdminEmail;

const normalizeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const isLateReturn = (booking) => {
  if (!activeRentalStatuses.includes(booking.status)) return false;
  const endDate = normalizeDate(booking.endDate);
  if (!endDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return endDate < today;
};

const isUpcomingReturn = (booking) => {
  if (!activeRentalStatuses.includes(booking.status)) return false;
  const endDate = normalizeDate(booking.endDate);
  if (!endDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  return endDate >= today && endDate <= sevenDaysFromNow;
};

const getOrderDisplayStatus = (booking) => {
  if (isLateReturn(booking)) return 'Overdue';
  if (booking.status === 'Reserved') return 'Pending';
  if (booking.status === 'In Transit') return 'Picked';
  if (booking.status === 'Out For Delivery') return 'Out for Rental';
  return booking.status;
};

const getRentalPeriodDays = (booking) => {
  const startDate = normalizeDate(booking.startDate);
  const endDate = normalizeDate(booking.endDate);
  if (!startDate || !endDate) return 1;
  const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 1);
};

const mapRentalOrder = (booking) => {
  const rentalDays = getRentalPeriodDays(booking);
  const unitPrice = Number(booking.itemId?.price || 0);
  const quantity = Number(booking.quantity || 0);

  return {
    _id: booking._id,
    orderNumber: `ORD-${String(booking._id).slice(-6).toUpperCase()}`,
    customer: booking.userId || null,
    item: booking.itemId || null,
    startDate: booking.startDate,
    endDate: booking.endDate,
    quantity,
    rentalDays,
    status: getOrderDisplayStatus(booking),
    rawStatus: booking.status,
    totalValue: unitPrice * quantity * rentalDays,
    highPriority: isLateReturn(booking),
    createdAt: booking.createdAt,
  };
};

const mapAdminUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role || 'user',
  roleLabel: userRoleLabels[user.role] || 'Customer',
  status: isDefaultAdminUser(user) ? 'Active' : user.status || 'Active',
  protectedStatus: isDefaultAdminUser(user),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastActivity: user.updatedAt || user.createdAt,
});

router.get('/overview', async (req, res) => {
  const [
    users,
    appointments,
    quotations,
    rentalItems,
    rentalBookings,
    rentalBookingNotifications,
    activeRentalBookings,
    services,
    galleryItems,
    latestAppointments,
    latestQuotations,
    latestRentalBookings,
    latestUsers,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Appointment.countDocuments({}),
    Quotation.countDocuments({}),
    RentalItem.countDocuments({}),
    RentalBooking.countDocuments({}),
    RentalBooking.countDocuments({ status: 'Reserved' }),
    RentalBooking.countDocuments({ status: { $in: activeRentalStatuses } }),
    Service.countDocuments({}),
    GalleryItem.countDocuments({}),
    Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('userId', 'name email')
      .lean(),
    Quotation.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('userId', 'name email')
      .lean(),
    RentalBooking.find({ status: { $in: activeRentalStatuses } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email phone')
      .populate('itemId', 'name category image sku price')
      .lean(),
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('name email phone avatar createdAt')
      .lean(),
  ]);

  res.json({
    counts: {
      users,
      appointments,
      quotations,
      rentalItems,
      rentalBookings,
      rentalBookingNotifications,
      activeRentalBookings,
      services,
      galleryItems,
    },
    latestAppointments,
    latestQuotations,
    latestRentalBookings,
    latestUsers,
  });
});

router.get('/users', async (req, res) => {
  const {
    search = '',
    role = 'All',
    status = 'All',
    sort = 'recent',
    page = 1,
    limit = 4,
  } = req.query;

  const baseUserFilter = { _id: { $ne: req.user._id } };
  const filter = { ...baseUserFilter };
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    const searchRegex = new RegExp(trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (role !== 'All') {
    const roleMap = { Customer: 'user', Admin: 'admin', Staff: 'staff' };
    filter.role = roleMap[role] || role;
  }

  if (status !== 'All') {
    if (status === 'Active') {
      filter.$and = [...(filter.$and || []), { $or: [{ status: 'Active' }, { status: { $exists: false } }] }];
    } else {
      filter.status = status;
    }
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 4, 1), 50);
  const skip = (pageNumber - 1) * limitNumber;
  const sortMap = {
    recent: { createdAt: -1 },
    name: { name: 1 },
    role: { role: 1, createdAt: -1 },
  };

  const [total, allUsers, pageUsers] = await Promise.all([
    User.countDocuments(filter),
    User.find(baseUserFilter).select('role status').lean(),
    User.find(filter)
      .sort(sortMap[sort] || sortMap.recent)
      .skip(skip)
      .limit(limitNumber)
      .select('-password')
      .lean(),
  ]);

  const stats = allUsers.reduce((acc, user) => {
    const currentStatus = user.status || 'Active';
    const currentRole = user.role || 'user';
    acc.totalUsers += 1;
    if (currentStatus === 'Active') acc.activeNow += 1;
    if (currentRole === 'staff' || currentRole === 'admin') acc.staffMembers += 1;
    if (currentStatus === 'Pending') acc.pendingRequests += 1;
    return acc;
  }, {
    totalUsers: 0,
    activeNow: 0,
    staffMembers: 0,
    pendingRequests: 0,
  });

  res.json({
    users: pageUsers.map(mapAdminUser),
    stats,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.max(Math.ceil(total / limitNumber), 1),
    },
  });
});

router.post('/users', async (req, res) => {
  const { name, email, phone, password, role = 'user', status = 'Active', avatar } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!userRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (!userStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    avatar,
    password: hashedPassword,
    role,
    status,
  });

  res.status(201).json(mapAdminUser(user));
});

router.patch('/users/:id', async (req, res) => {
  const { name, phone, role, status, avatar } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar !== undefined) updates.avatar = avatar;
  if (role !== undefined) {
    if (!userRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    updates.role = role;
  }
  if (status !== undefined) {
    if (!userStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    updates.status = status;
  }

  if (String(req.user._id) === req.params.id && ((updates.status && updates.status !== 'Active') || updates.role === 'user' || updates.role === 'staff')) {
    return res.status(400).json({ message: 'You cannot remove your own admin access' });
  }

  const existingUser = await User.findById(req.params.id).select('-password');
  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (isDefaultAdminUser(existingUser) && updates.status && updates.status !== 'Active') {
    return res.status(400).json({ message: 'Theo Admin is the default admin and must remain active' });
  }

  if (isDefaultAdminUser(existingUser)) {
    updates.status = 'Active';
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(mapAdminUser(user));
});

router.get('/orders', async (req, res) => {
  const { search = '', status = 'All' } = req.query;
  const bookings = await RentalBooking.find({})
    .sort({ createdAt: -1 })
    .populate('userId', 'name email phone avatar')
    .populate('itemId', 'name category image sku price')
    .lean();

  let orders = bookings.map(mapRentalOrder);

  if (search) {
    const needle = String(search).toLowerCase();
    orders = orders.filter((order) => (
      order.orderNumber.toLowerCase().includes(needle)
      || order.customer?.name?.toLowerCase().includes(needle)
      || order.customer?.email?.toLowerCase().includes(needle)
      || order.item?.name?.toLowerCase().includes(needle)
      || order.item?.category?.toLowerCase().includes(needle)
    ));
  }

  if (status && status !== 'All') {
    orders = orders.filter((order) => order.status === status || order.rawStatus === status);
  }

  const activeOrders = bookings.filter((booking) => activeRentalStatuses.includes(booking.status)).length;
  const pendingFulfillment = bookings.filter((booking) => booking.status === 'Reserved').length;
  const upcomingReturns = bookings.filter(isUpcomingReturn).length;
  const lateReturns = bookings.filter(isLateReturn).length;

  res.json({
    orders,
    stats: {
      activeOrders,
      pendingFulfillment,
      upcomingReturns,
      lateReturns,
      totalOrders: bookings.length,
    },
  });
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!rentalBookingStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid rental order status' });
  }

  const booking = await RentalBooking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  )
    .populate('userId', 'name email phone avatar')
    .populate('itemId', 'name category image sku price')
    .lean();

  if (!booking) {
    return res.status(404).json({ message: 'Rental order not found' });
  }

  res.json(mapRentalOrder(booking));
});

const appointmentStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const getAppointmentPriority = (appointment) => {
  if (appointment.status !== 'Pending') return appointment.status;

  const preferredDate = normalizeDate(appointment.preferredDate);
  if (!preferredDate) return 'New Request';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  if (preferredDate <= threeDaysFromNow) return 'Urgent';

  const createdAt = normalizeDate(appointment.createdAt);
  if (createdAt) {
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    if (createdAt <= twoDaysAgo) return 'Follow Up';
  }

  return 'New Request';
};

const mapAppointmentBooking = (appointment) => ({
  ...appointment,
  priority: getAppointmentPriority(appointment),
  location: appointment.serviceType?.toLowerCase().includes('rental') ? 'Studio Rental Review' : 'Design Consultation',
});

router.get('/bookings', async (req, res) => {
  const { search = '', status = 'All' } = req.query;
  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  let appointments = await Appointment.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email phone avatar')
    .lean();

  if (search) {
    const needle = String(search).toLowerCase();
    appointments = appointments.filter((appointment) => (
      appointment.userId?.name?.toLowerCase().includes(needle)
      || appointment.userId?.email?.toLowerCase().includes(needle)
      || appointment.serviceType?.toLowerCase().includes(needle)
      || appointment.notes?.toLowerCase().includes(needle)
    ));
  }

  const allAppointments = await Appointment.find({}).lean();
  const pendingBookings = allAppointments.filter((appointment) => appointment.status === 'Pending');
  const urgentBookings = pendingBookings.filter((appointment) => getAppointmentPriority(appointment) === 'Urgent');

  res.json({
    bookings: appointments.map(mapAppointmentBooking),
    stats: {
      totalBookings: allAppointments.length,
      pendingRequests: pendingBookings.length,
      urgentRequests: urgentBookings.length,
      confirmedBookings: allAppointments.filter((appointment) => appointment.status === 'Confirmed').length,
      completedBookings: allAppointments.filter((appointment) => appointment.status === 'Completed').length,
      unresolvedItems: pendingBookings.length,
    },
  });
});

router.patch('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!appointmentStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status' });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  )
    .populate('userId', 'name email phone avatar')
    .lean();

  if (!appointment) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  res.json(mapAppointmentBooking(appointment));
});

router.patch('/bookings/:id/reschedule', async (req, res) => {
  const { preferredDate, preferredTime } = req.body;

  if (!preferredDate || !preferredTime) {
    return res.status(400).json({ message: 'Preferred date and time are required' });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { preferredDate, preferredTime, status: 'Pending' },
    { new: true, runValidators: true },
  )
    .populate('userId', 'name email phone avatar')
    .lean();

  if (!appointment) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  res.json(mapAppointmentBooking(appointment));
});

const galleryStatuses = ['Public', 'Private'];

const mapGalleryItem = (item) => ({
  ...item,
  status: item.status || 'Public',
  views: Number(item.views || 0),
});

router.get('/gallery', async (req, res) => {
  const { category = 'All', status = 'All', search = '' } = req.query;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, categories, totalImages, mostViewed, recentUpload] = await Promise.all([
    GalleryItem.find(query).sort({ createdAt: -1 }).lean(),
    GalleryItem.distinct('category'),
    GalleryItem.countDocuments({}),
    GalleryItem.findOne({}).sort({ views: -1, createdAt: -1 }).lean(),
    GalleryItem.findOne({}).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({
    items: items.map(mapGalleryItem),
    categories: categories.sort(),
    stats: {
      totalImages,
      categories: categories.length,
      mostViewed: mostViewed ? mapGalleryItem(mostViewed) : null,
      recentUpload: recentUpload ? mapGalleryItem(recentUpload) : null,
    },
  });
});

router.post('/gallery', async (req, res) => {
  const { title, category, image, description, status = 'Public' } = req.body;

  if (!title || !category || !image) {
    return res.status(400).json({ message: 'Title, category, and image are required' });
  }

  if (!galleryStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid gallery status' });
  }

  const item = await GalleryItem.create({
    title: String(title).trim(),
    category: String(category).trim(),
    image,
    description,
    status,
  });

  res.status(201).json(mapGalleryItem(item.toObject()));
});

router.patch('/gallery/:id', async (req, res) => {
  const updates = {};
  const allowedFields = ['title', 'category', 'image', 'description', 'status'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.title !== undefined) updates.title = String(updates.title).trim();
  if (updates.category !== undefined) updates.category = String(updates.category).trim();
  if (updates.status !== undefined && !galleryStatuses.includes(updates.status)) {
    return res.status(400).json({ message: 'Invalid gallery status' });
  }

  const item = await GalleryItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
  if (!item) {
    return res.status(404).json({ message: 'Gallery item not found' });
  }

  res.json(mapGalleryItem(item));
});

router.delete('/gallery/:id', async (req, res) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Gallery item not found' });
  }

  res.json({ message: 'Gallery item deleted' });
});

const generateSku = (name = '', category = '') => {
  const prefix = String(category || 'item').slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'ITM';
  const suffix = String(name || 'rental')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 14) || Date.now().toString().slice(-6);

  return `${prefix}-${suffix}`;
};

const getInventoryStatus = (item, activeQuantity) => {
  if (!item.availability) return 'Unavailable';

  const quantity = Number(item.quantity || 0);
  const availableQuantity = Math.max(quantity - activeQuantity, 0);
  const lowStockThreshold = Math.max(1, Math.ceil(quantity * 0.15));

  if (quantity === 0 || availableQuantity === 0) return 'Rented';
  if (availableQuantity <= lowStockThreshold) return 'Low Stock';
  return 'Available';
};

const mapInventoryItem = (item, activeQuantity = 0) => {
  const totalQuantity = Number(item.quantity || 0);
  const reservedQuantity = Number(activeQuantity || 0);
  const availableQuantity = item.availability ? Math.max(totalQuantity - reservedQuantity, 0) : 0;
  const status = getInventoryStatus(item, reservedQuantity);

  return {
    ...item,
    sku: item.sku || generateSku(item.name, item.category),
    totalQuantity,
    reservedQuantity,
    availableQuantity,
    status,
  };
};

router.get('/inventory', async (req, res) => {
  const { search = '', category = 'All', status = 'All' } = req.query;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, activeBookings, categories] = await Promise.all([
    RentalItem.find(query).sort({ category: 1, name: 1 }).lean(),
    RentalBooking.aggregate([
      { $match: { status: { $in: activeRentalStatuses } } },
      { $group: { _id: '$itemId', quantity: { $sum: '$quantity' } } },
    ]),
    RentalItem.distinct('category'),
  ]);

  const activeQuantityByItem = activeBookings.reduce((lookup, booking) => {
    lookup[String(booking._id)] = booking.quantity;
    return lookup;
  }, {});

  let inventoryItems = items.map((item) => mapInventoryItem(item, activeQuantityByItem[String(item._id)] || 0));

  if (status && status !== 'All') {
    inventoryItems = inventoryItems.filter((item) => item.status === status);
  }

  const stats = inventoryItems.reduce((totals, item) => ({
    totalItems: totals.totalItems + 1,
    totalUnits: totals.totalUnits + item.totalQuantity,
    availableUnits: totals.availableUnits + item.availableQuantity,
    activeRentalUnits: totals.activeRentalUnits + item.reservedQuantity,
    lowStockItems: totals.lowStockItems + (item.status === 'Low Stock' ? 1 : 0),
  }), {
    totalItems: 0,
    totalUnits: 0,
    availableUnits: 0,
    activeRentalUnits: 0,
    lowStockItems: 0,
  });

  res.json({
    items: inventoryItems,
    categories: categories.sort(),
    stats,
  });
});

router.post('/inventory', async (req, res) => {
  const { name, sku, category, image, description, price, quantity, availability } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Name, category, and rate are required' });
  }

  const item = await RentalItem.create({
    name: String(name).trim(),
    sku: sku ? String(sku).trim() : generateSku(name, category),
    category: String(category).trim(),
    image,
    description,
    price: Number(price),
    quantity: Number(quantity || 0),
    availability: availability !== undefined ? Boolean(availability) : true,
  });

  res.status(201).json(mapInventoryItem(item.toObject(), 0));
});

router.patch('/inventory/:id', async (req, res) => {
  const updates = {};
  const allowedFields = ['name', 'sku', 'category', 'image', 'description', 'price', 'quantity', 'availability'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.name !== undefined) updates.name = String(updates.name).trim();
  if (updates.sku !== undefined) updates.sku = String(updates.sku).trim();
  if (updates.category !== undefined) updates.category = String(updates.category).trim();
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.quantity !== undefined) updates.quantity = Number(updates.quantity);
  if (updates.availability !== undefined) updates.availability = Boolean(updates.availability);

  const item = await RentalItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
  if (!item) {
    return res.status(404).json({ message: 'Rental item not found' });
  }

  const activeBooking = await RentalBooking.aggregate([
    { $match: { itemId: item._id, status: { $in: activeRentalStatuses } } },
    { $group: { _id: '$itemId', quantity: { $sum: '$quantity' } } },
  ]);

  res.json(mapInventoryItem(item, activeBooking[0]?.quantity || 0));
});

router.delete('/inventory/:id', async (req, res) => {
  const activeBookings = await RentalBooking.countDocuments({
    itemId: req.params.id,
    status: { $in: activeRentalStatuses },
  });

  if (activeBookings > 0) {
    return res.status(400).json({ message: 'Cannot delete an item with active rental bookings' });
  }

  const item = await RentalItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Rental item not found' });
  }

  await RentalBooking.deleteMany({ itemId: req.params.id });
  res.json({ message: 'Rental item deleted' });
});

module.exports = router;
