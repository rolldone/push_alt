import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const workspacesTable = sqliteTable('workspaces', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name', { length: 255 }).notNull(),
    description: text('description'), // Added text column, nullable by default
    app_id: text('app_id'), // Added text column, nullable by default
    app_key: text('app_key'), // Added text column, nullable by default
    status: text('status', { length: 50 }).$type<'active' | 'deactivated'>().notNull().default('active'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`), // When the request was made
    updated_at: integer('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(current_timestamp)`), // When the request was made
});