import { config } from 'dotenv';
config(); // Load .env
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import fs from 'fs';
import { and, eq, gt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { Server } from 'socket.io';
import dayjs from 'dayjs';
import authController from './src/controllers/AuthController';
import adminController from './src/controllers/AdminController';
import workspaceController from './src/controllers/WorkspaceController';
import channelController from './src/controllers/ChannelController';
import testConnectionController from './src/controllers/TestConnectionController';
import settingController from './src/controllers/SettingController';
import messageController from './src/controllers/MessageController';
import AdminMiddleware from './src/middleware/AdminMiddleware';
import { channelsTable, settingTable, usersTable } from './src/db/schema';
import db from './src/db';

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'];

const pid = process.pid;
const filePath = 'pid.txt';
fs.writeFile(filePath, pid.toString(), (err) => {
  if (err) throw err;
  console.log(`PID ${pid} has been written to ${filePath}`);
});

const app = new Hono<{ Variables: { io: Server } }>();

// Enable CORS
app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
}));

// GET /api/setup/complete
app.get('/api/setup/complete', (c) => {
  return c.text('Hello Hono with TypeScript!');
});

// POST /api/setup/complete
app.post('/api/setup/complete', async (c) => {
  const { app_name, timezone, name, email, password, password_confirm } = await c.req.json();

  if (!app_name || !timezone || !name || !email || !password || !password_confirm) {
    return c.json({ success: false, message: 'All fields are required' }, 400);
  }
  if (password !== password_confirm) {
    return c.json({ success: false, message: 'Passwords do not match' }, 400);
  }

  const settingsData = { app_name, timezone };
  const userData = { name, email, password };

  const installedAtRecord = await db.select().from(settingTable).where(eq(settingTable.name, 'installed_at')).limit(1);
  if (installedAtRecord.length > 0) {
    return c.json({ success: false, message: 'Setup already completed, cannot insert again' }, 400);
  }

  await db.delete(settingTable);

  const installed_at = new Date().toISOString().split('T')[0];
  await db.insert(settingTable).values([
    { name: 'app_name', value: app_name },
    { name: 'timezone', value: timezone },
    { name: 'installed_at', value: installed_at },
  ]);

  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser.length > 0) {
    await db.update(usersTable)
      .set({ name, password: hashedPassword, is_root: true, status: 'active' })
      .where(eq(usersTable.email, email));
  } else {
    await db.insert(usersTable).values({
      name,
      email,
      is_root: true,
      status: 'active',
      password: hashedPassword,
    });
  }

  return c.json({
    success: true,
    message: 'Setup completed successfully',
    data: { settings: settingsData, user: userData },
  });
});

// Make io available to controllers (e.g., messageController)
app.use('*', async (c, next) => {
  c.set('io', io);
  await next();
});

// Apply admin middleware to protected routes
app.use('/api/admin/*', AdminMiddleware);
app.use('/api/channel/*', AdminMiddleware);
app.use('/api/test-connection/*', AdminMiddleware);
app.use('/api/setting/*', AdminMiddleware);

// Mount controllers
app.route('/api', authController);
app.route('/api/admin', adminController);
app.route('/api/workspaces', workspaceController);
app.route('/api/channel', channelController);
app.route('/api/test-connection', testConnectionController);
app.route('/api/setting', settingController);
app.route('/api/message', messageController);


import { serveStatic } from '@hono/node-server/serve-static';

// Serve static files from webapp/dist
app.use('/*', serveStatic({ root: './webapp/dist' }));

// Fallback to index.html for SPA routing
app.get('/*', serveStatic({ path: './webapp/dist/index.html' }));

// Start the server
const server = serve({
  fetch: app.fetch,
  port: 4321,
});

// Attach Socket.IO
const io = new Server(server, {
  path: '/ws',
  serveClient: false,
  cors: {
    origin: allowedOrigins,
  },
});


// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_channel', async ({ token, channel_name }) => {
    const channel = await db.select()
      .from(channelsTable)
      .where(and(
        eq(channelsTable.token, token),
        eq(channelsTable.channel_name, channel_name),
        gt(channelsTable.expires_at, dayjs().format('YYYY-MM-DD'))
      ))
      .limit(1);

    if (!channel.length) {
      socket.emit('error', { message: 'Invalid token or channel' });
      socket.disconnect();
      return;
    }

    const workspace_id = channel[0].workspace_id;
    const room = `workspace:${workspace_id}:${channel_name}`;
    socket.join(room);
    socket.emit('joined', { message: `Connected to ${channel_name} in workspace ${workspace_id}` });
  });

  socket.on('message', (msg) => {
    const rooms = Array.from(socket.rooms).filter(room => room.startsWith('workspace:'));
    if (rooms.length) {
      io.to(rooms[0]).emit('message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


console.log('Server running on port 4321');