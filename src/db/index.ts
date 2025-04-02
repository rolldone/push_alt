// src/db/index.ts
import { drizzle as drizzleLibsql, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { BetterSQLite3Database, drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import * as schema from './schema/index';

// Function to initialize the database based on the environment
function initializeDatabase() {
  const dbType = process.env.DB_TYPE || 'libsql'; // Default to 'libsql' if not specified

  if (dbType === 'sqlite') {
    // SQLite configuration with better-sqlite3
    const sqliteClient = new Database(process.env.SQLITE_DB_PATH || './local.db');
    return drizzleSqlite(sqliteClient, { schema });
  } else {
    // LibSQL configuration
    const libsqlClient = createClient({
      url: process.env.DATABASE_URL || 'http://libsql-server:8080',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return drizzleLibsql({ client: libsqlClient, schema });
  }
}

// Export the initialized database
const db = initializeDatabase();

// Type definition for the database
export type DbType =
  | (BetterSQLite3Database<typeof schema> & { $client: DatabaseType })
  | (LibSQLDatabase<typeof schema> & { $client: ReturnType<typeof createClient> });

// Function to get the database type (for migrations)
export const getDbType = () => process.env.DB_TYPE || 'libsql';

export default db as (LibSQLDatabase<typeof schema> & { $client: ReturnType<typeof createClient> });