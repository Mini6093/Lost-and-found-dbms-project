const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
 
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mini6093', // replace with your password
  database: 'lostandfound'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('Lost and Found Backend is running!');
});


// ===================== USER ROUTES ===================== //

// CREATE a new user
app.post('/users', (req, res) => {
  const { Name, Email, PhoneNumber, Role } = req.body;
  const sql = 'INSERT INTO User (Name, Email, PhoneNumber, Role) VALUES (?, ?, ?, ?)';
  db.query(sql, [Name, Email, PhoneNumber, Role], (err, result) => {
    if (err) {
      console.error('Error adding user:', err);
      res.status(500).send('Error adding user');
    } else {
      res.status(201).send('User added successfully');
    }
  });
});

// READ all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM User', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    } else {
      res.json(results);
    }
  });
});

 
// ===================== LOST ITEM ROUTES ===================== //

// CREATE a lost item
app.post('/lostitems', (req, res) => {
  const { ItemName, Description, CategoryID, LostDate, LocationID, UserID } = req.body;
  const sql = `
    INSERT INTO LostItem (ItemName, Description, CategoryID, LostDate, LocationID, UserID)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [ItemName, Description, CategoryID, LostDate, LocationID, UserID], (err, result) => {
    if (err) {
      console.error('Error adding lost item:', err);
      res.status(500).send('Error adding lost item');
    } else {
      res.status(201).send('Lost item added successfully');
    }
  });
});

// READ all lost items
app.get('/lostitems', (req, res) => {
  db.query('SELECT * FROM LostItem', (err, results) => {
    if (err) {
      console.error('Error fetching lost items:', err);
      res.status(500).send('Error fetching lost items');
    } else {
      res.json(results);
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});