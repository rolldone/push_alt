import { Hono } from "hono";
import { settingTable, usersTable } from "../db/schema";
import db from "../db";
import bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";

const setupController = new Hono();

// GET /api/setup/complete
setupController.get('/complete', (c) => {
    return c.text('Hello Hono with TypeScript!');
});

// POST /api/setup/complete
setupController.post('/complete', async (c) => {
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

export default setupController;