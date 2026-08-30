import { Router, Request, Response } from 'express';
import { db, Lead } from '../db.js';
import { broadcastEvent } from '../index.js';

export const leadsRouter = Router();

// Helper to trigger Google Sheets Webhook forwarding
async function forwardToGoogleSheets(lead: Lead) {
  try {
    const settings = db.getSettings();
    if (!settings.gsheets_sync_enabled || !settings.gsheets_webhook_url) {
      return;
    }

    const payload = {
      timestamp: lead.created_at,
      id: lead.id,
      fullName: lead.full_name,
      company: lead.company,
      city: lead.city || 'Jakarta',
      jobTitle: lead.job_title || '-',
      whatsapp: lead.whatsapp,
      email: lead.email || '-',
      interests: Array.isArray(lead.interests) ? lead.interests.join(', ') : lead.interests,
      followUpPref: lead.follow_up_pref || '-',
      notes: lead.notes || '-',
      source: lead.source,
      boothId: lead.booth_id || settings.booth_id
    };

    const res = await fetch(settings.gsheets_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      db.addLog('Google Sheets Webhook', 1, 'success', `Forwarded lead ${lead.full_name} (${lead.company}) to Google Sheets`);
    } else {
      db.addLog('Google Sheets Webhook', 1, 'failed', `Webhook returned status ${res.status}`);
    }
  } catch (err: any) {
    db.addLog('Google Sheets Webhook', 1, 'failed', `Error forwarding to Google Sheets: ${err?.message || err}`);
  }
}

// GET /api/leads - List leads with filters
leadsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { search, interest, source, date } = req.query;
    const leads = db.getLeads({
      search: search as string,
      interest: interest as string,
      source: source as string,
      date: date as string
    });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/leads/stats - Summary statistics
leadsRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/leads - Create single lead
leadsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      full_name,
      company,
      city,
      job_title,
      whatsapp,
      email,
      interests,
      follow_up_pref,
      notes,
      signature_url,
      source,
      booth_id
    } = req.body;

    if (!full_name || !whatsapp) {
      return res.status(400).json({
        success: false,
        error: 'Nama Lengkap dan Nomor WhatsApp wajib diisi'
      });
    }

    const leadId = id || 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const settings = db.getSettings();

    const createdLead = db.addLead({
      id: leadId,
      full_name: full_name.trim(),
      company: (company || '-').trim(),
      city: (city || 'Jakarta').trim(),
      job_title: (job_title || '').trim(),
      whatsapp: whatsapp.trim(),
      email: (email || '').trim(),
      interests: Array.isArray(interests) ? interests : [],
      follow_up_pref: follow_up_pref || 'Kirim Brosur via WhatsApp',
      notes: (notes || '').trim(),
      signature_url: signature_url || '',
      source: source || 'kiosk_tablet',
      booth_id: booth_id || settings.booth_id,
      sync_status: 'synced'
    });

    // Broadcast SSE real-time event to connected admin dashboards and kiosk tablets
    broadcastEvent('lead_created', createdLead);
    broadcastEvent('stats_updated', db.getStats());

    // Async forward to Google Sheets if configured
    forwardToGoogleSheets(createdLead).catch((e) => console.error('[GSheets Sync] Error:', e));

    res.status(201).json({
      success: true,
      message: 'Data pengunjung berhasil disimpan',
      data: createdLead
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/leads/batch - Batch sync endpoint for offline queue sync
leadsRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar leads tidak valid atau kosong' });
    }

    const result = db.batchUpsertLeads(leads);

    // Forward each synced lead to Google Sheets
    for (const lead of leads) {
      forwardToGoogleSheets(lead).catch((e) => console.error('[GSheets Batch Sync] Error:', e));
    }

    db.addLog('Offline Sync Client', leads.length, 'success', `Berhasil menyinkronkan ${leads.length} data pengunjung dari mode offline`);

    broadcastEvent('leads_synced', { count: leads.length, ...result });
    broadcastEvent('stats_updated', db.getStats());

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${leads.length} data pengunjung`,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/leads/export - Export leads to CSV / JSON
leadsRouter.get('/export', (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || 'csv';
    const leads = db.getLeads();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=leads_booth_${Date.now()}.json`);
      return res.send(JSON.stringify(leads, null, 2));
    }

    // Default CSV
    const headers = [
      'ID',
      'Waktu Daftar',
      'Nama Lengkap',
      'Perusahaan',
      'Kota',
      'Nomor WhatsApp',
      'Email',
      'Minat Produk',
      'Preferensi Follow-up',
      'Catatan',
      'Sumber',
      'Booth ID'
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.created_at).toLocaleString('id-ID')}"`,
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${l.whatsapp}"`,
      `"${l.email || ''}"`,
      `"${(Array.isArray(l.interests) ? l.interests.join('; ') : '').replace(/"/g, '""')}"`,
      `"${(l.follow_up_pref || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.booth_id}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=leads_booth_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/leads/:id - Delete single lead
leadsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteLead(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Lead tidak ditemukan' });
    }

    broadcastEvent('lead_deleted', { id });
    broadcastEvent('stats_updated', db.getStats());

    res.json({ success: true, message: 'Data pengunjung berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
