const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor } = require('../middleware');

// GET /api/notes - Get all notes for the logged-in user
router.get('/', isLoggedIn, (req, res) => {
  const sql = 'SELECT * FROM [note] WHERE authorID = ?';
  db.query(sql, [req.user.userid], (err, rows) => {
    if (err) {
      console.error("❌ Error loading notes:", err);
      return res.status(500).json({ error: "Database error" });
    }
    // Return rows as-is
    res.json(rows);
  });
});

// GET /api/notes/:id - Get a specific note
router.get('/:id', isLoggedIn, (req, res) => {
  const noteId = parseInt(req.params.id);
  if (isNaN(noteId) || noteId > 2147483647 || noteId < -2147483648) {
    return res.status(404).json({ error: 'Note not found' });
  }
  const sql = 'SELECT * FROM [note] WHERE noteid = ?';
  db.query(sql, [noteId], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching note:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (rows[0].authorID !== req.user.userid) {
      return res.status(403).json({ error: 'You do not have permission to view this note!' });
    }
    res.json(rows[0]);
  });
});

// POST /api/notes - Create a new note
router.post('/', isLoggedIn, (req, res) => {
  const bodyContent = typeof req.body.body === 'object' ? JSON.stringify(req.body.body) : req.body.body;
  
  const note = {
    heading: req.body.heading || 'Untitled Note',
    body: bodyContent || '{}',
    authorID: req.user.userid,
    color: req.body.color || '#ffffff',
    style: req.body.style || ''
  };

  const sql = 'INSERT INTO [note] SET ?';
  db.query(sql, note, (err, rows) => {
    if (err) {
      console.error("❌ Error inserting note:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Retrieve the newly inserted note to get the generated noteid
    db.query('SELECT * FROM [note] WHERE authorID = ? ORDER BY noteid DESC', [req.user.userid], (err, selectRows) => {
      if (err || !selectRows.length) {
        return res.json({ success: true, message: 'Successfully created a new Note!', note });
      }
      res.json({ 
        success: true, 
        message: 'Successfully created a new Note!', 
        note: selectRows[0] 
      });
    });
  });
});

// PUT /api/notes/:id - Update an existing note
router.put('/:id', isLoggedIn, isAuthor, (req, res) => {
  const noteId = parseInt(req.params.id);
  const bodyContent = typeof req.body.body === 'object' ? JSON.stringify(req.body.body) : req.body.body;
  
  const note = {
    heading: req.body.heading || 'Untitled Note',
    body: bodyContent || '{}',
    authorID: req.user.userid,
    color: req.body.color || '#ffffff',
    style: req.body.style || ''
  };

  const sql = 'UPDATE [note] SET ? WHERE noteid = ?';
  db.query(sql, [note, noteId], (err, result) => {
    if (err) {
      console.error("❌ Error updating note:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: 'Successfully updated the Note!', note: { ...note, noteid: noteId } });
  });
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', isLoggedIn, isAuthor, (req, res) => {
  const noteId = parseInt(req.params.id);
  const sql = 'DELETE FROM [note] WHERE noteid = ?';
  db.query(sql, [noteId], (err, result) => {
    if (err) {
      console.error("❌ Error deleting note:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: 'Successfully deleted the Note!' });
  });
});

module.exports = router;
