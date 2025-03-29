import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema/index';

const client = createClient({
  url: process.env.DATABASE_URL || 'http://libsql-server:8080',
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const db = drizzle({ client, schema });

export default db;