# Noted - Rich Note-Taking Platform

Noted is a modern, premium card-based note-taking application designed for seamless digital organization. Built with a rich React frontend and a secure Node.js REST API backend, the platform supports custom checklists, sticker badges, dynamic color palettes, and calendar reminders. 

---

## Technology Stack

| Layer | Technology | Key Service / Feature |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 | Hot Module Replacement (HMR), Lucide Icons |
| **Backend** | Node.js, Express | RESTful JSON API, MVC routing, Structured controllers |
| **Database** | Microsoft SQL Server (T-SQL) | Connection pooling, session state persistency |
| **Authentication** | Passport.js, Bcryptjs | Session-based authentication, Salted password hashes |
| **Email/SMTP** | Nodemailer, Brevo | Account confirmation emails, secure password resets |
| **Security** | Helmet, Express Rate Limit | XSS mitigation, secure cookies, brute-force throttling |

---

## Repository Structure

```tree
noteapp-main/
├── client/                 # React Frontend Application (Vite dev server)
│   ├── public/             # Static assets (illustrations, avatars, favicon)
│   ├── src/
│   │   ├── components/     # Reusable UI widgets (NoteEditor, Sidebar, etc.)
│   │   ├── pages/          # Full-view layout routing (Login, ForgotPassword)
│   │   ├── App.jsx         # App container and state management
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js      # Dev server port & API proxy setup
└── server/                 # Express Backend API Server
    ├── database/           # DB connection pools, migrations and cache stores
    ├── routes/             # Express API endpoints
    ├── services/           # Nodemailer integration
    ├── templates/          # Email transactional HTML templates
    ├── utils/              # Expiry token helpers
    ├── middleware.js       # Authentication and authorization guards
    ├── app.js              # Application entry, middleware stacks and server initialization
    └── package.json
```

---

## Production & Security Standards

The application has been refined to follow industry-standard security checklist requirements:
1. **SQL Injection Protection**: Fully parameterized queries for authorization checks and user note manipulation.
2. **Brute-Force & Abuse Mitigation**: Throttling configured via `express-rate-limit` on endpoints such as login, signup, password-reset, and email verification.
3. **HTTP Header Security**: Hardened headers set via `helmet` (Disables content type sniffing, enforces XSS protection, restricts frame embedding).
4. **Secure Sessions**: Enforced `httpOnly`, `secure: true` (requires HTTPS), and `sameSite: 'none'` (facilitates cross-origin cookies) configurations when `NODE_ENV=production`.
5. **No Data Leakage**: Standard Express error handlers are overridden in production to return generic messages and keep raw stack traces or database details redacted from logs sent to client.
6. **Strict Validation**: Registration validation checking syntax formatting on emails and password strength complexity.

---

## Environment Configuration

Create a `.env` file in the `server` directory using the following keys:

```env
# Database Credentials (MS SQL/Azure SQL Server)
HOST=your-azure-db.database.windows.net
USER=your_db_user
PASSWORD=your_db_password
DATABASE=Noted
DB_PORT=1433

# Application Port
PORT=3000

# Express Session Encryption Key
SESSION_SECRET=your_complex_session_secret_key

# Brevo SMTP Configuration
SMTP_SERVER=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_LOGIN=your_brevo_smtp_login
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@yourdomain.com

# Client and Token Expirations
CLIENT_URL=http://localhost:5173
TOKEN_EXPIRY_HOURS=16
```

---

## Setup & Local Execution

Follow these steps to run both the frontend and backend in your local environment.

### 1. Database Migrations
Make sure you have Microsoft SQL Server running. Run the following migrations inside the `server/` directory to create the tables and alter email/token columns:

```bash
cd server
npm install
node database/migrate.js
node database/migrateEmailColumns.js
```

### 2. Run Backend API
With dependencies installed and migrations complete, start the Nodemon dev server:

```bash
npm run dev
```
The server will boot up on `http://localhost:3000`.

### 3. Run Frontend Client
Open a new terminal window, navigate to the `client/` folder, install packages and start the Vite development server:

```bash
cd client
npm install
npm run dev
```
The client will open up on `http://localhost:5173`. Vite is preconfigured to proxy all `/api/*` fetch requests directly to the backend port.

---

## Deployment Build

To build the client bundle for production deployment, run:

```bash
cd client
npm run build
```
This generates a flat static directory inside `client/dist/` ready to be served from any CDN or static hosting platform.
