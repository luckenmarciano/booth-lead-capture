import { Lead, BoothSettings, LeadStats } from '../types/lead';

let customApiBaseUrl: string | null = null;

export function setApiBaseUrl(url: string) {
  customApiBaseUrl = url ? url.replace(/\/+$/, '') : null;
}

export function getApiBaseUrl(): string {
  if (customApiBaseUrl) return customApiBaseUrl;
  const saved = localStorage.getItem('api_base_url');
  if (saved) return saved.replace(/\/+$/, '');
  return '/api';
}

export async function fetchLeads(filters?: { search?: string; interest?: string; source?: string }): Promise<{ success: boolean; data: Lead[] }> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.interest) params.append('interest', filters.interest);
  if (filters?.source) params.append('source', filters.source);

  const res = await fetch(`${base}/leads?${params.toString()}`, {
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchStats(): Promise<{ success: boolean; data: LeadStats }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/leads/stats`, {
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function createLeadApi(lead: Partial<Lead>): Promise<{ success: boolean; data: Lead }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export async function batchSyncLeadsApi(leads: Lead[]): Promise<{ success: boolean; inserted: number; updated: number }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/leads/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads }),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export async function deleteLeadApi(id: string): Promise<{ success: boolean }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/leads/${id}`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchSettingsApi(): Promise<{ success: boolean; data: BoothSettings }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/settings`, {
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function updateSettingsApi(settings: Partial<BoothSettings>, providedPin?: string): Promise<{ success: boolean; data: BoothSettings }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...settings, provided_pin: providedPin }),
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export async function verifyAdminPinApi(pin: string): Promise<boolean> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/settings/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
      signal: AbortSignal.timeout(5000)
    });
    return res.ok;
  } catch {
    // If backend is offline, check local saved PIN
    const raw = localStorage.getItem('admin_pin') || '1234';
    return raw === pin;
  }
}

export async function testGoogleSheetsApi(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/integrations/sheets/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhook_url: webhookUrl }),
    signal: AbortSignal.timeout(10000)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal terhubung ke Google Sheets Webhook');
  return data;
}

export async function getGoogleSheetsTemplateApi(): Promise<string> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/integrations/sheets/template`);
    const data = await res.json();
    return data.template;
  } catch {
    return '// Google Apps Script Webhook Template\nfunction doPost(e) { /* ... */ }';
  }
}
