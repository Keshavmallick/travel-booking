const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const travelRoutes = require('./routes/travel_options');

app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/travel_options', travelRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));