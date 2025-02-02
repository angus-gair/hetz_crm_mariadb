import mysql from 'mysql2/promise';
import { config } from './config';
import pool from '../server/database';
import { query } from '../server/database';
import { User, QueryResult } from './schema';

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

// Database operations
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database at', config.mysql.host);

    // Check for recent consultation records
    const checkRecords = async () => {
      // Query using SuiteCRM's actual schema
      const sql = `
        SELECT 
          c.id,
          c.date_entered,
          c.first_name,
          c.last_name,
          ea.email_address,
          c.phone_work,
          c.phone_mobile,
          c.description,
          m.name as meeting_name,
          m.date_start as meeting_date
        FROM contacts c
        LEFT JOIN email_addr_bean_rel ear ON c.id = ear.bean_id AND ear.bean_module = 'Contacts' AND ear.deleted = 0
        LEFT JOIN email_addresses ea ON ea.id = ear.email_address_id
        LEFT JOIN meetings_contacts mc ON c.id = mc.contact_id AND mc.deleted = 0
        LEFT JOIN meetings m ON m.id = mc.meeting_id AND m.deleted = 0
        WHERE c.deleted = 0 
        AND c.date_entered >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY c.date_entered DESC 
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