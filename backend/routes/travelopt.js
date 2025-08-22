const express = require('express');
const connection = require('../db');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Get all travel options
router.get('/', (req, res) => {
  connection.query('SELECT * FROM travel_options', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Book a travel option
router.post('/', authenticate, (req, res) => {
  const user_id = req.user.userId;
  const { travel_option_id, num_seats } = req.body;

  connection.query('SELECT available_seats, price FROM travel_options WHERE id = ?', [travel_option_id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results.length) return res.status(404).send('Travel option not found');

    const travel = results[0];
    if (travel.available_seats < num_seats) return res.status(400).send('Not enough seats');

    const total_price = travel.price * num_seats;

    connection.query(
      'INSERT INTO bookings (user_id, travel_option_id, num_seats, total_price, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, travel_option_id, num_seats, total_price, 'Confirmed'],
      (err, bookingResults) => {
        if (err) return res.status(500).send(err);

        connection.query(
          'UPDATE travel_options SET available_seats = available_seats - ? WHERE id = ?',
          [num_seats, travel_option_id],
          (err) => {
            if (err) return res.status(500).send(err);
            res.json({ bookingId: bookingResults.insertId, total_price, status: 'Confirmed' });
          }
        );
      }
    );
  });
});

module.exports = router;