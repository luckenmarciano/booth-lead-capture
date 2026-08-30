import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { broadcastEvent } from '../index.js';

export const settingsRouter = Router();

// GET /api/settings - Get current booth settings
settingsRouter.get('/', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    // Do not leak admin pin in normal get
    const safeSettings = { ...settings, admin_pin_configured: Boolean(settings.admin_pin) };
    res.json({ success: true, data: safeSettings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings - Update booth settings
settingsRouter.put('/', (req: Request, res: Response) => {
  try {
    const { admin_pin, ...newSettings } = req.body;
    const current = db.getSettings();

    // Verify PIN if current settings has one
    if (current.admin_pin && req.body.provided_pin !== current.admin_pin) {
      return res.status(401).json({ success: false, error: 'PIN Admin tidak valid' });
    }

    const updated = db.updateSettings({
      ...newSettings,
      ...(admin_pin ? { admin_pin } : {})
    });

    broadcastEvent('settings_updated', updated);

    res.json({
      success: true,
      message: 'Pengaturan booth berhasil diperbarui',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/verify-pin - Check if PIN is correct
settingsRouter.post('/verify-pin', (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const current = db.getSettings();
    if (!current.admin_pin || current.admin_pin === pin) {
      return res.json({ success: true, authorized: true });
    }
    return res.status(401).json({ success: false, authorized: false, error: 'PIN Salah' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/logs - Get sync logs
settingsRouter.get('/logs', (req: Request, res: Response) => {
  try {
    const logs = db.getLogs();
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
