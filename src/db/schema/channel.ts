import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { workspacesTable } from './workspace';
import { relations, sql } from 'drizzle-orm';

export const channelsTable = sqliteTable('channels', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workspace_id: integer('workspace_id').notNull().references(() => workspacesTable.id), // Links to workspaces
    channel_name: text('channel_name', { length: 255 }).notNull(), // Event the client wants to listen to
    token: text('token', { length: 255 }).notNull(), // Token for client to use
    created_at: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`), // When the request was made
    expires_at: text('expires_at').notNull().default(sql`(CURRENT_TIMESTAMP)`), // Added expires_at
});

// Define the belongsTo-like relation
export const channelsTableRelations = relations(channelsTable, ({ one }) => ({
    workspace: one(workspacesTable, {
        fields: [channelsTable.workspace_id],
        references: [workspacesTable.id],
    }),
}));