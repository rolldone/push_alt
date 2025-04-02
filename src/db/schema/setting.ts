import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settingTable = sqliteTable("settings", {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name', { length: 255 }).notNull().unique(),
    value: text({ length: 255 }).notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`), // When the request was made
    updated_at: integer('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(current_timestamp)`), // When the request was made
});

