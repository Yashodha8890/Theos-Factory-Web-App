const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const appointmentRoutes = require('./routes/appointments');
const quotationRoutes = require('./routes/quotations');
const rentalRoutes = require('./routes/rentals');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Theo\u2019s Factory backend is running.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
