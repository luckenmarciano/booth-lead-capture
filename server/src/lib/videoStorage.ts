import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { DATA_DIR } from '../db.js';

export const VIDEOS_DIR = path.join(DATA_DIR, 'videos');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.mp4', '.webm', '.mkv', '.mov']);
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!file.mimetype.startsWith('video/') || !ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  }
});

export function deleteVideoFile(filename?: string): void {
  if (!filename) return;
  try {
    const filePath = path.join(VIDEOS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('[VideoStorage] Failed to delete video file:', filename, err);
  }
}
