import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const integrationsRouter = Router();

// Ready-to-copy Google Apps Script Code for Google Sheets
const APPS_SCRIPT_TEMPLATE = `
/**
 * GOOGLE APPS SCRIPT - BOOTH LEAD CAPTURE WEBHOOK
 * Cara Pasang:
 * 1. Buka Google Sheets baru -> Menu "Extensions" (Ekstensi) -> "Apps Script".
 * 2. Hapus semua kode default, lalu paste kode ini.
 * 3. Klik tombol "Deploy" (Terapkan) -> "New deployment" (Penerapan baru).
 * 4. Pilih tipe "Web app" (Aplikasi web).
 * 5. Set "Execute as": "Me" (Saya), dan "Who has access": "Anyone" (Siapa saja).
 * 6. Klik "Deploy" -> Salin URL Web App dan tempelkan ke Pengaturan Aplikasi Booth.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Inisialisasi Header otomatis jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu",
        "ID Lead",
        "Nama Lengkap",
        "Perusahaan",
        "Jabatan",
        "Nomor WhatsApp",
        "Email",
        "Minat Produk",
        "Preferensi Follow-Up",
        "Catatan",
        "Sumber",
        "Booth ID"
      ]);
      // Format header tebal dan background biru modern
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#e0f2fe");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.id || "-",
      data.fullName || "-",
      data.company || "-",
      data.jobTitle || "-",
      data.whatsapp || "-",
      data.email || "-",
      data.interests || "-",
      data.followUpPref || "-",
      data.notes || "-",
      data.source || "-",
      data.boothId || "-"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Lead saved" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`.trim();

// GET /api/integrations/sheets/template - Get Google Apps Script code
integrationsRouter.get('/sheets/template', (req: Request, res: Response) => {
  res.json({
    success: true,
    template: APPS_SCRIPT_TEMPLATE
  });
});

// POST /api/integrations/sheets/test - Test Google Sheets webhook
integrationsRouter.post('/sheets/test', async (req: Request, res: Response) => {
  try {
    const { webhook_url } = req.body;
    if (!webhook_url) {
      return res.status(400).json({ success: false, error: 'URL Webhook Google Sheets wajib diisi' });
    }

    const testPayload = {
      timestamp: new Date().toISOString(),
      id: 'TEST_' + Date.now(),
      fullName: 'Budi Santoso (Test Sync)',
      company: 'PT Maju Bersama Tech',
      jobTitle: 'Chief Technology Officer',
      whatsapp: '+6281234567890',
      email: 'budi.test@majubersama.com',
      interests: 'AI & Automation Solutions, Cloud Infrastructure',
      followUpPref: 'Jadwalkan Demo Langsung',
      notes: 'Testing integrasi Google Sheets dari Booth Lead Capture App',
      source: 'manual_admin',
      boothId: 'BOOTH-TEST'
    };

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      db.addLog('Test Webhook', 1, 'success', 'Tes pengiriman lead ke Google Sheets berhasil!');
      return res.json({
        success: true,
        message: 'Koneksi ke Google Sheets Webhook berhasil! Data tes telah terkirim ke spreadsheet Anda.'
      });
    } else {
      const errText = await response.text();
      return res.status(400).json({
        success: false,
        error: `Google Sheets mengembalikan status ${response.status}: ${errText}`
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `Gagal menghubungi Google Sheets Webhook: ${err?.message || err}`
    });
  }
});
