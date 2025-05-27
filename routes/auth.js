// routes/auth.js
module.exports = db => {
  const express = require('express');
  const bcrypt  = require('bcrypt');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  // login
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admin_users WHERE username = ?', [username], (err, users) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });
      bcrypt.compare(password, users[0].password, (bErr, match) => {
        if (bErr) return res.status(500).json({ error: 'Auth error' });
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.adminId = users[0].admin_id;
        res.json({ success: true });
      });
    });
  });

  // change password
  router.post('/change-password', auth, (req, res) => {
    const { old_password, new_password } = req.body;
    if (new_password.length > 12)
      return res.status(400).json({ error: 'New password must not exceed 12 chars.' });
    if (!/\d/.test(new_password) || !/[^A-Za-z0-9]/.test(new_password))
      return res.status(400).json({ error: 'Must contain at least one digit & one special char.' });

    const adminId = req.session.adminId;
    db.query('SELECT password FROM admin_users WHERE admin_id = ?', [adminId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      bcrypt.compare(old_password, rows[0].password, (bErr, match) => {
        if (bErr) return res.status(500).json({ error: 'Auth error' });
        if (!match) return res.status(400).json({ error: 'Old password is incorrect.' });
        bcrypt.hash(new_password, 10, (hErr, hash) => {
          if (hErr) return res.status(500).json({ error: 'Hash error' });
          db.query(
            'UPDATE admin_users SET password = ? WHERE admin_id = ?',
            [hash, adminId],
            uErr => {
              if (uErr) return res.status(500).json({ error: 'Update failed' });
              res.json({ success: true });
            }
          );
        });
      });
    });
  });

  return router;
};
