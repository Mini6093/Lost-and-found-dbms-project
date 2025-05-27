// routes/lost.js
module.exports = db => {
  const express = require('express');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  // all
  router.get('/all',  auth, (req, res) => {
    const sql = `
      SELECT li.*, ic.category_name, l.location_name AS lost_location
      FROM lost_items li
      LEFT JOIN item_categories ic ON li.category_id = ic.category_id
      LEFT JOIN locations l ON li.lost_location_id = l.location_id
      ORDER BY li.lost_item_id DESC
    `;
    db.query(sql, (e, rows) => e ? res.status(500).json({ error: 'DB error' }) : res.json(rows));
  });

  // open
  router.get('/open', auth, (req, res) => {
    const sql = `
      SELECT li.*, ic.category_name, l.location_name AS lost_location
      FROM lost_items li
      LEFT JOIN item_categories ic ON li.category_id = ic.category_id
      LEFT JOIN locations l ON li.lost_location_id = l.location_id
      WHERE li.status IN ('open','in_progress')
      ORDER BY li.lost_item_id DESC
    `;
    db.query(sql, (e, rows) => e ? res.status(500).json({ error: 'DB error' }) : res.json(rows));
  });

  // get one
  router.get('/:id',  auth, (req, res) => {
    db.query('SELECT * FROM lost_items WHERE lost_item_id = ?', [req.params.id], (e, rows) => {
      if (e) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    });
  });

  // create
  router.post('/',    auth, (req, res) => {
    const d = req.body;
    db.query(
      `INSERT INTO lost_items
        (reporter_name, reporter_contact, item_name, item_description, lost_date,
         lost_location_id, category_id, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        d.reporter_name,
        d.reporter_contact,
        d.item_name,
        d.item_description,
        d.lost_date,
        d.lost_location_id,
        d.category_id || null,
        d.notes
      ],
      (e, result) => e
        ? res.status(500).json({ error: 'Insert failed' })
        : res.json({ success: true, insertId: result.insertId })
    );
  });

  // update
  router.put('/:id',  auth, (req, res) => {
    const id = req.params.id, data = req.body;
    const fields = Object.keys(data).map(f => `${f}=?`).join(',');
    const vals   = [...Object.values(data), id];
    db.query(`UPDATE lost_items SET ${fields} WHERE lost_item_id = ?`, vals, e => {
      if (e) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    });
  });

  // delete
  router.delete('/:id', auth, (req, res) => {
    db.query('SELECT status FROM lost_items WHERE lost_item_id = ?', [req.params.id], (e, rows) => {
      if (e) return res.status(500).json({ error: 'DB error' });
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      if (!['open','in_progress'].includes(rows[0].status))
        return res.status(400).json({ error: `Cannot delete item with status '${rows[0].status}'` });

      db.query('DELETE FROM lost_items WHERE lost_item_id = ?', [req.params.id], e2 => {
        if (e2) return res.status(500).json({ error: 'Delete failed' });
        res.json({ success: true });
      });
    });
  });

  return router;
};
