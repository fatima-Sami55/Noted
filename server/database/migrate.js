const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.USER ? process.env.USER.trim() : '',
  password: process.env.PASSWORD,
  server: process.env.HOST,
  database: process.env.DATABASE,
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true, // required for Azure SQL
    trustServerCertificate: false
  }
};

console.log("Connecting to SQL Server:", config.server);

const schemaQueries = [
  // 1. user table
  `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user]') AND type in (N'U'))
   BEGIN
       CREATE TABLE [dbo].[user] (
           [userid] INT IDENTITY(1,1) PRIMARY KEY,
           [username] NVARCHAR(255) NOT NULL,
           [email] NVARCHAR(255) NOT NULL UNIQUE,
           [password] NVARCHAR(255) NOT NULL
       );
       PRINT 'Table [user] created successfully.';
   END
   ELSE
   BEGIN
       PRINT 'Table [user] already exists.';
   END`,

  // 2. note table
  `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[note]') AND type in (N'U'))
   BEGIN
       CREATE TABLE [dbo].[note] (
           [noteid] INT IDENTITY(1,1) PRIMARY KEY,
           [heading] NVARCHAR(255) NOT NULL,
           [body] NVARCHAR(MAX),
           [authorID] INT,
           [color] NVARCHAR(50) DEFAULT '#ffffff',
           [style] NVARCHAR(255),
           FOREIGN KEY ([authorID]) REFERENCES [dbo].[user]([userid]) ON DELETE CASCADE
       );
       PRINT 'Table [note] created successfully.';
   END
   ELSE
   BEGIN
       PRINT 'Table [note] already exists.';
   END`,

  // 3. sessions table
  `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND type in (N'U'))
   BEGIN
       CREATE TABLE [dbo].[sessions] (
           [sid] VARCHAR(255) NOT NULL PRIMARY KEY,
           [session] NVARCHAR(MAX) NOT NULL,
           [expires] DATETIME NOT NULL
       );
       PRINT 'Table [sessions] created successfully.';
   END
   ELSE
   BEGIN
       PRINT 'Table [sessions] already exists.';
   END`
];

async function runMigration() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Successfully connected to Azure SQL Database");

    for (const query of schemaQueries) {
      const result = await pool.request().query(query);
      console.log(result.output); // logs any PRINT output from T-SQL
    }

    console.log("✅ Database schema migration complete.");
    await sql.close();
  } catch (err) {
    console.error("❌ Database migration failed:", err);
    process.exit(1);
  }
}

runMigration();
