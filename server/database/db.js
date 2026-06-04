require('dotenv').config();
const sql = require('mssql');

// Trim values in case of trailing spaces in the .env file
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

console.log("Initializing MSSQL Connection Pool");

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('❌ MSSQL connection pool error:', err.message);
});

// A query wrapper to translate MySQL dialect query patterns to MSSQL (T-SQL)
function queryWrapper(sqlQuery, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  if (!params) {
    params = [];
  }

  // Ensure params is an array
  if (!Array.isArray(params)) {
    params = [params];
  }

  poolConnect.then(async () => {
    try {
      const request = pool.request();
      let processedSql = sqlQuery;

      // 1. Escape reserved words in MSSQL (if not already escaped)
      processedSql = processedSql
        .replace(/(?<!\[)\buser\b(?!\])/gi, '[user]')
        .replace(/(?<!\[)\bnote\b(?!\])/gi, '[note]');

      // 2. Translate MySQL-specific SET ? inserts/updates
      // Update syntax: UPDATE table SET ? WHERE ...
      if (/\bSET\s+\?\s+WHERE\b/i.test(processedSql)) {
        const dataObj = params[0];
        if (dataObj && typeof dataObj === 'object') {
          const keys = Object.keys(dataObj);
          const setClauses = keys.map(k => `[${k}] = @upd_${k}`).join(', ');

          keys.forEach(k => {
            request.input(`upd_${k}`, dataObj[k]);
          });

          processedSql = processedSql.replace(/\bSET\s+\?/i, `SET ${setClauses}`);

          // Handle the rest of parameters for the WHERE clause
          const whereParams = params.slice(1);
          let paramCounter = 0;
          processedSql = processedSql.replace(/\?/g, () => {
            const paramName = `where_p${paramCounter}`;
            request.input(paramName, whereParams[paramCounter]);
            paramCounter++;
            return `@${paramName}`;
          });
        }
      } 
      // Insert syntax: INSERT INTO table SET ?
      else if (/\bSET\s+\?/i.test(processedSql)) {
        const dataObj = params[0];
        if (dataObj && typeof dataObj === 'object') {
          const keys = Object.keys(dataObj);
          const insertCols = keys.map(k => `[${k}]`).join(', ');
          const paramNames = keys.map(k => `@ins_${k}`);

          keys.forEach(k => {
            request.input(`ins_${k}`, dataObj[k]);
          });

          processedSql = processedSql.replace(/\bSET\s+\?/i, `(${insertCols}) VALUES (${paramNames.join(', ')})`);
        }
      } 
      // 3. Translate standard question mark (?) placeholders to MSSQL @p0, @p1, ...
      else {
        let paramCounter = 0;
        processedSql = processedSql.replace(/\?/g, () => {
          const paramName = `p${paramCounter}`;
          request.input(paramName, params[paramCounter]);
          paramCounter++;
          return `@${paramName}`;
        });
      }

      // Execute query
      const result = await request.query(processedSql);
      
      // Invoke callback returning recordset to match MySQL driver output format
      callback(null, result.recordset || []);
    } catch (err) {
      console.error("❌ SQL Server query execution error:", err.message);
      console.error("Statement was:", sqlQuery);
      callback(err);
    }
  }).catch(err => {
    console.error("❌ Failed to connect to SQL Server pool:", err.message);
    callback(err);
  });
}

// Connect immediately on startup to verify configuration and log success/error
poolConnect.then(() => {
  console.log("✅ MSSQL Connected");
}).catch(err => {
  console.error("❌ Failed to connect to MSSQL Database:", err.message);
  process.exit(1);
});

module.exports = {
  query: queryWrapper,
  connect: (cb) => {
    poolConnect.then(() => {
      if (cb) cb(null);
    }).catch(err => {
      if (cb) cb(err);
    });
  }
};
