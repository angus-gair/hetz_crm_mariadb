const url = require('url');

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const dbUser = dbUrl.username;
const dbPassword = decodeURIComponent(dbUrl.password);
const dbHost = dbUrl.hostname;
const dbPort = dbUrl.port;
const dbName = dbUrl.pathname.slice(1);

console.log(`
Database Configuration:
Host: ${dbHost}
Port: ${dbPort}
Database: ${dbName}
User: ${dbUser}
`);
