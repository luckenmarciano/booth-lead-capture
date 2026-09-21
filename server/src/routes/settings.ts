import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { broadcastEvent } from '../index.js';
import { upload, deleteVideoFile, VIDEOS_DIR } from '../lib/videoStorage.js';

export const settingsRouter = Router();

// Serve uploaded video files (mounted at /api/settings/uploads via settingsRouter)
settingsRouter.use('/uploads', express.static(VIDEOS_DIR));

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

function handleVideoUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('video')(req, res, (err: any) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file melebihi batas 200MB'
          : err.message === 'INVALID_FILE_TYPE'
          ? 'Tipe file tidak didukung. Gunakan MP4, WebM, MKV, atau MOV'
          : 'Gagal mengunggah video';
      return res.status(400).json({ success: false, error: message });
    }
    next();
  });
}

// POST /api/settings/video - Upload (or replace) the server-hosted screensaver video
settingsRouter.post('/video', handleVideoUpload, (req: Request, res: Response) => {
  try {
    const current = db.getSettings();

    if (current.admin_pin && req.body.provided_pin !== current.admin_pin) {
      if (req.file) deleteVideoFile(req.file.filename);
      return res.status(401).json({ success: false, error: 'PIN Admin tidak valid' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Tidak ada file video yang diunggah' });
    }

    // Replace: remove the previous server video file, if any.
    if (current.video_server_filename) {
      deleteVideoFile(current.video_server_filename);
    }

    const updated = db.updateSettings({
      video_source: 'server',
      video_server_url: `/settings/uploads/${req.file.filename}`,
      video_server_filename: req.file.filename,
      video_server_original_name: req.file.originalname,
      video_server_size: req.file.size
    });

    broadcastEvent('settings_updated', updated);

    res.json({
      success: true,
      message: 'Video berhasil diunggah ke server',
      data: updated
    });
  } catch (err: any) {
    if (req.file) deleteVideoFile(req.file.filename);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/settings/video - Remove the server-hosted video
settingsRouter.delete('/video', (req: Request, res: Response) => {
  try {
    const current = db.getSettings();
    if (current.admin_pin && req.body.provided_pin !== current.admin_pin) {
      return res.status(401).json({ success: false, error: 'PIN Admin tidak valid' });
    }

    deleteVideoFile(current.video_server_filename);

    const updated = db.updateSettings({
      video_source: 'url',
      video_server_url: undefined,
      video_server_filename: undefined,
      video_server_original_name: undefined,
      video_server_size: undefined
    });

    broadcastEvent('settings_updated', updated);

    res.json({ success: true, message: 'Video server dihapus', data: updated });
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
