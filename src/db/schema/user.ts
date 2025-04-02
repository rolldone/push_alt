import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text({ length: 255 }).notNull(),
    last_name: text({ length: 255 }),
    email: text({ length: 255 }).notNull().unique(),
    password: text().notNull(),
    role: text({ length: 255 }),
    is_root: integer({ mode: 'boolean' }).default(false),
    status: text({ length: 255 }).default("deactivated"),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`), // When the request was made
    updated_at: integer('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(current_timestamp)`), // When the request was made
});