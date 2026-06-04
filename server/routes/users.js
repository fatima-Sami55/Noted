const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const avatarsStore = require('../database/avatars');
const foldersStore = require('../database/folders');
const emailService = require('../services/emailService');
const tokenHelper = require('../utils/tokenHelper');

// Helper to get User ID safely from req.user
const getReqUserId = (user) => {
  if (!user) return null;
  return user.userid || user.UserID || user.userID || user.id;
};

// GET /api/me - check auth status and return logged-in user details
router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const userId = getReqUserId(req.user);
    return res.json({
      id: userId,
      userid: userId,
      username: req.user.username,
      email: req.user.email,
      is_verified: req.user.is_verified === 1 || req.user.is_verified === true,
      avatar_style: req.user.avatar || 'avatar',
      avatar: req.user.avatar || 'avatar'
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// POST /api/register - Register new user (do not login, require email confirmation)
router.post('/register', (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Email validation check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Password complexity: min 8 characters, at least 1 number
  const passwordRegex = /^(?=.*[0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one number.' });
  }

  db.query('SELECT email FROM [user] WHERE email = ?', [email.trim()], (err, result) => {
    if (err) {
      console.error("❌ Error checking email:", err);
      return next(err);
    }

    if (result.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);
    const verifyToken = tokenHelper.generateToken() + '.' + Buffer.from(email.trim()).toString('hex');

    const newUser = {
      username: username.trim(),
      email: email.trim(),
      password: hash,
      is_verified: 0,
      verify_token: verifyToken,
      verify_token_at: new Date()
    };

    const sql = 'INSERT INTO [user] SET ?';
    db.query(sql, newUser, (err, rows) => {
      if (err) {
        console.error("❌ Error inserting user:", err);
        return next(err);
      }

      // Call verification email utility
      emailService.sendVerificationEmail(email.trim(), username.trim(), verifyToken)
        .then(() => {
          return res.status(201).json({ message: "Account created. Please verify your email." });
        })
        .catch(emailErr => {
          console.error("❌ Error sending verification email:", emailErr);
          // Rollback: delete the unverified user from the database so they can register again
          db.query('DELETE FROM [user] WHERE email = ?', [email.trim()], (deleteErr) => {
            if (deleteErr) {
              console.error("❌ Failed to rollback user database insertion:", deleteErr);
            }
            return res.status(500).json({ error: "Failed to send verification email. Account creation cancelled." });
          });
        });
    });
  });
});

// GET /api/verify-email?token= - Validate email verification link (idempotent)
router.get('/verify-email', (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  // 1. Try to find user by active token
  db.query('SELECT * FROM [user] WHERE verify_token = ?', [token], (err, rows) => {
    if (err) return next(err);

    if (rows.length === 0) {
      // 2. Token not found (already consumed). Try to decode email from token suffix
      let email = req.query.email || '';
      if (token.includes('.')) {
        try {
          const parts = token.split('.');
          email = Buffer.from(parts[1], 'hex').toString('utf8');
        } catch (e) {
          console.error("❌ Failed to decode email from token:", e);
        }
      }

      if (email && email.includes('@')) {
        db.query('SELECT is_verified FROM [user] WHERE email = ?', [email.trim()], (err2, rows2) => {
          if (err2) return next(err2);
          if (rows2.length > 0 && (rows2[0].is_verified === 1 || rows2[0].is_verified === true)) {
            return res.json({ message: 'Your email is already verified. You can log in.' });
          }
          return res.status(400).json({ error: 'Invalid verification link' });
        });
      } else {
        return res.status(400).json({ error: 'Invalid verification link' });
      }
      return;
    }

    const user = rows[0];

    if (tokenHelper.isTokenExpired(user.verify_token_at)) {
      return res.status(400).json({ error: 'Verification link has expired' });
    }

    db.query(
      'UPDATE [user] SET is_verified = 1, verify_token = NULL, verify_token_at = NULL WHERE userid = ?',
      [user.userid],
      (updateErr) => {
        if (updateErr) return next(updateErr);
        return res.json({ message: 'Email verified successfully!' });
      }
    );
  });
});

// POST /api/resend-verification - Resend verification email with throttle rate check
router.post('/resend-verification', (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  db.query('SELECT * FROM [user] WHERE email = ?', [email.trim()], (err, rows) => {
    if (err) return next(err);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    if (user.is_verified === 1 || user.is_verified === true) {
      return res.status(400).json({ error: 'Your email is already verified.' });
    }

    if (tokenHelper.isResendThrottled(user.verify_token_at, 2)) {
      return res.status(429).json({
        message: "A verification email was already sent recently.",
        resend_available_at: tokenHelper.getResendAvailableAt(user.verify_token_at, 2),
        already_sent: true
      });
    }

    const newToken = tokenHelper.generateToken() + '.' + Buffer.from(email.trim()).toString('hex');
    const userId = user.userid || user.UserID || user.userID || user.id;

    db.query(
      'UPDATE [user] SET verify_token = ?, verify_token_at = ? WHERE userid = ?',
      [newToken, new Date(), userId],
      (updateErr) => {
        if (updateErr) return next(updateErr);

        emailService.sendVerificationEmail(user.email, user.username, newToken)
          .then(() => {
            return res.json({ message: "Verification email sent." });
          })
          .catch(emailErr => {
            console.error("❌ Error resending verification email:", emailErr);
            return res.status(500).json({ error: 'Failed to send verification email.' });
          });
      }
    );
  });
});

// POST /api/login - Authenticate credentials and check verification state
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query("SELECT * FROM [user] WHERE email = ?", [email.trim()], (err, rows) => {
    if (err) return next(err);

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) return next(bcryptErr);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.is_verified === 0 || user.is_verified === false) {
        return res.status(403).json({
          message: "Please verify your email before logging in.",
          verified: false,
          email: user.email
        });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const userId = user.userid || user.UserID || user.userID || user.id;
        return res.json({
          message: 'Logged in',
          user: {
            id: userId,
            userid: userId,
            username: user.username,
            email: user.email,
            avatar_style: user.avatar || 'avatar',
            avatar: user.avatar || 'avatar'
          }
        });
      });
    });
  });
});

