const express      = require('express');
const session      = require('express-session');
const bodyParser   = require('body-parser');
const mysql        = require('mysql2');
const path         = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mini6093',           // your MySQL pw
  database: 'lost_and_found2'
});
db.connect(err => {
  if (err) console.error('DB connection error:', err);
  else console.log('Connected to MySQL');
});

// --- mount each router ---
app.use('/api',              require('./routes/auth')(db));
app.use('/api/locations',    require('./routes/locations')(db));
app.use('/api/categories',   require('./routes/categories')(db));
app.use('/api/lost',         require('./routes/lost')(db));
app.use('/api/found',        require('./routes/found')(db));
app.use('/api',              require('./routes/matches')(db));
app.use('/api/history',      require('./routes/history')(db));

// catch-all error handler (unchanged)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
