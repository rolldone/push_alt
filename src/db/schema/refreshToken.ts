import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { usersTable } from './user';
import { sql } from 'drizzle-orm';

export const refreshTokensTable = sqliteTable('refresh_token', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  token: text('token').notNull().unique(),
  expires_at: text('expires_at').notNull(), // Store as YYYY-MM-DD HH:mm:ss
  created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});