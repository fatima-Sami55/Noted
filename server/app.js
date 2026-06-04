if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

global.db = require('./database/db');
const note = require('./routes/notes');
const user = require('./routes/users');
const port = process.env.PORT || 3000; // Change default backend port to 3000

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Express Trust Proxy settings for secure cookies in production (behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Rate Limiter for Authentication and Sensitive Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15-minute window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/forgot-password', authLimiter);
app.use('/api/resend-verification', authLimiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS Middleware to support React client with credentials
app.use((req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', clientUrl);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configure Session Store for MSSQL
const sessionStore = new MSSQLStore({
  user: process.env.USER ? process.env.USER.trim() : '',
  password: process.env.PASSWORD ? process.env.PASSWORD.trim() : '',
  server: process.env.HOST ? process.env.HOST.trim() : '',
  database: process.env.DATABASE ? process.env.DATABASE.trim() : '',
  port: parseInt(process.env.DB_PORT ? process.env.DB_PORT.trim() : '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
}, {
  table: 'sessions'
});

const isProduction = process.env.NODE_ENV === 'production';
const sessionConfig = {
  name: 'session',
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  proxy: isProduction
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Local authentication strategy for Passport.js
passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
},
  function (req, username, password, done) {
    db.query("SELECT * FROM [user] WHERE username = ?", [username], function (err, rows) {
      if (err) return done(err);

      if (!rows.length) {
        return done(null, false, { message: 'No user found with that username.' });
      }

      const user = rows[0];

      bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) return done(err);

        if (!isMatch) {
          return done(null, false, { message: 'Oops! Wrong password.' });
        }

        return done(null, user);
      });
    });
  }
));

// Serialize the user's ID into the session
passport.serializeUser(function (user, done) {
  done(null, user.userid);
});

// Deserialize user from ID stored in session
passport.deserializeUser(function (user_id, done) {
  db.query('SELECT * FROM [user] WHERE userid = ?', [user_id], function (err, rows) {
    if (err) return done(err);
    done(null, rows[0]);
  });
});

// JSON API Route Prefixes
app.use('/api/notes', note);
app.use('/api', user);

// Fallback 404 Route for API
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ error: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error') });
});

app.listen(port, () => {
  console.log(`🚀 Notes API server listening on port ${port}`);
});
