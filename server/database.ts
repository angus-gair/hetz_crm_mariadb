import mysql from 'mysql2/promise';
import { config } from './config';

// Create the connection pool
const pool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  port: config.mysql.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database connection
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database at', config.mysql.host);

    // Check for recent consultation records
    const checkRecords = async () => {
      const sql = `
        SELECT * FROM contacts 
        WHERE date_entered >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY date_entered DESC 
        LIMIT 5;
      `;
      try {
        const records = await query(sql);
        console.log('Recent consultation records:', JSON.stringify(records, null, 2));
      } catch (err) {
        console.error('Error checking consultation records:', err);
      }
    };

    await checkRecords();
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
    throw error;
  }
}

export default pool;