import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db';
import { usersTable } from '../db/schema/user';
import { and, eq } from 'drizzle-orm';
import { JWT_SECRET } from '../utils/var';
import dayjs from 'dayjs';
import { refreshTokensTable } from '../db/schema';
import { randomBytes } from 'crypto';

const authController = new Hono();

// POST /api/login
authController.post('/auth/login', async (c) => {
    const { email, password } = await c.req.json();

    const user = await db.select().from(usersTable).where(and(eq(usersTable.email, email), eq(usersTable.status, "active"))).limit(1);

    if (user.length === 0) {
        return c.json({ success: false, message: 'User not found' }, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
        return c.json({ success: false, message: 'Invalid password' }, 401);
    }

    // Generate access token (short-lived, 1 hour)
    const accessToken = jwt.sign(
        { id: user[0].id, email: user[0].email, role: user[0].role, is_root: user[0].is_root },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Generate refresh token (long-lived, e.g., 7 days)
    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(refreshTokensTable).values({
        user_id: user[0].id,
        token: refreshToken,
        expires_at: dayjs(refreshTokenExpiresAt).format("YYYY-MM-DD HH:mm:ss"),
    });

    return c.json({
        success: true,
        message: 'Login successful',
        data: {
            email: user[0].email,
            name: user[0].name,
            type: 'Bearer',
            access_token: accessToken,
            refresh_token: refreshToken,
        },
    });
});

// POST /api/refresh
authController.post('/auth/refresh', async (c) => {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
        return c.json({ success: false, message: 'Refresh token required' }, 400);
    }

    try {
        const tokenRecord = await db.select()
            .from(refreshTokensTable)
            .where(eq(refreshTokensTable.token, refresh_token))
            .limit(1);

        if (!tokenRecord.length) {
            return c.json({ success: false, message: 'Invalid refresh token' }, 401);
        }

        const expiresAt = new Date(tokenRecord[0].expires_at);
        if (expiresAt < new Date()) {
            await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token, refresh_token));
            return c.json({ success: false, message: 'Refresh token expired' }, 401);
        }

        const user = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, tokenRecord[0].user_id))
            .limit(1);

        if (!user.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: user[0].id, email: user[0].email, role: user[0].role, is_root: user[0].is_root },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return c.json({
            success: true,
            message: 'Token refreshed',
            data: { access_token: newAccessToken },
        });
    } catch (err: any) {
        return c.json({ success: false, message: 'Invalid refresh token' }, 401);
    }
});

// POST /api/logout
authController.post('/auth/logout', async (c) => {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
        return c.json({ success: false, message: 'Refresh token required' }, 400);
    }

    try {
        const tokenRecord = await db.select()
            .from(refreshTokensTable)
            .where(eq(refreshTokensTable.token, refresh_token))
            .limit(1);

        if (!tokenRecord.length) {
            return c.json({ success: false, message: 'Invalid refresh token' }, 400);
        }

        // Delete the refresh token from the database
        await db.delete(refreshTokensTable)
            .where(eq(refreshTokensTable.token, refresh_token));

        return c.json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: 'Error logging out' }, 500);
    }
});

// GET /api/auth/profile
authController.get('/auth/profile', async (c) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return c.json({ success: false, message: 'No token provided' }, 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        const user = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.id))
            .limit(1);

        if (!user.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        const { password, ...userData } = user[0];
        return c.json({ success: true, data: userData });
    } catch (err: any) {
        return c.json({ success: false, message: 'Invalid token' }, 401);
    }
});

// PUT /api/auth/profile/update
authController.put('/auth/profile/update', async (c) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return c.json({ success: false, message: 'No token provided' }, 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        const body = await c.req.json();
        const { name, email, password } = body;

        if (!name || !email) {
            return c.json({ success: false, message: 'Name and email are required' }, 400);
        }

        const updateData: any = {
            name,
            email,
            updated_at: new Date(),
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.id))
            .limit(1);

        if (!updatedUser.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        await db.update(usersTable)
            .set(updateData)
            .where(eq(usersTable.id, decoded.id));

        const { password: _, ...userData } = updatedUser[0];
        return c.json({ success: true, data: userData, message: 'Profile updated successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error updating profile' }, 500);
    }
});

export default authController;