const express = require('express');
const connection = require('../db'); // your MySQL connection
const authenticate = require('../middleware/auth'); // JWT auth middleware
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

  // Step 1: Check availability
  connection.query(
    'SELECT available_seats, price FROM travel_options WHERE id = ?',
    [travel_option_id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results.length) return res.status(404).send('Travel option not found');

      const travel = results[0];

      if (travel.available_seats < num_seats) {
        return res.status(400).send('Not enough seats available');
      }

      const total_price = travel.price * num_seats;

      // Step 2: Insert booking
      connection.query(
        'INSERT INTO bookings (user_id, travel_option_id, num_seats, total_price, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, travel_option_id, num_seats, total_price, 'Confirmed'],
        (err, bookingResults) => {
          if (err) return res.status(500).send(err);

          // Step 3: Update available seats
          connection.query(
            'UPDATE travel_options SET available_seats = available_seats - ? WHERE id = ?',
            [num_seats, travel_option_id],
            (err) => {
              if (err) return res.status(500).send(err);

              // Step 4: Return booking info
              res.json({
                booking_id: bookingResults.insertId,
                user_id,
                travel_option_id,
                num_seats,
                total_price,
                status: 'Confirmed'
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;