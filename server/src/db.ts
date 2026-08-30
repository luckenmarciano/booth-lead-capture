import fs from 'fs';
import path from 'path';

export interface Lead {
  id: string;
  full_name: string;
  company: string;
  city?: string;
  job_title?: string;
  whatsapp: string;
  email?: string;
  interests: string[];
  follow_up_pref?: string;
  notes?: string;
  signature_url?: string;
  source: 'kiosk_tablet' | 'mobile_qr' | 'manual_admin';
  booth_id: string;
  sync_status: 'synced' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface BoothSettings {
  booth_id: string;
  company_name: string;
  tagline: string;
  kiosk_venue?: string;
  date_range?: string;
  video_url: string;
  video_enabled: boolean;
  idle_timeout_sec: number;
  default_interests: string[];
  gsheets_webhook_url: string;
  gsheets_sync_enabled: boolean;
  vcard_phone: string;
  vcard_email: string;
  vcard_website: string;
  vcard_catalog_url: string;
  admin_pin: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  count: number;
  source: string;
  status: 'success' | 'failed' | 'partial';
  message: string;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'sync_logs.json');

const DEFAULT_SETTINGS: BoothSettings = {
  booth_id: 'BOOTH-A12',
  company_name: 'SpillAsia 2026',
  tagline: 'Leading Marine & Industrial Environmental Solutions',
  kiosk_venue: 'Jakarta Convention Center',
  date_range: '09 – 11 Sept 2026',
  video_url: 'https://www.youtube.com/watch?v=xgznJcRRUOw',
  video_enabled: true,
  idle_timeout_sec: 60,
  default_interests: [
    'Oil Spill Combat Team',
    'Slickbar Oil Boom & Skimmer',
    'Industrial Wastewater Treatment',
    'Environmental Emergency Response',
    'Marine Safety & Containment Equipment'
  ],
  gsheets_webhook_url: '',
  gsheets_sync_enabled: false,
  vcard_phone: '+6281234567890',
  vcard_email: 'info@spillasia2026.com',
  vcard_website: 'https://spillasia2026.com',
  vcard_catalog_url: 'https://spillasia2026.com/catalog.pdf',
  admin_pin: '1234'
};

const INITIAL_SAMPLE_LEADS: Lead[] = [
  {
    id: 'lead_spill_1',
    full_name: 'Andi Pratama',
    company: 'PT Petrokimia Nusantara',
    city: 'Jakarta',
    job_title: 'HSE Manager',
    whatsapp: '081234567890',
    email: 'andi.pratama@petrokimia.co.id',
    interests: ['Oil Spill Combat Team'],
    follow_up_pref: 'Kirim Brosur via WhatsApp',
    notes: 'Tertarik pelatihan tanggap darurat oil spill dan sertifikasi IMO.',
    source: 'kiosk_tablet',
    booth_id: 'BOOTH-A12',
    sync_status: 'synced',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lead_spill_2',
    full_name: 'Siti Rahma',
    company: 'PT Pelindo Marine',
    city: 'Surabaya',
    job_title: 'Operations Director',
    whatsapp: '081398765432',
    email: 'siti.rahma@pelindomarine.com',
    interests: ['Slickbar Oil Boom & Skimmer'],
    follow_up_pref: 'Jadwalkan Demo Langsung',
    notes: 'Membutuhkan skimmer dan oil boom untuk pelabuhan Tanjung Perak.',
    source: 'mobile_qr',
    booth_id: 'BOOTH-A12',
    sync_status: 'synced',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    updated_at: new Date().toISOString()
  }
];

class Database {
  private leads: Lead[] = [];
  private settings: BoothSettings = DEFAULT_SETTINGS;
  private logs: SyncLog[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(LEADS_FILE)) {
        const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
        this.leads = JSON.parse(raw);
      } else {
        this.leads = [...INITIAL_SAMPLE_LEADS];
        this.saveLeads();
      }

      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } else {
        this.saveSettings();
      }

      if (fs.existsSync(LOGS_FILE)) {
        const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
        this.logs = JSON.parse(raw);
      } else {
        this.saveLogs();
      }

