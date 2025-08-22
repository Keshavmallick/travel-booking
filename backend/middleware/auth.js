const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send('Access denied. No token provided.');

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send('Invalid or expired token');
    req.user = user;
    next();
  });
}

module.exports = authenticate;