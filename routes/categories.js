// routes/categories.js
module.exports = db => {
  const express = require('express');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  router.get('/',     auth, (req, res) => {
    db.query(
      'SELECT category_id, category_name, category_description FROM item_categories ORDER BY category_name',
      (err, rows) => err
        ? res.status(500).json({ error: 'DB error' })
        : res.json(rows)
    );
  });

  router.get('/:id',  auth, (req, res) => {
    db.query('SELECT * FROM item_categories WHERE category_id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    });
  });

  router.post('/',    auth, (req, res) => {
    const { category_name, category_description } = req.body;
    db.query(
      'INSERT INTO item_categories (category_name, category_description) VALUES (?, ?)',
      [category_name, category_description],
      (err, result) => err
        ? res.status(500).json({ error: 'Insert failed' })
        : res.json({ success: true, insertId: result.insertId })
    );
  });

  router.put('/:id',  auth, (req, res) => {
    const { category_name, category_description } = req.body;
    db.query(
      'UPDATE item_categories SET category_name = ?, category_description = ? WHERE category_id = ?',
      [category_name, category_description, req.params.id],
      err => err
        ? res.status(500).json({ error: 'Update failed' })
        : res.json({ success: true })
    );
  });

  return router;
};
