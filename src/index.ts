// src/index.ts
import { config } from 'dotenv';
config(); // Load .env
import { Hono, Hono as HonoBase } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Server, type DefaultEventsMap, type ServerOptions } from 'socket.io';
import fs from 'fs';
import { and, eq, gt } from 'drizzle-orm';
import dayjs from 'dayjs';
import { channelsTable, corsEntriesTable } from './db/schema';
import db, { getDbType } from './db';
import authController from './controllers/AuthController';
import adminController from './controllers/AdminController';
import workspaceController from './controllers/WorkspaceController';
import channelController from './controllers/ChannelController';
import testConnectionController from './controllers/TestConnectionController';
import settingController from './controllers/SettingController';
import messageController from './controllers/MessageController';
import AdminMiddleware from './middleware/AdminMiddleware';
import { serveStatic } from '@hono/node-server/serve-static';
import type { BlankSchema } from 'hono/types';
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator'; // SQLite migrator
import { migrate as migrateLibsql } from 'drizzle-orm/libsql/migrator'; // LibSQL migrator
import setupController from './controllers/SetupController';
import corsController from './controllers/CorsController';

// Export Hono type with our custom variables
export const hono = HonoBase as new <T extends Record<string, any>>() => HonoBase<T>; // Export Hono constructor

export const HonoController = Hono<{ Variables: { io: Server } }>

// Define configuration options for the module
export interface PushAltOptions {
    port?: number; // Custom port (default: 4321)
    socketOptions?: Partial<ServerOptions>; // Socket.IO options
    corsOrigins?: string[]; // Custom CORS origins
    runMigrations?: boolean; // Optional flag to control schema sync
    databaseUrl?: string; // Override DATABASE_URL (or SQLITE_DB_PATH for sqlite)
    databaseAuthToken?: string; // Override DATABASE_AUTH_TOKEN (ignored for sqlite)
    dbType?: 'sqlite' | 'libsql'; // Override DB_TYPE
}

export const createPushAlt = async (options: PushAltOptions = {}) => {
    const {
        port = 4321,
        socketOptions = {},
        corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
        runMigrations = process.env.NODE_ENV !== 'production', // Run migrations by default in non-prod
        databaseUrl = process.env.DB_TYPE === 'sqlite' ? process.env.SQLITE_DB_PATH : process.env.DATABASE_URL,
        databaseAuthToken = process.env.DATABASE_AUTH_TOKEN,
        dbType = process.env.DB_TYPE as 'sqlite' | 'libsql' | undefined,
    } = options;

    // Set environment variables if provided
    if (dbType) process.env.DB_TYPE = dbType;
    if (databaseUrl) {
        if (dbType === 'sqlite') process.env.SQLITE_DB_PATH = databaseUrl;
        else process.env.DATABASE_URL = databaseUrl;
    }
    if (databaseAuthToken && dbType !== 'sqlite') process.env.DATABASE_AUTH_TOKEN = databaseAuthToken;

    // Run migrations based on database type
    if (runMigrations) {
        try {
            console.log('Running database migrations...');
            const dbTypeResolved = getDbType();
            const migrationsFolder = './src/db/migrations';

            if (dbTypeResolved === 'sqlite') {
                if (!process.env.SQLITE_DB_PATH) throw new Error('SQLITE_DB_PATH is required for SQLite');
                await migrateSqlite(db as any, { migrationsFolder });
            } else {
                if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for LibSQL');
                await migrateLibsql(db as any, { migrationsFolder });
            }
            console.log('Migrations completed successfully.');
        } catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    }

    // Write PID to file
    const pid = process.pid;
    const filePath = 'pid.txt';
    fs.writeFileSync(filePath, pid.toString());
    console.log(`PID ${pid} has been written to ${filePath}`);


    // Function to dynamically fetch and merge CORS origins
    const getCorsOrigins = async () => {
        const envOrigins = process.env.CORS_ORIGINS?.split(',') || [];
        const dbOrigins = await db.select().from(corsEntriesTable).then(entries => entries.map(entry => entry.url));
        const staticOrigins = ['http://localhost:5173'];

        // Merge and remove duplicates
        return Array.from(new Set([...envOrigins, ...dbOrigins, ...staticOrigins]));
    };

    // Fetch initial CORS origins
    let corsOriginsDynamic = await getCorsOrigins();
    console.log('Initial CORS Origins:', corsOriginsDynamic);

    // Start the server
    const server = (callback?: {
        (props: {
            app: Hono<{
                Variables: {
                    io: Server;
                };
            }, BlankSchema, "/">
        }): void
    }) => {
        // Initialize Hono app using our exported hono
        const app = new hono<{ Variables: { io: Server } }>();

        // Enable CORS with dynamic origins
        app.use('*', async (c, next) => {
            const corsOriginsDynamic = await getCorsOrigins(); // Refresh CORS origins dynamically
            const corsMiddleware = cors({
                origin: corsOriginsDynamic,
                allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
                allowHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
            });

            // Call the CORS middleware and ensure `await next()` is called
            return await corsMiddleware(c, async () => {
                return await next();
            });
        });

        // Inject Socket.IO into context
        app.use('*', async (c, next) => {
            c.set('io', io as Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>);
            await next();
        });

        if (callback != null) {
            callback({
                app,
            });
        }

        // Apply admin middleware to protected routes
        app.use('/api/admin/*', AdminMiddleware);
        // app.use('/api/channel/*', AdminMiddleware);
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
        app.route('/api/setup', setupController);
        app.route('/api/cors', corsController); // Register CorsController

        // Serve static files
        app.use('/*', serveStatic({ root: './webapp/dist' }));
        app.get('/admin/*', serveStatic({ path: './webapp/dist/index.html' }));

        const server = serve({ fetch: app.fetch, port });
        console.log(`Server running on port ${port}`);

        // Attach Socket.IO
        const io = new Server(server, {
            path: '/ws',
            serveClient: false,
            cors: {
                origin: async (origin, callback) => {
                    const corsOriginsDynamic = await getCorsOrigins(); // Fetch dynamic CORS origins
                    if (!origin || corsOriginsDynamic.includes(origin)) {
                        callback(null, true); // Allow the origin
                    } else {
                        callback(new Error('Not allowed by CORS')); // Reject the origin
                    }
                },
                credentials: true,
            },
            ...socketOptions,
        });

        // Socket.IO connection handler
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join_channel', async ({ token }) => {
                let channel = null
                try {
                    channel = await db.select()
                        .from(channelsTable)
                        .where(and(
                            eq(channelsTable.token, token),
                            gt(channelsTable.expires_at, dayjs().format('YYYY-MM-DD'))
                        ))
                        .limit(1);

                    if (!channel.length) {
                        socket.emit('error', { message: 'Invalid token or channel' });
                        socket.disconnect();
                        return;
                    }
                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                    socket.disconnect();
                    return;
                }
                const channel_name = channel[0].channel_name;
                const workspace_id = channel[0].workspace_id;
                const room = `workspace:${workspace_id}:${channel_name}`;
                socket.join(room);
                socket.emit('joined', { message: `Connected to ${channel_name} in workspace ${workspace_id}` });
            });

            socket.on('message', (msg) => {
                const rooms = Array.from(socket.rooms).filter(room => room.startsWith('workspace:'));
                if (rooms.length) {
                    if (io == null) return
                    io.to(rooms[0]).emit('message', msg);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
        return {
            io
        }
    }
    return { server, db };
};

export default createPushAlt;