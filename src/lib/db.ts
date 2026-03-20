import { Pool } from 'pg';

/**
 * Database connection pool.
 * Uses environment variables for configuration.
 * Recommended vars: DATABASE_URL or individual PGHOST, PGUSER, etc.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For local development without SSL, or with self-signed certs
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = {
  /**
   * Execute a SQL query.
   * @param text The SQL query string
   * @param params An array of values to replace placeholders ($1, $2, etc.)
   */
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error', error);
      throw error;
    }
  },

  /**
   * Get a client from the pool for transactions.
   */
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
};
