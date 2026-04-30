const express = require('express');
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

router.get('/overview', async (req, res) => {
  const [
    users,
    appointments,
    quotations,
    rentalItems,
    rentalBookings,
    services,
    galleryItems,
    latestAppointments,
    latestQuotations,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Appointment.countDocuments({}),
    Quotation.countDocuments({}),
    RentalItem.countDocuments({}),
    RentalBooking.countDocuments({}),
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
  ]);

  res.json({
    counts: {
      users,
      appointments,
      quotations,
      rentalItems,
      rentalBookings,
      services,
      galleryItems,
    },
    latestAppointments,
    latestQuotations,
  });
});

const activeRentalStatuses = ['Reserved', 'In Transit', 'Out For Delivery'];

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
