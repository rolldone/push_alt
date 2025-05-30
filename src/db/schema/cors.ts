import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const corsEntriesTable = sqliteTable('cors_entries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    url: text('url').notNull().unique(),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});
