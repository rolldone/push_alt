import { Hono } from 'hono';
import db from '../db';
import { channelsTable } from '../db/schema/channel';
import { workspacesTable } from '../db/schema/workspace';
import { and, eq, sql, desc } from 'drizzle-orm';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';

const channelController = new Hono();

// POST /api/channel/auth
channelController.post('/auth', async (c) => {
    const { app_id, app_key, channel_name, expires_in_seconds } = await c.req.json();

    const workspace = await db.select()
        .from(workspacesTable)
        .where(and(eq(workspacesTable.app_id, app_id)))
        .limit(1);

    if (!workspace.length) {
        return c.json({ success: false, message: 'Workspace not found' }, 401);
    }

    if (workspace[0].status == "deactivated") {
        return c.json({ success: false, message: 'Workspace Deactivated' }, 401);
    }

    let pass = await bcrypt.compare(app_key || "", workspace[0].app_key || "");
    if (!pass) {
        return c.json({ success: false, message: 'Invalid workspace or credentials' }, 401);
    }

    const token = Math.random().toString(36).substring(2);
    const expiresAt = parseInt(expires_in_seconds)
        ? new Date(Date.now() + expires_in_seconds * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(channelsTable).values({
        workspace_id: workspace[0].id,
        channel_name,
        token,
        expires_at: dayjs(expiresAt).format("YYYY-MM-DD HH:mm:ss"),
    });

    const newChannel = await db.select()
        .from(channelsTable)
        .where(eq(channelsTable.token, token))
        .limit(1);

    return c.json({
        success: true,
        token,
        message_listen_name: `workspace:${workspace[0].id}:${channel_name}:message`,
        message: 'Channel created',
        data: newChannel[0]
    });
});

// GET /api/channel/channels with pagination
channelController.get('/channels', async (c) => {
    const page = parseInt(c.req.query('page') || '1', 10);
    const take = parseInt(c.req.query('take') || '10', 10);

    // Validate page and take parameters
    if (isNaN(page) || page < 1 || isNaN(take) || take < 1) {
        return c.json({ success: false, message: 'Invalid pagination parameters' }, 400);
    }

    const offset = (page - 1) * take;

    // Fetch paginated data with descending order
    const channelsList = await db.select({
        id: channelsTable.id,
        workspace_id: channelsTable.workspace_id,
        channel_name: channelsTable.channel_name,
        token: channelsTable.token,
        created_at: channelsTable.created_at,
        expires_at: channelsTable.expires_at,
    })
        .from(channelsTable)
        .limit(take)
        .offset(offset)
        .orderBy(desc(channelsTable.created_at)); // Use desc for descending order

    // Fetch the total count of channels
    const totalChannelsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(channelsTable);

    const totalChannels = totalChannelsResult[0]?.count || 0;

    // Check if there are more records
    const hasMore = offset + take < totalChannels;

    const formattedList = channelsList.map((channel) => ({
        id: channel.id,
        workspace_id: channel.workspace_id,
        channel_name: channel.channel_name,
        token: channel.token,
        created_at: channel.created_at,
        expires_at: channel.expires_at,
    }));

    return c.json({
        success: true,
        data: formattedList,
        hasMore: hasMore,
        message: null,
    });
});

// GET /api/channel/:id
channelController.get('/:id', async (c) => {
    const { id } = c.req.param();

    const channel = await db.query.channelsTable.findFirst({
        where: eq(channelsTable.id, parseInt(id)),
        columns: {
            id: true,
            workspace_id: true,
            channel_name: true,
            token: true,
            created_at: true,
            expires_at: true,
        },
        with: {
            workspace: {
                columns: {
                    name: true,
                },
            },
        },
    });

    if (!channel) {
        return c.json({ success: false, message: 'Channel not found' }, 404);
    }

    const formattedChannel = {
        id: channel.id,
        workspace_id: channel.workspace_id,
        channel_name: channel.channel_name,
        token: channel.token,
        created_at: channel.created_at,
        expires_at: channel.expires_at,
        workspace: channel.workspace || { name: 'N/A' },
    };

    return c.json({ success: true, data: formattedChannel });
});

export default channelController;