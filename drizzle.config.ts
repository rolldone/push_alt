import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Determine the database type from environment variables
const dbType = process.env.DB_TYPE || 'libsql'; // Default to 'libsql'

export default defineConfig({
  out: './src/db/migrations', // Changed to match src/index.ts migrationsFolder
  schema: './src/db/schema', // Kept as is
  dialect: dbType === 'sqlite' ? 'sqlite' : 'turso', // Switch dialect (kept as is)
  ...(dbType === 'sqlite'
    ? {
        driver: 'better-sqlite3', // Specify the driver for SQLite
        dbCredentials: {
          url: process.env.SQLITE_DB_PATH || './local.db', // Use file path here
        },
      }
    : {
        dbCredentials: {
          url: process.env.DATABASE_URL!, // Kept as is with ! assertion
          authToken: process.env.DATABASE_AUTH_TOKEN,
        },
      }),
});