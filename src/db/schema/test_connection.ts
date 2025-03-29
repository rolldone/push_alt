import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { workspacesTable } from './workspace';
import { relations, sql } from 'drizzle-orm';

export const testConnectionsTable = sqliteTable('test_connections', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workspace_id: integer('workspace_id').notNull().references(() => workspacesTable.id),
    app_key: text('app_key'), // Added text column, nullable by default
    channel_name: text('channel_name', { length: 255 }).notNull(),
    token: text('token').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`), // When the request was made
    expires_in_seconds: integer('expires_in_seconds'),
});

// Define the belongsTo-like relation
export const testConnectionsRelations = relations(testConnectionsTable, ({ one }) => ({
    workspace: one(workspacesTable, {
        fields: [testConnectionsTable.workspace_id],
        references: [workspacesTable.id],
    }),
}));