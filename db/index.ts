import pool from '../server/database';
import { query } from '../server/database';
import { User, QueryResult } from './schema';

// Database operations
export const db = {
  users: {
    async create(user: Omit<User, 'id'>): Promise<number> {
      const result = await query<QueryResult>(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [user.username, user.email, user.password]
      );
      return result.insertId;
    },

    async findByUsername(username: string): Promise<User | null> {
      const users = await query<User[]>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return users[0] || null;
    },

    async findById(id: number): Promise<User | null> {
      const users = await query<User[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return users[0] || null;
    }
  }
};

export { pool, query };