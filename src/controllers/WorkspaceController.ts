import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import db from '../db';
import { workspacesTable } from '../db/schema/workspace';
import { desc, eq, inArray } from 'drizzle-orm';
import { BCRYPT_SALT } from '../utils/var';

const workspaceController = new Hono();

// POST /api/workspaces
workspaceController.post('/', async (c) => {
    const { name, description, status, app_key, app_id } = await c.req.json();
    const hashedAppKey = await bcrypt.hash(app_key, BCRYPT_SALT);

    await db.insert(workspacesTable).values({
        name,
        description,
        status: status || 'active',
        app_id,
        app_key: hashedAppKey,
    });

    const newWorkspace = await db.select()
        .from(workspacesTable)
        .where(eq(workspacesTable.app_id, app_id))
        .limit(1);

    return c.json({ success: true, message: 'Workspace created', data: newWorkspace[0] });
});

// PUT /api/workspaces/:id
workspaceController.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const { name, description, status, app_key, app_id } = await c.req.json();
    const hashedAppKey = app_key ? await bcrypt.hash(app_key, BCRYPT_SALT) : undefined;

    await db.update(workspacesTable)
        .set({
            name,
            description,
            status,
            app_id,
            app_key: hashedAppKey,
        })
        .where(eq(workspacesTable.id, id));

    const updatedWorkspace = await db.select()
        .from(workspacesTable)
        .where(eq(workspacesTable.id, id))
        .limit(1);

    if (updatedWorkspace.length === 0) {
        return c.json({ success: false, message: 'Workspace not found' }, 404);
    }

    return c.json({ success: true, message: 'Workspace updated', data: updatedWorkspace[0] });
});

// GET /api/workspaces
workspaceController.get('/', async (c) => {
    const allWorkspaces = await db.select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        app_id: workspacesTable.app_id || '',
        description: workspacesTable.description,
        status: workspacesTable.status,
        created_at: workspacesTable.created_at,
        updated_at: workspacesTable.updated_at,
    })
        .from(workspacesTable)
        .orderBy(desc(workspacesTable.updated_at));

    return c.json({ success: true, message: 'Workspaces retrieved', data: allWorkspaces });
});

// GET /api/workspaces/:id
workspaceController.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const workspace = await db.select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        app_id: workspacesTable.app_id || '',
        description: workspacesTable.description,
        status: workspacesTable.status,
        created_at: workspacesTable.created_at,
        updated_at: workspacesTable.updated_at,
    })
        .from(workspacesTable)
        .where(eq(workspacesTable.id, id))
        .limit(1);

    if (workspace.length === 0) {
        return c.json({ success: false, message: 'Workspace not found' }, 404);
    }

    return c.json({ success: true, message: 'Workspace retrieved', data: workspace[0] });
});

// DELETE /api/workspaces
workspaceController.delete('/', async (c) => {
    const { ids } = await c.req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return c.json({ success: false, message: 'Invalid or empty IDs' }, 400);
    }

    await db.delete(workspacesTable).where(inArray(workspacesTable.id, ids));

    const deleted = await db.select()
        .from(workspacesTable)
        .where(inArray(workspacesTable.id, ids));

    return c.json({ success: true, message: 'Workspaces deleted', data: deleted });
});

export default workspaceController;