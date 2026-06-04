// Middleware for authentication and authorization checks

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const noteId = req.params.id;
  const sql = "SELECT * FROM [note] WHERE noteid = ?";
  
  global.db.query(sql, [noteId], (err, rows) => {
    if (err) {
      console.error("❌ Middleware authorization error:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Check if the note author matches the authenticated user ID
    const authorId = rows[0].authorID;
    const userId = req.user.userid || req.user.UserID || req.user.userID || req.user.id;
    
    if (authorId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to access this note!' });
    }
    
    next();
  });
};
