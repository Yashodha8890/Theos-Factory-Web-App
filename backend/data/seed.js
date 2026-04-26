const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const { services, gallery, rentals, user, demoRecords } = require('./seedData');
const Service = require('../models/Service');
const GalleryItem = require('../models/GalleryItem');
const RentalItem = require('../models/RentalItem');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Quotation = require('../models/Quotation');
const RentalBooking = require('../models/RentalBooking');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Service.deleteMany({}),
      GalleryItem.deleteMany({}),
      RentalItem.deleteMany({}),
      User.deleteMany({}),
      Appointment.deleteMany({}),
      Quotation.deleteMany({}),
      RentalBooking.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const demoUser = await User.create({ ...user, password: hashedPassword });
    await Service.insertMany(services);
    await GalleryItem.insertMany(gallery);
    const insertedRentals = await RentalItem.insertMany(rentals);

    await Appointment.insertMany(
      demoRecords.appointments.map((appointment) => ({
        ...appointment,
        userId: demoUser._id,
      })),
    );
    await Quotation.insertMany(
      demoRecords.quotations.map((quotation) => ({
        ...quotation,
        userId: demoUser._id,
      })),
    );
    await RentalBooking.create({
      ...demoRecords.rentalBooking,
      userId: demoUser._id,
      itemId: insertedRentals[1]._id,
    });

    console.log('Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
