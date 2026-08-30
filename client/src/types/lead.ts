export type Language = 'id' | 'en';

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
  sync_status: 'synced' | 'pending' | 'failed';
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
  api_base_url?: string;
  admin_pin?: string;
}

export interface LeadStats {
  total: number;
  today: number;
  pendingCount?: number;
  sourceBreakdown: {
    kiosk_tablet: number;
    mobile_qr: number;
    manual_admin: number;
  };
  interestCounts: Record<string, number>;
  hourlyTraffic: Record<string, number>;
}

export type AppMode = 'kiosk' | 'mobile' | 'admin' | 'standee';

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}
