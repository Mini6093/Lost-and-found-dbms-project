// routes/matches.js
module.exports = db => {
  const express = require('express');
  const router  = express.Router();

  function auth(req, res, next) {
    if (req.session && req.session.adminId) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  // create match
  router.post('/match', auth, (req, res) => {
    const { lost_item_id, found_item_id } = req.body;
    // ... same transaction logic you had ...
    // copy/paste exactly from your server.js
    // Validate statuses first
    db.query(
      `SELECT status FROM lost_items WHERE lost_item_id = ?`,
      [lost_item_id],
      (e1, lostRows) => {
        if (e1) return res.status(500).json({ error: 'DB error' });
        if (!lostRows.length) return res.status(404).json({ error: 'Lost item not found' });
        if (!['open','in_progress'].includes(lostRows[0].status)) {
          return res.status(400).json({ error: 'Lost item already matched/closed' });
        }
        db.query(
          `SELECT status FROM found_items WHERE found_item_id = ?`,
          [found_item_id],
          (e2, foundRows) => {
            if (e2) return res.status(500).json({ error: 'DB error' });
            if (!foundRows.length) return res.status(404).json({ error: 'Found item not found' });
            if (!['open','in_progress'].includes(foundRows[0].status)) {
              return res.status(400).json({ error: 'Found item already matched/closed' });
            }

            // Perform match & log history in one transaction
            db.beginTransaction(err => {
              if (err) return res.status(500).json({ error: 'Transaction error' });

              const insertMatch = 'INSERT INTO matches(lost_item_id, found_item_id) VALUES(?,?)';
              const updateLost  = 'UPDATE lost_items SET status="matched" WHERE lost_item_id=?';
              const updateFound = 'UPDATE found_items SET status="matched" WHERE found_item_id=?';
              const insertHist  = `
                INSERT INTO status_history(item_id,item_type,status,changed_by_admin_id)
                VALUES(?,?,?,?)
              `;

              db.query(insertMatch, [lost_item_id, found_item_id], e3 => {
                if (e3) return db.rollback(() => res.status(500).json({ error: 'Insert match failed' }));

                db.query(updateLost, [lost_item_id], e4 => {
                  if (e4) return db.rollback(() => res.status(500).json({ error: 'Update lost failed' }));

                  db.query(updateFound, [found_item_id], e5 => {
                    if (e5) return db.rollback(() => res.status(500).json({ error: 'Update found failed' }));

                    // log history: both items
                    db.query(insertHist, [lost_item_id, 'lost', 'matched', req.session.adminId], e6 => {
                      if (e6) return db.rollback(() => res.status(500).json({ error: 'History log failed (lost)' }));

                      db.query(insertHist, [found_item_id, 'found', 'matched', req.session.adminId], e7 => {
                        if (e7) return db.rollback(() => res.status(500).json({ error: 'History log failed (found)' }));

                        db.commit(cErr => {
                          if (cErr) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                          res.json({ success: true });
                        });
                      });
                    });
                  });
                });
              });
            });
          }
        );
      }
    );
  });

  // list matches
  router.get('/matches', auth, (req, res) => {
    const sql = `
      SELECT m.*,
             li.item_name AS lost_item,
             fi.item_name AS found_item
      FROM matches m
      LEFT JOIN lost_items li ON m.lost_item_id = li.lost_item_id
      LEFT JOIN found_items fi ON m.found_item_id = fi.found_item_id
      ORDER BY m.match_date DESC
    `;
    db.query(sql, (e, rows) => e ? res.status(500).json({ error: 'DB error' }) : res.json(rows));
  });

  // update resolution
  router.put('/match/:id/status', auth, (req, res) => {
    const { resolved_status } = req.body;
    const match_id = req.params.id;
    // ... your existing update+transaction logic ...
    //
      db.beginTransaction(err => {
      if (err) return res.status(500).json({ error: 'Transaction error' });

      const updMatch  = `UPDATE matches SET resolved_status=?, resolved_date=NOW() WHERE match_id=?`;
      const lookup    = `SELECT lost_item_id, found_item_id FROM matches WHERE match_id=?`;
      const newStatus = resolved_status === 'returned' ? 'closed_returned' : 'closed_unclaimed';
      const updLost   = `UPDATE lost_items  SET status=?, resolved_date=NOW() WHERE lost_item_id=?`;
      const updFound  = `UPDATE found_items SET status=?, resolved_date=NOW() WHERE found_item_id=?`;

      db.query(updMatch, [resolved_status, match_id], e1 => {
        if (e1) return db.rollback(() => res.status(500).json({ error: 'Update match failed' }));

        db.query(lookup, [match_id], (e2, rows) => {
          if (e2) return db.rollback(() => res.status(500).json({ error: 'Lookup failed' }));
          const { lost_item_id, found_item_id } = rows[0];

          db.query(updLost,  [newStatus, lost_item_id],  e3 => {
            if (e3) return db.rollback(() => res.status(500).json({ error: 'Update lost failed' }));

            db.query(updFound, [newStatus, found_item_id], e4 => {
              if (e4) return db.rollback(() => res.status(500).json({ error: 'Update found failed' }));

              // log history for both
              const histSql = `
                INSERT INTO status_history(item_id,item_type,status,changed_by_admin_id)
                VALUES(?,?,?,?)
              `;
              db.query(histSql, [lost_item_id, 'lost', newStatus, req.session.adminId], e5 => {
                if (e5) return db.rollback(() => res.status(500).json({ error: 'History log failed (lost)' }));
                db.query(histSql, [found_item_id,'found', newStatus, req.session.adminId], e6 => {
                  if (e6) return db.rollback(() => res.status(500).json({ error: 'History log failed (found)' }));
                  db.commit(cErr => {
                    if (cErr) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                    res.json({ success: true });
                  });
                });
              });
            });
          });
        });
      });
    });
    //
  });

  return router;
};