      this.isInitialized = true;
      console.log(`[DB] Database initialized successfully. Loaded ${this.leads.length} leads.`);
    } catch (err) {
      console.error('[DB] Failed to initialize DB:', err);
    }
  }

  private saveLeads() {
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(this.leads, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving leads:', err);
    }
  }

  private saveSettings() {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving settings:', err);
    }
  }

  private saveLogs() {
    try {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs.slice(-200), null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving logs:', err);
    }
  }

  // Leads CRUD
  public getLeads(filters?: { search?: string; interest?: string; source?: string; date?: string }): Lead[] {
    let result = [...this.leads];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          (l.city && l.city.toLowerCase().includes(q)) ||
          l.whatsapp.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }

    if (filters?.interest && filters.interest !== 'all') {
      result = result.filter((l) => l.interests?.includes(filters.interest!));
    }

    if (filters?.source && filters.source !== 'all') {
      result = result.filter((l) => l.source === filters.source);
    }

    if (filters?.date) {
      result = result.filter((l) => l.created_at.startsWith(filters.date!));
    }

    // Sort descending by created_at
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public addLead(leadData: Omit<Lead, 'created_at' | 'updated_at'>): Lead {
    const now = new Date().toISOString();
    const existingIndex = this.leads.findIndex((l) => l.id === leadData.id);

    const fullLead: Lead = {
      ...leadData,
      city: leadData.city || 'Jakarta',
      created_at: existingIndex >= 0 ? this.leads[existingIndex].created_at : now,
      updated_at: now
    };

    if (existingIndex >= 0) {
      this.leads[existingIndex] = fullLead;
    } else {
      this.leads.unshift(fullLead);
    }

    this.saveLeads();
    return fullLead;
  }

  public batchUpsertLeads(leadsList: Lead[]): { inserted: number; updated: number } {
    let inserted = 0;
    let updated = 0;

    for (const lead of leadsList) {
      const existingIdx = this.leads.findIndex((l) => l.id === lead.id);
      const now = new Date().toISOString();
      const item: Lead = {
        ...lead,
        city: lead.city || 'Jakarta',
        sync_status: 'synced',
        created_at: lead.created_at || now,
        updated_at: now
      };

      if (existingIdx >= 0) {
        this.leads[existingIdx] = item;
        updated++;
      } else {
        this.leads.unshift(item);
        inserted++;
      }
    }

    this.saveLeads();
    return { inserted, updated };
  }

  public deleteLead(id: string): boolean {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx >= 0) {
      this.leads.splice(idx, 1);
      this.saveLeads();
      return true;
    }
    return false;
  }

  public clearAllLeads(): void {
    this.leads = [];
    this.saveLeads();
  }

  // Stats
  public getStats() {
    const total = this.leads.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLeads = this.leads.filter((l) => l.created_at.startsWith(todayStr));
    const todayCount = todayLeads.length;

    const sourceBreakdown = {
      kiosk_tablet: this.leads.filter((l) => l.source === 'kiosk_tablet').length,
      mobile_qr: this.leads.filter((l) => l.source === 'mobile_qr').length,
      manual_admin: this.leads.filter((l) => l.source === 'manual_admin').length
    };

    const interestCounts: Record<string, number> = {};
    this.leads.forEach((l) => {
      if (l.interests && Array.isArray(l.interests)) {
        l.interests.forEach((interest) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    const hourlyTraffic: Record<string, number> = {};
    todayLeads.forEach((l) => {
      const hour = new Date(l.created_at).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourlyTraffic[hourKey] = (hourlyTraffic[hourKey] || 0) + 1;
    });

    return {
      total,
      today: todayCount,
      sourceBreakdown,
      interestCounts,
      hourlyTraffic
    };
  }

  // Settings CRUD
  public getSettings(): BoothSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<BoothSettings>): BoothSettings {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.saveSettings();
    return { ...this.settings };
  }

  // Logs
  public addLog(source: string, count: number, status: 'success' | 'failed' | 'partial', message: string): void {
    const log: SyncLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      source,
      count,
      status,
      message
    };
    this.logs.unshift(log);
    this.saveLogs();
  }

  public getLogs(limit = 50): SyncLog[] {
    return this.logs.slice(0, limit);
  }
}

export const db = new Database();
