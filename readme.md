
## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: [Install Node.js](https://nodejs.org/en/download/) (v16 or higher recommended)
- **Git**: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **LibSQL Server**: You’ll need to install or run a LibSQL server (instructions below).
- **phpLiteAdmin**: Optional, for database management (instructions below).
- **Docker** (optional, for running LibSQL or phpLiteAdmin as containers): [Install Docker](https://docs.docker.com/get-docker/)

## Project Structure

- `image_node/`: Directory containing the Node.js app and its `Dockerfile`.
- `src/`: Source code for the Node.js app (Hono API, controllers, etc.).

## Setup Instructions

Follow these steps to set up the project manually.

#### 1. Clone the Repository

Clone the project from your Git repository:

```bash
git clone <your-git-repo-url>
cd <project-directory>
```

### 2. Set Up the LibSQL Server

The project uses LibSQL as its database. You can run LibSQL manually or as a Docker container.

#### Option 1: Run LibSQL as a Docker Container
1. Pull the LibSQL server image:
   ```bash
   docker pull ghcr.io/tursodatabase/libsql-server:latest
   ```
2. Run the LibSQL server:
   ```bash
   docker run -d \
     --name libsql-server \
     -p 127.0.0.1:8080:8080 \
     -v pusher_alt_db:/var/lib/sqld \
     -e SQLD_NODE=primary \
     -e SQLD_AUTH_TOKEN=43lw9rj2 \
     ghcr.io/tursodatabase/libsql-server:latest
   ```
   - This runs LibSQL on `http://127.0.0.1:8080` with an auth token `43lw9rj2`.
   - The database files are stored in a Docker volume `pusher_alt_db` (create it with `docker volume create pusher_alt_db`).

#### Option 2: Install LibSQL Locally
1. Download and install LibSQL from [Turso’s documentation](https://docs.turso.tech/libsql/installation).
2. Start the LibSQL server:
   ```bash
   sqld --http-listen-addr 127.0.0.1:8080 --auth-token 43lw9rj2
   ```
   - Ensure the database files are stored in a directory (e.g., `./pusher_alt_db`).

### 3. Set Up phpLiteAdmin (Optional)

phpLiteAdmin is a web-based tool to manage your LibSQL database.

#### Option 1: Run phpLiteAdmin as a Docker Container
1. Pull the phpLiteAdmin image:
   ```bash
   docker pull vtacquet/phpliteadmin:latest
   ```
2. Run phpLiteAdmin:
   ```bash
   docker run -d \
     --name phpliteadmin \
     -p 127.0.0.1:80:80 \
     -v pusher_alt_db:/db \
     -e PASSWORD=43lw9rj2 \
     -e LOCATION=/db \
     -e TZ=Asia/Makassar \
     vtacquet/phpliteadmin:latest
   ```
   - Access phpLiteAdmin at `http://127.0.0.1:80`.
   - Log in with the password `43lw9rj2`.

#### Option 2: Install phpLiteAdmin Locally
1. Download phpLiteAdmin from [its GitHub repository](https://github.com/phpLiteAdmin/phpLiteAdmin).
2. Set up a PHP server (e.g., using `php -S 127.0.0.1:80`) and point it to the phpLiteAdmin directory.
3. Configure phpLiteAdmin to point to your LibSQL database directory (`./pusher_alt_db`).
4. Set the password to `43lw9rj2` in the phpLiteAdmin configuration.

### 4. Set Up the Node.js App

#### Configure Environment Variables
Create a `.env` file in the main directory with the following:
```bash
DATABASE_URL=http://127.0.0.1:8080
DATABASE_AUTH_TOKEN=43lw9rj2
JWT_SECRET=your-jwt-secret
```

#### Install Dependencies
1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Install Node.js dependencies:
   ```bash
   npm run drizzle_push
   ```

#### Run the App
Start the Node.js app:
```bash
npm run dev
```
- The app will run on port `4321` (e.g., `http://127.0.0.1:4321`).
- Test the root endpoint: `curl http://127.0.0.1:4321`

### 5. Enter Database Base WebApp (Optional)

If your app requires database migrations, you can apply them manually:
1. Open phpLiteAdmin in your browser (`http://127.0.0.1:80`).
2. Log in with the password `43lw9rj2`.
3. Create or modify tables as needed (e.g., using SQL scripts from your app’s schema in `src/db/schema/`).

### 6. Access the Services

- **Node.js App (API)**: Access the API at `http://127.0.0.1:4321`.
- **LibSQL Server**: The database server runs at `http://127.0.0.1:8080`.
- **phpLiteAdmin**: Access the database admin interface at `http://127.0.0.1:80` (if set up).

## Environment Variables

The following environment variables are used:

- `DATABASE_URL`: The URL of the LibSQL server (default: `http://127.0.0.1:8080`).
- `DATABASE_AUTH_TOKEN`: The auth token for LibSQL (default: `43lw9rj2`).
- `JWT_SECRET`: The secret for JWT authentication (set in `.env`).
- `TZ`: Timezone for phpLiteAdmin (default: `Asia/Makassar`).

## Storage

- **Database Files**: Store LibSQL database files in a directory (e.g., `./pusher_alt_db`) or a Docker volume (`pusher_alt_db`).
- **App Code**: The Node.js app code is in the `image_node` directory.

## Troubleshooting

- **Port Conflicts**: If ports `4321`, `8080`, or `80` are in use, change the port mappings or stop conflicting services.
- **Database Connection Issues**: Ensure the `DATABASE_URL` and `DATABASE_AUTH_TOKEN` match between the app and LibSQL server.
- **phpLiteAdmin Access**: If you can’t log in, verify the `PASSWORD` (`43lw9rj2`).

## Development Notes

- The Node.js app uses Hono as the web framework and Drizzle ORM for database interactions.
- Real-time messaging is implemented with Socket.IO on the `/ws` path.
- To run migrations programmatically, you can create a script using Drizzle ORM (see `src/db/schema/`).

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

MIT License