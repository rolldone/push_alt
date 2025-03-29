import { Hono } from 'hono';
import db from '../db';
import { testConnectionsTable } from '../db/schema/test_connection';
import { workspacesTable } from '../db/schema/workspace';
import { eq, and, inArray } from 'drizzle-orm';

const testConnectionController = new Hono();

// POST /api/test-connection
testConnectionController.post('/', async (c) => {
    const { app_key, channel_name, expires_in_seconds, workspace_id } = await c.req.json();

    const workspace = await db.select()
        .from(workspacesTable)
        .where(and(eq(workspacesTable.id, parseInt(workspace_id))))
        .limit(1);

    if (!workspace.length) {
        return c.json({ success: false, message: 'Invalid workspace or credentials' }, 401);
    }

    const token = Math.random().toString(36).substring(2);

    await db.insert(testConnectionsTable).values({
        workspace_id: parseInt(workspace_id),
        channel_name,
        token,
        app_key,
        created_at: new Date(),
        expires_in_seconds,
    });

    const newTestConnection = await db.select()
        .from(testConnectionsTable)
        .where(eq(testConnectionsTable.token, token))
        .limit(1);

    return c.json({ success: true, token, message: 'Test connection created', data: newTestConnection[0] });
});

// PUT /api/test-connection/:id
testConnectionController.put('/:id', async (c) => {
    const { id } = c.req.param();
    const { workspace_id, channel_name, expires_in_seconds, app_key } = await c.req.json();

    const testConnection = await db.select()
        .from(testConnectionsTable)
        .where(eq(testConnectionsTable.id, parseInt(id)))
        .limit(1);

    if (!testConnection.length) {
        return c.json({ success: false, message: 'Test connection not found' }, 404);
    }

    await db.update(testConnectionsTable)
        .set({
            workspace_id: workspace_id || testConnection[0].workspace_id,
            channel_name: channel_name || testConnection[0].channel_name,
            expires_in_seconds,
            app_key
        })
        .where(eq(testConnectionsTable.id, parseInt(id)));

    const updatedTestConnection = await db.select()
        .from(testConnectionsTable)
        .where(eq(testConnectionsTable.id, parseInt(id)))
        .limit(1);

    return c.json({ success: true, message: 'Test connection updated', data: updatedTestConnection[0] });
});

// GET /api/test-connections
testConnectionController.get('/test-connections', async (c) => {
    const testConnectionsList = await db.query.testConnectionsTable.findMany({
        columns: {
            id: true,
            workspace_id: true,
            channel_name: true,
            token: true,
            created_at: true,
            expires_in_seconds: true,
            app_key: true
        },
        with: {
            workspace: {
                columns: {
                    name: true,
                },
            },
        },
    });

    const formattedList = testConnectionsList.map((testConnection) => ({
        id: testConnection.id,
        workspace_id: testConnection.workspace_id,
        channel_name: testConnection.channel_name,
        token: testConnection.token,
        created_at: testConnection.created_at,
        expires_in_seconds: testConnection.expires_in_seconds,
        workspace: testConnection.workspace || 'N/A',
    }));

    return c.json({ success: true, data: formattedList });
});

// GET /api/test-connection/:id
testConnectionController.get('/:id', async (c) => {
    const { id } = c.req.param();

    const testConnection = await db.query.testConnectionsTable.findFirst({
        where: eq(testConnectionsTable.id, parseInt(id)),
        columns: {
            id: true,
            workspace_id: true,
            channel_name: true,
            token: true,
            created_at: true,
            expires_in_seconds: true,
            app_key: true
        },
        with: {
            workspace: {
                columns: {
                    name: true,
                    app_id: true,
                },
            },
        },
    });

    if (!testConnection) {
        return c.json({ success: false, message: 'Test connection not found' }, 404);
    }

    return c.json({ success: true, data: testConnection });
});

// POST /api/test-connection/delete
testConnectionController.post('/delete', async (c) => {
    const { ids } = await c.req.json();

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
        return c.json({ success: false, message: 'Invalid or empty IDs array' }, 400);
    }

    try {
        // Check if the test connections exist
        const testConnections = await db.select()
            .from(testConnectionsTable)
            .where(inArray(testConnectionsTable.id, ids));

        if (testConnections.length === 0) {
            return c.json({ success: false, message: 'No test connections found for the provided IDs' }, 404);
        }

        // Delete the test connections
        await db.delete(testConnectionsTable)
            .where(inArray(testConnectionsTable.id, ids));

        return c.json({ success: true, message: 'Test connections deleted', data: testConnections });
    } catch (err: any) {
        return c.json({ success: false, message: 'Error deleting test connections' }, 500);
    }
});

export default testConnectionController;
