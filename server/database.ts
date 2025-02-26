import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// Configure connection pool with limits and timeouts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create drizzle instance
export const db = drizzle(pool);

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const client = await pool.connect();
  try {
    console.log('Executing query:', sql, 'with params:', params);
    const { rows } = await client.query(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
    console.log('Database connection released');
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

  const client = await pool.connect();
  try {
    const formattedDate = consultationData.preferredDate ? formatDate(consultationData.preferredDate) : null;
    const formattedTime = consultationData.preferredTime || null;

    console.log('2. Formatted date and time for PostgreSQL:', { formattedDate, formattedTime });

    const result = await client.query(sql, [
      consultationData.name,
      consultationData.email,
      consultationData.phone,
      consultationData.notes || null,
      formattedDate,
      formattedTime
    ]);

    console.log('3. PostgreSQL insertion result:', result.rows[0]);
    return result.rows[0].id;
  } catch (error) {
    console.error('4. Error saving consultation to PostgreSQL:', error);
    throw error;
  } finally {
    client.release();
    console.log('5. Database connection released after consultation save');
  }
}

// Initialize database tables
export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database connection to:', process.env.DATABASE_URL);
    console.log('Current pool status:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });

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

    // Initialize Drizzle migrations if needed
    // await migrate(db, { migrationsFolder: './drizzle' });

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
    console.log('Database initialization connection released');
  }
}

// Add event listeners for pool events
pool.on('connect', () => {
  console.log('New client connected to the pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

export default pool;