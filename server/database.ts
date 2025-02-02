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

// Format date for MySQL
function formatDate(isoDate: string): string {
  return isoDate.split('T')[0];
}

// Format time for MySQL
function formatTime(isoDate: string): string {
  return isoDate.split('T')[1].split('.')[0];
}

// Save consultation data locally
export async function saveConsultation(consultationData: {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}) {
  const sql = `
    INSERT INTO consultations 
    (name, email, phone, notes, preferred_date, preferred_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    // Format the date and time properly for MySQL
    const formattedDate = consultationData.preferredDate ? formatDate(consultationData.preferredDate) : null;
    const formattedTime = consultationData.preferredTime || null;

    const result = await query<any>(sql, [
      consultationData.name,
      consultationData.email,
      consultationData.phone,
      consultationData.notes || null,
      formattedDate,
      formattedTime
    ]);

    console.log('Consultation saved locally:', result);
    return result.insertId;
  } catch (error) {
    console.error('Error saving consultation locally:', error);
    throw error;
  }
}

// Initialize database connection
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database at', config.mysql.host);

    // Create consultations table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        notes TEXT,
        preferred_date DATE,
        preferred_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT FALSE,
        sync_attempts INT DEFAULT 0
      );
    `;

    await query(createTableSQL);
    console.log('Consultations table verified/created');

    // Check for recent consultation records
    const checkRecords = async () => {
      const sql = `
        SELECT * FROM consultations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY created_at DESC
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