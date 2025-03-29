import { Hono } from 'hono';
import { Server } from 'socket.io';
import db from '../db';
import { workspacesTable } from '../db/schema/workspace';
import { eq } from 'drizzle-orm';

const messageController = new Hono<{ Variables: { io: Server } }>();

// POST /api/message/emit
messageController.post('/emit', async (c) => {
    const { app_id, channel_name, body } = await c.req.json();

    if (!app_id || !channel_name || !body) {
        return c.json({ success: false, message: 'app_id, channel_name, and body are required' }, 400);
    }

    const workspace = await db.select()
        .from(workspacesTable)
        .where(eq(workspacesTable.app_id, app_id))
        .limit(1);

    if (!workspace.length) {
        return c.json({ success: false, message: 'Workspace not found' }, 404);
    }

    const workspace_id = workspace[0].id;
    const room = `workspace:${workspace_id}:${channel_name}`;

    console.log('ROOM :: ', room);
    const io = c.get('io');
    io.to(room).emit(room + ':message', body);

    return c.json({ success: true, message: 'Message emitted to connected clients' });
});

export default messageController;