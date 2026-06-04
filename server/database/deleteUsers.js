const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  user: process.env.USER ? process.env.USER.trim() : '',
  password: process.env.PASSWORD ? process.env.PASSWORD.trim() : '',
  server: process.env.HOST ? process.env.HOST.trim() : '',
  database: process.env.DATABASE ? process.env.DATABASE.trim() : '',
  port: parseInt(process.env.DB_PORT ? process.env.DB_PORT.trim() : '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function cleanDatabase() {
  try {
    console.log("Connecting to SQL Server to wipe database:", config.server);
    const pool = await sql.connect(config);
    console.log("✅ Connected to Azure SQL Database");

    // 1. Wipe sessions
    try {
      const resSessions = await pool.request().query("DELETE FROM [sessions]");
      console.log(`✅ Successfully deleted sessions. Rows affected: ${resSessions.rowsAffected[0]}`);
    } catch (e) {
      console.log("⚠️ Sessions table query failed or didn't exist (skipping):", e.message);
    }

    // 2. Wipe users (which cascades and deletes all notes due to ON DELETE CASCADE)
    const resUsers = await pool.request().query("DELETE FROM [user]");
    console.log(`✅ Successfully deleted all users (and notes). Rows affected: ${resUsers.rowsAffected[0]}`);

    await sql.close();

    // 3. Clear folders JSON store
    const foldersPath = path.join(__dirname, 'folders.json');
    if (fs.existsSync(foldersPath)) {
      fs.writeFileSync(foldersPath, '{}', 'utf8');
      console.log("✅ Successfully cleared folders.json local file");
    }

    console.log("🎉 Database and local cache successfully cleaned up!");
  } catch (err) {
    console.error("❌ Failed to clean database:", err);
    process.exit(1);
  }
}

cleanDatabase();
