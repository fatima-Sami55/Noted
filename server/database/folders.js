const db = require('./db');

const DEFAULT_FOLDERS = [
  { name: 'Personal', starred: true },
  { name: 'Ideas', starred: true },
  { name: 'Tasks', starred: false }
];

function getFolders(userId, callback) {
  db.query('SELECT name, starred FROM [folder] WHERE userid = ?', [userId], (err, rows) => {
    if (err) return callback(err);
    if (rows.length === 0) {
      // User has no folders yet, let's insert defaults!
      const insertSql = 'INSERT INTO [folder] (userid, name, starred) VALUES (?, ?, 1), (?, ?, 1), (?, ?, 0)';
      const params = [userId, 'Personal', userId, 'Ideas', userId, 'Tasks'];
      db.query(insertSql, params, (err2) => {
        if (err2) return callback(err2);
        // Query again to return
        db.query('SELECT name, starred FROM [folder] WHERE userid = ?', [userId], (err3, rows3) => {
          if (err3) return callback(err3);
          const result = rows3.map(r => ({ name: r.name, starred: r.starred === 1 || r.starred === true }));
          callback(null, result);
        });
      });
    } else {
      const result = rows.map(r => ({ name: r.name, starred: r.starred === 1 || r.starred === true }));
      callback(null, result);
    }
  });
}

module.exports = {
  getFolders,
  
  createFolder(userId, name, callback) {
    // Prevent duplicate folder names (case-insensitive)
    db.query('SELECT name FROM [folder] WHERE userid = ? AND LOWER(name) = ?', [userId, name.toLowerCase()], (err, rows) => {
      if (err) return callback(err);
      if (rows.length > 0) {
        return callback(null, { success: false, error: 'Folder already exists' });
      }
      db.query('INSERT INTO [folder] (userid, name, starred) VALUES (?, ?, 0)', [userId, name], (err2) => {
        if (err2) return callback(err2);
        getFolders(userId, (err3, folders) => {
          if (err3) return callback(err3);
          callback(null, { success: true, folders });
        });
      });
    });
  },

  toggleStarFolder(userId, name, callback) {
    const sql = 'UPDATE [folder] SET starred = CASE WHEN starred = 1 THEN 0 ELSE 1 END WHERE userid = ? AND LOWER(name) = ?';
    db.query(sql, [userId, name.toLowerCase()], (err) => {
      if (err) return callback(err);
      getFolders(userId, (err2, folders) => {
        if (err2) return callback(err2);
        callback(null, { success: true, folders });
      });
    });
  },

  deleteFolder(userId, name, callback) {
    // Don't allow deleting default folders
    const isDefault = DEFAULT_FOLDERS.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (isDefault) {
      return callback(null, { success: false, error: 'Cannot delete default folders' });
    }
    
    db.query('DELETE FROM [folder] WHERE userid = ? AND LOWER(name) = ?', [userId, name.toLowerCase()], (err) => {
      if (err) return callback(err);
      
      // Clean up notes referencing this folder style
      db.query("UPDATE [note] SET style = '' WHERE authorID = ? AND LOWER(style) = ?", [userId, name.toLowerCase()], (err2) => {
        if (err2) console.error("❌ Failed to clean note styles for deleted folder:", err2);
        
        getFolders(userId, (err3, folders) => {
          if (err3) return callback(err3);
          callback(null, { success: true, folders });
        });
      });
    });
  }
};
