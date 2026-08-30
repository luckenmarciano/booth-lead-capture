import { Lead, SyncStatusState } from '../types/lead.js';
import { offlineDB } from './db.js';
import { createLeadApi, batchSyncLeadsApi } from './api.js';

type SyncListener = (state: SyncStatusState) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private state: SyncStatusState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    lastError: null
  };
  private autoSyncInterval: any = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.updateState({ isOnline: true, lastError: null });
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.updateState({ isOnline: false });
    });

    // Check pending count initially
    this.refreshPendingCount();

    // Periodic sync check every 45s if there are pending items
    this.autoSyncInterval = setInterval(() => {
      if (this.state.isOnline && this.state.pendingCount > 0 && !this.state.isSyncing) {
        this.triggerSync();
      }
    }, 45000);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): SyncStatusState {
    return { ...this.state };
  }

  private updateState(partial: Partial<SyncStatusState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  public async refreshPendingCount(): Promise<number> {
    const pending = await offlineDB.getPendingSyncLeads();
    this.updateState({ pendingCount: pending.length });
    return pending.length;
  }

  /**
   * Save a new lead with offline-first reliability
   */
  public async submitLead(leadData: Omit<Lead, 'created_at' | 'updated_at' | 'sync_status'>): Promise<{ lead: Lead; synced: boolean }> {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      sync_status: 'pending',
      created_at: now,
      updated_at: now
    };

    // 1. Save immediately to IndexedDB
    await offlineDB.saveLeadLocally(newLead);
    await this.refreshPendingCount();

    // 2. Try online sync if connected
    if (this.state.isOnline) {
      try {
        const response = await createLeadApi(newLead);
        if (response.success) {
          await offlineDB.markLeadAsSynced(newLead.id);
          await this.refreshPendingCount();
          this.updateState({ lastSyncedAt: new Date().toLocaleTimeString('id-ID'), lastError: null });
          return { lead: response.data || newLead, synced: true };
        }
      } catch (err: any) {
        console.warn('[SyncService] Online submit failed, kept in offline queue:', err);
        this.updateState({ lastError: err?.message || 'Sync gagal, tersimpan lokal' });
      }
    }

    return { lead: newLead, synced: false };
  }

  /**
   * Batch sync all pending leads to backend VPS
   */
  public async triggerSync(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.state.isSyncing) return { success: false, syncedCount: 0 };

    const pending = await offlineDB.getPendingSyncLeads();
    if (pending.length === 0) {
      this.updateState({ pendingCount: 0 });
      return { success: true, syncedCount: 0 };
    }

    this.updateState({ isSyncing: true, lastError: null });

    try {
      const response = await batchSyncLeadsApi(pending);
      if (response.success) {
        for (const lead of pending) {
          await offlineDB.markLeadAsSynced(lead.id);
        }
        await this.refreshPendingCount();
        this.updateState({
          isSyncing: false,
          lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
          lastError: null
        });
        return { success: true, syncedCount: pending.length };
      } else {
        throw new Error('Server returned unsuccessful sync');
      }
    } catch (err: any) {
      console.warn('[SyncService] Batch sync failed:', err);
      this.updateState({
        isSyncing: false,
        lastError: err?.message || 'Gagal sinkronisasi data ke cloud'
      });
      return { success: false, syncedCount: 0 };
    }
  }
}

export const syncService = new SyncService();
