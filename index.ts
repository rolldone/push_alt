// user-app/index.ts
import { eq } from 'drizzle-orm';
import { workspacesTable } from './src/db/schema';
import pushAlt from './src/index';

/*
 * Environment Variables:
 * - SQLITE_DB_PATH: Path to the SQLite database file (e.g., './local.db')
 * - DB_TYPE: Database type ('sqlite' or 'libsql', set to 'sqlite' here)
 * - CORS_ORIGINS: Comma-separated list of allowed CORS origins (e.g., 'http://myapp.com')
 * - NODE_ENV: Environment (e.g., 'production' to skip migrations)
 * - PORT: Server port (optional, overrides 'port' option)
 *
 * Example .env file for SQLite:
 * ```
 * SQLITE_DB_PATH=./local.db
 * DB_TYPE=sqlite
 * CORS_ORIGINS=http://myapp.com
 * NODE_ENV=development
 * ```
 *
 * Note: DATABASE_URL and DATABASE_AUTH_TOKEN are ignored when DB_TYPE=sqlite.
 */

const run = async function () {

  // Start push-alt
  const { server, db } = await pushAlt({
    port: 4321,
    corsOrigins: process.env.CORS_ORIGINS?.split(','),
    runMigrations: true,
    databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,
    databaseUrl: process.env.DATABASE_URL,
    dbType: process.env.DB_TYPE as "libsql",
    socketOptions: {}
  });


  const { io } = server((props) => {

    let app = props.app

    // Extend the app if needed
    app.get('/custom-route', (c) => {
      return c.text('Hello from user app!')
    });
  })
}

run();