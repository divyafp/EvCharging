// Assuming the database connection setup is in '../../config/conn'
require('dotenv').config();
require('./src/config/conn');

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({origin : 'https://admin.charznet.in'}));

// app.use(cors({
//   origin: allowedOrigins,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204,
// }));
app.use('/uploads/station_images', express.static('uploads/station_images'));
app.use('/uploads/users', express.static('uploads/users'));
app.use('/uploads/port_images', express.static('uploads/port_images'));
app.use('/uploads/country_images', express.static('uploads/country_images'));

const authRoutes = require('./src/api/routers/auth-routers');
const loggedInRoutes = require('./src/api/routers/logged-in-routers');
const adminRoutes = require('./src/api/routers/admin-routers');
const commonRoutes = require('./src/api/routers/common-routers');

app.use('/auth', authRoutes);
app.use('/app/logged_in', loggedInRoutes);
app.use('/admin', adminRoutes);
app.use('/common', commonRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});