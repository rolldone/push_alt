import { Hono } from 'hono';
import db from '../db';
import { corsEntriesTable } from '../db/schema/cors';
import { eq } from 'drizzle-orm';

const corsController = new Hono();

// Utility function to validate URLs
function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}

// GET /api/cors - List all CORS entries
corsController.get('/', async (c) => {
    try {
        const corsEntries = await db.select().from(corsEntriesTable);
        return c.json({ success: true, data: corsEntries });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error fetching CORS entries' }, 500);
    }
});

// POST /api/cors - Add a new CORS entry
corsController.post('/', async (c) => {
    const body = await c.req.json();
    const { url } = body;

    if (!url || !isValidUrl(url)) {
        return c.json({ success: false, message: 'Invalid URL' }, 400);
    }

    try {
        const existingEntry = await db.select().from(corsEntriesTable).where(eq(corsEntriesTable.url, url)).limit(1);
        if (existingEntry.length > 0) {
            return c.json({ success: false, message: 'URL already exists' }, 409);
        }

        const [newEntry] = await db.insert(corsEntriesTable).values({ url }).returning();
        return c.json({ success: true, data: newEntry, message: 'CORS entry added successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error adding CORS entry' }, 500);
    }
});

// DELETE /api/cors/:id - Remove a CORS entry
corsController.delete('/:id', async (c) => {
    const { id } = c.req.param();

    try {
        const deleted = await db.delete(corsEntriesTable).where(eq(corsEntriesTable.id, parseInt(id)));
        if (deleted.rowsAffected === 0) {
            return c.json({ success: false, message: 'CORS entry not found' }, 404);
        }
        return c.json({ success: true, message: 'CORS entry deleted successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error deleting CORS entry' }, 500);
    }
});

// PUT /api/cors/:id - Edit a CORS entry
corsController.put('/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { url } = body;

    if (!url || !isValidUrl(url)) {
        return c.json({ success: false, message: 'Invalid URL' }, 400);
    }

    try {
        const existingEntry = await db.select().from(corsEntriesTable).where(eq(corsEntriesTable.url, url)).limit(1);
        if (existingEntry.length > 0 && existingEntry[0].id !== parseInt(id)) {
            return c.json({ success: false, message: 'URL already exists' }, 409);
        }

        const updated = await db.update(corsEntriesTable).set({ url }).where(eq(corsEntriesTable.id, parseInt(id)));
        if (updated.rowsAffected === 0) {
            return c.json({ success: false, message: 'CORS entry not found' }, 404);
        }
        return c.json({ success: true, message: 'CORS entry updated successfully' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message || 'Error updating CORS entry' }, 500);
    }
});

export default corsController;
