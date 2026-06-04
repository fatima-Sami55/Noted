const db = require('./db');

module.exports = {
  getAvatar(userId, callback) {
    db.query('SELECT avatar FROM [user] WHERE userid = ?', [userId], (err, rows) => {
      if (err) return callback(err);
      if (rows.length === 0 || !rows[0].avatar) {
        return callback(null, 'avatar'); // Default avatar style fallback
      }
      callback(null, rows[0].avatar);
    });
  },
  
  setAvatar(userId, style, callback) {
    db.query('UPDATE [user] SET avatar = ? WHERE userid = ?', [style, userId], (err) => {
      if (err) return callback(err);
      if (callback) callback(null, true);
    });
  }
};
