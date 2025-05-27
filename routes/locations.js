// routes/locations.js
module.exports = db => {
  const express = require('express');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  router.get('/',     auth, (req, res) => {
    db.query(
      'SELECT location_id, location_name, location_details FROM locations ORDER BY location_name',
      (err, rows) => err
        ? res.status(500).json({ error: 'DB error' })
        : res.json(rows)
    );
  });

  router.get('/:id',  auth, (req, res) => {
    db.query('SELECT * FROM locations WHERE location_id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    });
  });

  router.post('/',    auth, (req, res) => {
    const { location_name, location_details } = req.body;
    db.query(
      'INSERT INTO locations (location_name, location_details) VALUES (?, ?)',
      [location_name, location_details],
      (err, result) => err
        ? res.status(500).json({ error: 'Insert failed' })
        : res.json({ success: true, insertId: result.insertId })
    );
  });

  router.put('/:id',  auth, (req, res) => {
    const { location_name, location_details } = req.body;
    db.query(
      'UPDATE locations SET location_name = ?, location_details = ? WHERE location_id = ?',
      [location_name, location_details, req.params.id],
      err => err
        ? res.status(500).json({ error: 'Update failed' })
        : res.json({ success: true })
    );
  });

  return router;
};
