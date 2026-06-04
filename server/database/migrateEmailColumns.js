const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.USER ? process.env.USER.trim() : '',
  password: process.env.PASSWORD ? process.env.PASSWORD.trim() : '',
  server: process.env.HOST ? process.env.HOST.trim() : '',
  database: process.env.DATABASE ? process.env.DATABASE.trim() : '',
  port: parseInt(process.env.DB_PORT ? process.env.DB_PORT.trim() : '1433'),
  options: {
    encrypt: true, // required for Azure SQL
    trustServerCertificate: false
  }
};

console.log("Connecting to SQL Server for email columns migration:", config.server);

async function runMigration() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Connected to Azure SQL Database");

    // Check if columns already exist to avoid errors
    const checkQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user' AND COLUMN_NAME IN ('is_verified', 'verify_token', 'verify_token_at', 'reset_token', 'reset_token_at')
    `;
    const checkResult = await pool.request().query(checkQuery);
    const existingColumns = checkResult.recordset.map(r => r.COLUMN_NAME.toLowerCase());

    console.log("Existing columns in table [user]:", existingColumns);

    const alterQueries = [];
    if (!existingColumns.includes('is_verified')) {
      alterQueries.push("ALTER TABLE [user] ADD is_verified BIT NOT NULL DEFAULT 0;");
    }
    if (!existingColumns.includes('verify_token')) {
      alterQueries.push("ALTER TABLE [user] ADD verify_token NVARCHAR(255) NULL;");
    }
    if (!existingColumns.includes('verify_token_at')) {
      alterQueries.push("ALTER TABLE [user] ADD verify_token_at DATETIME NULL;");
    }
    if (!existingColumns.includes('reset_token')) {
      alterQueries.push("ALTER TABLE [user] ADD reset_token NVARCHAR(255) NULL;");
    }
    if (!existingColumns.includes('reset_token_at')) {
      alterQueries.push("ALTER TABLE [user] ADD reset_token_at DATETIME NULL;");
    }

    if (alterQueries.length > 0) {
      console.log("Executing schema updates...");
      for (const query of alterQueries) {
        console.log(`Running: ${query}`);
        await pool.request().query(query);
      }
      console.log("✅ Database schema updated successfully with email columns.");
    } else {
      console.log("ℹ️ Email verification and reset columns already exist. No migration needed.");
    }

    await sql.close();
  } catch (err) {
    console.error("❌ Schema migration failed:", err);
    process.exit(1);
  }
}

runMigration();
