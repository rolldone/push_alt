import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import db from '../db';
import { usersTable } from '../db/schema/user';
import { eq } from 'drizzle-orm';

const adminController = new Hono();

// POST /api/admin/add
adminController.post('/add', async (c) => {
    const body = await c.req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return c.json({ success: false, message: 'Name, email, and password are required' }, 400);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(usersTable).values({
            name,
            email,
            password: hashedPassword,
            status: 'active',
            role: 'user',
        });

        const newUser = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        const { password: _, ...userData } = newUser[0];
        return c.json({ success: true, data: userData, message: 'User added successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error adding user' }, 500);
    }
});

// PUT /api/admin/update
adminController.put('/update', async (c) => {
    const body = await c.req.json();
    const { id, name, email, password, status } = body;

    if (!id || !name || !email) {
        return c.json({ success: false, message: 'ID, name, and email are required' }, 400);
    }

    try {
        const updateData: any = {
            name,
            email,
            status,
            updated_at: new Date(),
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await db.update(usersTable)
            .set(updateData)
            .where(eq(usersTable.id, id));

        const updatedUser = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);

        if (!updatedUser.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        const { password: _, ...userData } = updatedUser[0];
        return c.json({ success: true, data: userData, message: 'User updated successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error updating user' }, 500);
    }
});

// POST /api/admin/restore
adminController.post('/restore', async (c) => {
    const body = await c.req.json();
    const { id } = body;

    if (!id) {
        return c.json({ success: false, message: 'User ID is required' }, 400);
    }

    try {
        await db.update(usersTable)
            .set({ status: 'active' })
            .where(eq(usersTable.id, id));

        const updatedUser = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);

        if (!updatedUser.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        const { password: _, ...userData } = updatedUser[0];
        return c.json({ success: true, data: userData, message: 'User restored successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error restoring user' }, 500);
    }
});

// GET /api/admin/:id/view
adminController.get('/:id/view', async (c) => {
    const { id } = c.req.param();

    try {
        const user = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, parseInt(id)))
            .limit(1);

        if (!user.length) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        const { password: _, ...userData } = user[0];
        return c.json({ success: true, data: userData });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error fetching user' }, 500);
    }
});

// GET /api/admin/admins
adminController.get('/admins', async (c) => {
    const take = parseInt(c.req.query('take') || '10');
    const skip = parseInt(c.req.query('skip') || '0');

    try {
        const users = await db.select()
            .from(usersTable)
            .where(eq(usersTable.is_root, false))
            .limit(take)
            .offset(skip);

        const usersWithoutPassword = users.map(user => {
            const { password: _, ...userData } = user;
            return userData;
        });

        return c.json({ success: true, data: usersWithoutPassword });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error fetching users' }, 500);
    }
});

export default adminController;