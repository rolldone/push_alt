import { type Context, type Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const AdminMiddleware = async (c: Context, next: Next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return c.json({ success: false, message: 'No token provided' }, 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; is_root: boolean };
        c.set('user', decoded); // Store user data for use in handlers
        await next();
    } catch (err: any) {
        return c.json({ success: false, message: 'Invalid token' }, 401);
    }
};

export default AdminMiddleware