const express = require('express');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();  // Load environment variables

const secretKey = process.env.JWT_SECRET;

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  connection.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.send('Registration successful');
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(401).send('Invalid credentials');

      const user = results[0];
      const token = jwt.sign({ userId: user.id, name: user.name }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    }
  );
});

module.exports = router;