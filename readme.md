
# Push-Alt

A lightweight, TypeScript-based backend server for real-time applications, built with [Hono](https://hono.dev/), [Socket.IO](https://socket.io/), and [Drizzle ORM](https://orm.drizzle.team/). Push-Alt supports both SQLite and LibSQL databases, offering flexibility for local development or cloud deployment. Ideal for chat apps, collaborative tools, or any project needing real-time communication.

## Features

- **Real-time Communication**: WebSocket support via Socket.IO for channel-based messaging, triggered via HTTP API.
- **Flexible Database**: Choose between SQLite (local) or LibSQL (remote) with Drizzle ORM.
- **Modular Routing**: RESTful API with Hono, organized into controllers (auth, admin, workspace, etc.).
- **Security**: CORS, admin middleware, and token-based channel access.
- **Type Safety**: Fully written in TypeScript with strong typing.

## Setup

### Prerequisites

- Node.js (v18+ recommended)
- npm (for installing dependencies)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd push-alt
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

### Configuration

Push-Alt uses `dotenv` to load environment variables. Create a `.env` file in the project root:

```
DB_TYPE=libsql           # 'sqlite' or 'libsql'
DATABASE_URL=http://libsql-server:8080  # LibSQL URL or SQLite file path
DATABASE_AUTH_TOKEN=your-token  # Required for LibSQL
CORS_ORIGINS=http://localhost:5173  # Comma-separated list
NODE_ENV=development     # Controls migrations (runs in non-production)
SQLITE_DB_PATH=./local.db  # Path for SQLite (if DB_TYPE=sqlite)
```

### Running the Project

- Start in development mode (with hot reloading):
  ```
  npm run dev
  ```
- Start the compiled app:
  ```
  npm run start
  ```

### Flow system work
```
+-------------------------------------+
|   Client Flow: Token & Messaging    |
|   (Interacting with Push-Alt Server)|
+-------------------------------------+
          |
          v
+------------------------------------+
| 1. Request Token                   |
+------------------------------------+
| POST /api/channel/auth             |
| Headers:                           |
|   Content-Type: application/json   |
| Body:                              |
|   {                                |
|     "app_id": "your-app-id",       |
|     "app_key": "your-app-key",     |
|     "channel_name": "general",     |
|     "expires_in_seconds": 3600     |
|   }                                |
+------------------------------------+
          |
          v
+--------------------------------------------------------------+
| 2. Receive Token Response                                    |
+--------------------------------------------------------------+
| Success (200):                                               |
|   {                                                          |
|     "success": true,                                         |
|     "token": "random-token",                                 |
|     "message_listen_name": "workspace:<id>:general:message", |
|     "message": "Channel created",                            |
|     "data": {...}                                            |
|   }                                                          |
| Failure (401/400):                                           |
|   { "success": false, "message": "..." }                     |
+--------------------------------------------------------------+
          |
          | (if success)
          v
+--------------------------------------------------------------+
| 3. Connect to Socket.IO                                      |
+--------------------------------------------------------------+
| const socket = io('http://localhost:4321', { path: '/ws' }); |
+--------------------------------------------------------------+
          |
          v
+--------------------------------+
| 4. Join Channel with Token     |
+--------------------------------+
| socket.emit('join_channel', {  |
|   "token": "random-token",     |
|   "channel_name": "general"    |
| });                            |
+--------------------------------+
          |
          +-----------------+-------------------+
          | (if joined)     | (if error)        |
          v                 v                   |
+----------------+  +----------------+          |
| 5a. Joined     |  | 5b. Error      |          |
+----------------+  +----------------+          |
| socket.on('joined', (data) => {    |          |
|   console.log(data.message);       |          |
|   // "Connected to general..."     |          |
| });                                |          |
+----------------+                   |          |
          |                 +-------------------------------+
          |                 | socket.on('error', (err) => {
          |                 |   console.error(err.message);
          |                 | });
          |                 +-------------------------------+
          |
          v
+-----------------------------------------------------------------------+
| 6. Listen for Messages                                                |
+-----------------------------------------------------------------------+
| socket.on("workspace:<id>:general:message", (msg) => {                |
|   console.log('Received:', msg); // e.g., { text: "Hello, world!" }   |
| });                                                                   |
| // Use message_listen_name from step 2                                |
+-----------------------------------------------------------------------+
          |
          v
+--------------------------------------------------------+
| 7. (Optional) Send Message                             |
+--------------------------------------------------------+
| POST /api/message/emit                                 |
| Headers:                                               |
|   Content-Type: application/json                       |
| Body:                                                  |
|   {                                                    |
|     "app_id": "your-app-id",                           |
|     "channel_name": "general",                         |
|     "body": { "text": "Hello, world!" }                |
|   }                                                    |
| Response:                                              |
|   { "success": true, "message": "Message emitted..." } |
+--------------------------------------------------------+
```
### Database Migrations

Generate and apply database migrations with Drizzle:

```
npm run drizzle:generate
```

Migrations run automatically on startup unless `NODE_ENV=production`.

## API Endpoints

- `/api/auth`: Authentication routes
- `/api/admin`: Admin-only routes (protected by middleware)
- `/api/workspaces`: Workspace management
- `/api/channel`: Channel operations (includes `/auth` for token generation)
- `/api/message`: Message handling (includes `/emit` for broadcasting)
- `/api/setting`: Settings management
- `/api/setup`: Initial setup routes
- `/api/test-connection`: Test database connection (admin-only)

Static files are served from `./webapp/dist`.

## Real-time Events

Push-Alt uses Socket.IO for WebSocket communication. Connect clients to `/ws`:

### Creating a Token to Join a Channel

To join a channel, you need a token. Use the `/api/channel/auth` endpoint:

```
// Example using fetch
fetch('http://localhost:4321/api/channel/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'your-app-id',
    app_key: 'your-app-key', // Must match the workspace's app_key
    channel_name: 'general',
    expires_in_seconds: 3600, // Optional, defaults to 1 hour (3600 seconds)
  }),
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Token:', data.token);
      console.log('Listen to:', data.message_listen_name);
    } else {
      console.error(data.message);
    }
  })
  .catch(err => console.error(err));
```

- **Request Fields**:
  - `app_id`: Unique identifier for the workspace.
  - `app_key`: Secret key for the workspace (verified with bcrypt).
  - `channel_name`: Name of the channel to create/join.
  - `expires_in_seconds`: Optional expiration time in seconds (defaults to 3600 if omitted).
- **Response**:
  - `token`: Randomly generated token to join the channel.
  - `message_listen_name`: Event name for receiving messages (e.g., `workspace:<id>:general:message`).

### Joining a Channel

Use the token from `/api/channel/auth` to join the channel:

```
const socket = io('http://localhost:4321', { path: '/ws' });

socket.emit('join_channel', {
  token: 'your-generated-token', // From /api/channel/auth
  channel_name: 'general',
});

socket.on('joined', (data) => {
  console.log(data.message); // "Connected to general in workspace X"
});

socket.on('error', (err) => {
  console.error(err.message);
});
```

### Sending Messages

Messages are sent via an HTTP POST request to `/api/message/emit`, which broadcasts to connected clients:

```
// Example using fetch
fetch('http://localhost:4321/api/message/emit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'your-app-id',
    channel_name: 'general',
    body: { text: 'Hello, world!' },
  }),
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Client-side listener using message_listen_name from /api/channel/auth
let messageListenName; // Set this from the /api/channel/auth response
socket.on(messageListenName, (msg) => {
  console.log('Received:', msg); // { text: 'Hello, world!' }
});
```

## Custom Configuration

Modify the server setup in `src/index.ts`. Example:

```
import createPushAlt from './src/index';

const { server, db } = await createPushAlt({
  port: 3000,
  corsOrigins: ['https://myapp.com'],
  dbType: 'sqlite',
  databaseUrl: './myapp.db',
  runMigrations: true,
  socketOptions: { pingTimeout: 60000 },
});

server(({ app }) => {
  // Add custom middleware or routes
  app.get('/custom', (c) => c.text('Hello from custom route!'));
});
```

## Configuration Options

| Option             | Type                | Default                | Description                          |
|--------------------|---------------------|------------------------|--------------------------------------|
| `port`            | `number`           | `4321`                | Server port                          |
| `socketOptions`   | `Partial<ServerOptions>` | `{}`             | Socket.IO configuration             |
| `corsOrigins`     | `string[]`         | `['http://localhost:5173']` | Allowed CORS origins        |
| `runMigrations`   | `boolean`          | `true` (non-prod)     | Run DB migrations on startup         |
| `databaseUrl`     | `string`           | From env              | Database URL or SQLite path          |
| `databaseAuthToken` | `string`         | From env              | LibSQL auth token                   |
| `dbType`          | `'sqlite' \| 'libsql'` | `'libsql'`        | Database type                       |

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit changes (`git commit -m "Add my feature"`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a pull request.

## License

MIT License (unless specified otherwise in your project).

## Support

For issues or questions, open an issue on the [GitHub repository](<repository-url>) or contact the maintainers.
