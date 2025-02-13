import { z } from 'zod';

// User schema for validation
export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

export type User = z.infer<typeof userSchema>;

// Export table schemas
export const USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Type for query results
export interface QueryResult {
  affectedRows: number;
  insertId: number;
}
