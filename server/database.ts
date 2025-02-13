import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const { rows } = await pool.query(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Format date for PostgreSQL
function formatDate(isoDate: string): string {
  return isoDate.split('T')[0];
}

// Format time for PostgreSQL
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
  console.log('1. Starting database save operation with data:', consultationData);

  const sql = `
    INSERT INTO consultations 
    (name, email, phone, notes, preferred_date, preferred_time)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;

  try {
    const formattedDate = consultationData.preferredDate ? formatDate(consultationData.preferredDate) : null;
    const formattedTime = consultationData.preferredTime || null;

    console.log('2. Formatted date and time for PostgreSQL:', { formattedDate, formattedTime });

    const result = await query<[{ id: number }]>(sql, [
      consultationData.name,
      consultationData.email,
      consultationData.phone,
      consultationData.notes || null,
      formattedDate,
      formattedTime
    ]);

    console.log('3. PostgreSQL insertion result:', result);
    return result[0].id;
  } catch (error) {
    console.error('4. Error saving consultation to PostgreSQL:', error);
    throw error;
  }
}

// Initialize database tables
export async function initDatabase() {
  try {
    console.log('Initializing database connection to:', process.env.DATABASE_URL);
    const client = await pool.connect();

    // Create consultations table if it doesn't exist
    const createConsultationsTable = `
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        notes TEXT,
        preferred_date DATE,
        preferred_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        crm_sync_status VARCHAR(10) DEFAULT 'pending' CHECK (crm_sync_status IN ('pending', 'synced', 'failed')),
        crm_sync_attempts INTEGER DEFAULT 0,
        crm_last_sync TIMESTAMP,
        crm_error TEXT
      )
    `;

    // Create sync_records table if it doesn't exist
    const createSyncRecordsTable = `
      CREATE TABLE IF NOT EXISTS sync_records (
        id SERIAL PRIMARY KEY,
        direction VARCHAR(20) NOT NULL CHECK (direction IN ('mysql_to_crm', 'crm_to_mysql')),
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER NOT NULL,
        status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
        attempts INTEGER DEFAULT 0,
        error TEXT,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_records (status, attempts);
      CREATE INDEX IF NOT EXISTS idx_entity ON sync_records (entity_type, entity_id);
    `;

    await client.query(createConsultationsTable);
    await client.query(createSyncRecordsTable);
    console.log('Database tables verified/created');

    client.release();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export default pool;