// POST /api/forgot-password - Trigger password reset link
router.post('/forgot-password', (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  db.query('SELECT * FROM [user] WHERE email = ?', [email.trim()], (err, rows) => {
    if (err) return next(err);

    // Silent handling of non-existing users to prevent account enumeration
    if (rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const user = rows[0];

    if (tokenHelper.isResendThrottled(user.reset_token_at, 2)) {
      return res.status(429).json({
        message: "A password reset email was already sent recently.",
        resend_available_at: tokenHelper.getResendAvailableAt(user.reset_token_at, 2),
        already_sent: true
      });
    }

    const resetToken = tokenHelper.generateToken();
    const userId = user.userid || user.UserID || user.userID || user.id;

    db.query(
      'UPDATE [user] SET reset_token = ?, reset_token_at = ? WHERE userid = ?',
      [resetToken, new Date(), userId],
      (updateErr) => {
        if (updateErr) return next(updateErr);

        emailService.sendPasswordResetEmail(user.email, user.username, resetToken)
          .then(() => {
            return res.json({ message: "If that email exists, a reset link has been sent." });
          })
          .catch(emailErr => {
            console.error("❌ Error sending password reset email:", emailErr);
            return res.status(500).json({ error: 'Failed to send password reset email.' });
          });
      }
    );
  });
});

// POST /api/reset-password - Verify reset token and apply new password
router.post('/reset-password', (req, res, next) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  db.query('SELECT * FROM [user] WHERE reset_token = ?', [token], (err, rows) => {
    if (err) return next(err);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const user = rows[0];

    if (tokenHelper.isTokenExpired(user.reset_token_at)) {
      return res.status(400).json({ error: 'Reset link has expired.' });
    }

    // Password validation: min 8 characters, at least 1 number
    const passwordRegex = /^(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one number.' });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(new_password, salt);
    const userId = user.userid || user.UserID || user.userID || user.id;

    db.query(
      'UPDATE [user] SET password = ?, reset_token = NULL, reset_token_at = NULL WHERE userid = ?',
      [hash, userId],
      (updateErr) => {
        if (updateErr) return next(updateErr);

        emailService.sendPasswordChangedEmail(user.email, user.username)
          .then(() => {
            return res.json({ message: "Password reset successfully. You can now log in." });
          })
          .catch(emailErr => {
            console.error("❌ Error sending password changed confirmation email:", emailErr);
            // Password is changed, so return success anyway
            return res.json({ message: "Password reset successfully. You can now log in." });
          });
      }
    );
  });
});

// GET /api/logout - End the user session
router.get('/logout', (req, res) => {
  try {
    req.logout(() => {}); // Match passport session cleanup
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: 'Could not log out' });
      }
      res.clearCookie('session'); // Clear cookie by name
      return res.json({ message: 'Logged out successfully.' });
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// PUT /api/me/avatar - Update user's avatar style selection
router.put('/me/avatar', (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    const { style } = req.body;
    if (!style) {
      return res.status(400).json({ error: 'Avatar style is required' });
    }
    const userId = getReqUserId(req.user);
    avatarsStore.setAvatar(userId, style, (err) => {
      if (err) return next(err);
      req.user.avatar = style;
      return res.json({
        success: true,
        message: 'Avatar updated successfully',
        avatar: style
      });
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// GET /api/folders - Get user's custom folders/lists
router.get('/folders', (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    const userId = getReqUserId(req.user);
    foldersStore.getFolders(userId, (err, folders) => {
      if (err) return next(err);
      return res.json(folders);
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// POST /api/folders - Create a new folder/list
router.post('/folders', (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const userId = getReqUserId(req.user);
    foldersStore.createFolder(userId, name.trim(), (err, result) => {
      if (err) return next(err);
      if (result.success) {
        return res.json(result.folders);
      } else {
        return res.status(400).json({ error: result.error });
      }
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// PUT /api/folders/:name/star - Toggle starred status of a folder
router.put('/folders/:name/star', (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    const { name } = req.params;
    const userId = getReqUserId(req.user);
    foldersStore.toggleStarFolder(userId, name, (err, result) => {
      if (err) return next(err);
      if (result.success) {
        return res.json(result.folders);
      } else {
        return res.status(404).json({ error: result.error });
      }
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// DELETE /api/folders/:name - Delete a custom folder
router.delete('/folders/:name', (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    const { name } = req.params;
    const userId = getReqUserId(req.user);
    foldersStore.deleteFolder(userId, name, (err, result) => {
      if (err) return next(err);
      if (result.success) {
        return res.json(result.folders);
      } else {
        return res.status(400).json({ error: result.error });
      }
    });
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
