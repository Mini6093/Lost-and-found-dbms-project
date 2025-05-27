// routes/history.js
module.exports = db => {
  const express = require('express');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  router.get('/', auth, (req, res) => {
    const sql = `
      SELECT sh.*, au.username
      FROM status_history sh
      LEFT JOIN admin_users au ON sh.changed_by_admin_id = au.admin_id
      ORDER BY sh.change_date DESC
    `;
    db.query(sql, (e, rows) => e ? res.status(500).json({ error: 'DB error' }) : res.json(rows));
  });

  return router;
};
