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

console.log("Connecting to SQL Server for folder and avatar migration:", config.server);

async function runMigration() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Connected to Azure SQL Database");

    // 1. Check if avatar column exists in user table
    const checkAvatarQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user' AND COLUMN_NAME = 'avatar'
    `;
    const checkAvatarResult = await pool.request().query(checkAvatarQuery);
    if (checkAvatarResult.recordset.length === 0) {
      console.log("Adding [avatar] column to table [user]...");
      const addAvatarQuery = "ALTER TABLE [user] ADD avatar NVARCHAR(255) NOT NULL DEFAULT 'avatar';";
      await pool.request().query(addAvatarQuery);
      console.log("✅ [avatar] column added successfully.");
    } else {
      console.log("ℹ️ [avatar] column already exists in table [user].");
    }

    // 2. Create folder table if it does not exist
    const createFolderQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[folder]') AND type in (N'U'))
      BEGIN
          CREATE TABLE [dbo].[folder] (
              [folderid] INT IDENTITY(1,1) PRIMARY KEY,
              [userid] INT NOT NULL,
              [name] NVARCHAR(255) NOT NULL,
              [starred] BIT NOT NULL DEFAULT 0,
              FOREIGN KEY ([userid]) REFERENCES [dbo].[user]([userid]) ON DELETE CASCADE,
              UNIQUE ([userid], [name])
          );
          PRINT 'Table [folder] created successfully.';
      END
      ELSE
      BEGIN
          PRINT 'Table [folder] already exists.';
      END
    `;
    const createFolderResult = await pool.request().query(createFolderQuery);
    console.log("✅ Folder table check/creation completed.");

    await sql.close();
    console.log("✅ Schema migration complete.");
  } catch (err) {
    console.error("❌ Schema migration failed:", err);
    process.exit(1);
  }
}

runMigration();
