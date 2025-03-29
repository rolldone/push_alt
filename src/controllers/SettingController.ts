import { Hono } from 'hono';
import db from '../db';
import { settingTable } from '../db/schema/setting';
import { eq } from 'drizzle-orm';

const settingController = new Hono();

// POST /api/setting/add_or_update
settingController.post('/add_or_update', async (c) => {
  const body = await c.req.json();
  const { name, value } = body;

  if (!name || !value) {
    return c.json({ success: false, message: 'Name and value are required' }, 400);
  }

  try {
    await db.insert(settingTable)
      .values({
        name,
        value,
        created_at: new Date(),
      })
      .onConflictDoUpdate({
        target: settingTable.name,
        set: { value },
      });

    return c.json({ success: true, message: 'Setting updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error updating setting' }, 500);
  }
});

// POST /api/setting/update_form_setting
settingController.post('/update_form_setting', async (c) => {
  const formData = await c.req.formData();
  const settingsObject: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    settingsObject[key] = String(value);
  }

  const settingsArray = Object.entries(settingsObject).map(([name, value]) => ({
    name,
    value,
  }));

  if (!settingsArray.length) {
    return c.json({ success: false, message: 'No settings provided' }, 400);
  }

  try {
    for (const setting of settingsArray) {
      await db.insert(settingTable)
        .values({
          name: setting.name,
          value: setting.value,
          created_at: new Date(),
        })
        .onConflictDoUpdate({
          target: settingTable.name,
          set: { value: setting.value },
        });
    }

    return c.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error updating settings' }, 500);
  }
});

// GET /api/setting/:name/view
settingController.get('/:name/view', async (c) => {
  const { name } = c.req.param();

  try {
    const setting = await db.select()
      .from(settingTable)
      .where(eq(settingTable.name, name))
      .limit(1);

    if (!setting.length) {
      return c.json({ success: false, message: 'Setting not found' }, 404);
    }

    return c.json({ success: true, data: setting[0] });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error fetching setting' }, 500);
  }
});

// GET /api/setting/settings
settingController.get('/settings', async (c) => {
  try {
    const settings = await db.select().from(settingTable);
    return c.json({ success: true, data: settings });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error fetching settings' }, 500);
  }
});

// GET /api/setting/gets_form_setting
settingController.get('/gets_form_setting', async (c) => {
  try {
    const settings = await db.select().from(settingTable);
    const settingsObject = settings.reduce((obj, setting) => {
      obj[setting.name] = setting.value;
      return obj;
    }, {} as Record<string, string>);

    return c.json({ success: true, data: settingsObject });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error fetching settings' }, 500);
  }
});

// GET /api/setting/last_installed
settingController.get('/last_installed', async (c) => {
  try {
    const setting = await db.select()
      .from(settingTable)
      .where(eq(settingTable.name, 'installed_at'))
      .limit(1);

    if (!setting.length) {
      return c.json({ success: false, message: 'Installed_at setting not found' }, 404);
    }

    return c.json({ success: true, data: setting[0] });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Error fetching installed_at' }, 500);
  }
});

export default settingController;