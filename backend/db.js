const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Keshav123',
  database: 'db-travel_booking'
});

connection.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

module.exports = connection;