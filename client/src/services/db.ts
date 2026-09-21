import { Lead, BoothSettings } from '../types/lead';
import { DEFAULT_SETTINGS, SAMPLE_INITIAL_LEADS } from '../data/defaultData';

const DB_NAME = 'BoothLeadCaptureDB';
const DB_VERSION = 2;
const STORE_LEADS = 'leads';
const STORE_SETTINGS = 'settings';
const STORE_MEDIA = 'media';

class OfflineDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.getDB();
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this browser'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_LEADS)) {
          const leadStore = db.createObjectStore(STORE_LEADS, { keyPath: 'id' });
          leadStore.createIndex('sync_status', 'sync_status', { unique: false });
          leadStore.createIndex('created_at', 'created_at', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- LEADS ---
  public async saveLeadLocally(lead: Lead): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_LEADS, 'readwrite');
        const store = tx.objectStore(STORE_LEADS);
        store.put(lead);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Falling back to localStorage for saveLead:', err);
      const existing = this.getLocalStorageLeads();
      const idx = existing.findIndex((l) => l.id === lead.id);
      if (idx >= 0) existing[idx] = lead;
      else existing.unshift(lead);
      localStorage.setItem('offline_leads', JSON.stringify(existing));
    }
  }

  public async getLocalLeads(): Promise<Lead[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_LEADS, 'readonly');
        const store = tx.objectStore(STORE_LEADS);
        const request = store.getAll();
        request.onsuccess = () => {
          let list: Lead[] = request.result || [];
          if (list.length === 0) {
            // Seed initial sample leads for demo convenience
            list = SAMPLE_INITIAL_LEADS;
            for (const sample of SAMPLE_INITIAL_LEADS) {
              this.saveLeadLocally(sample);
            }
          }
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Fallback localStorage getLeads:', err);
      const list = this.getLocalStorageLeads();
      return list.length > 0 ? list : SAMPLE_INITIAL_LEADS;
    }
  }

  public async getPendingSyncLeads(): Promise<Lead[]> {
    try {
      const all = await this.getLocalLeads();
      return all.filter((l) => l.sync_status === 'pending' || l.sync_status === 'failed');
    } catch {
      return [];
    }
  }

  public async markLeadAsSynced(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_LEADS, 'readwrite');
        const store = tx.objectStore(STORE_LEADS);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const lead = getReq.result as Lead | undefined;
          if (lead) {
            lead.sync_status = 'synced';
            lead.updated_at = new Date().toISOString();
            store.put(lead);
          }
          resolve();
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (err) {
      const existing = this.getLocalStorageLeads();
      const item = existing.find((l) => l.id === id);
      if (item) {
        item.sync_status = 'synced';
        localStorage.setItem('offline_leads', JSON.stringify(existing));
      }
    }
  }

  public async deleteLocalLead(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_LEADS, 'readwrite');
        const store = tx.objectStore(STORE_LEADS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const existing = this.getLocalStorageLeads().filter((l) => l.id !== id);
      localStorage.setItem('offline_leads', JSON.stringify(existing));
    }
  }

  // --- SETTINGS ---
  public async saveSettingsLocally(settings: BoothSettings): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SETTINGS, 'readwrite');
        const store = tx.objectStore(STORE_SETTINGS);
        store.put({ key: 'current_settings', ...settings });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      localStorage.setItem('booth_settings', JSON.stringify(settings));
    }
  }

  public async getLocalSettings(): Promise<BoothSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get('current_settings');
        req.onsuccess = () => {
          if (req.result) {
            const { key, ...rest } = req.result;
            resolve({ ...DEFAULT_SETTINGS, ...rest });
          } else {
            resolve(DEFAULT_SETTINGS);
          }
        };
        req.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } catch {
      const raw = localStorage.getItem('booth_settings');
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    }
  }

  private getLocalStorageLeads(): Lead[] {
    try {
      const raw = localStorage.getItem('offline_leads');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // --- MEDIA / LOCAL VIDEO STORAGE ---
  public async saveVideoMedia(
    file: Blob | File,
    name: string,
    type: string,
    size: number
  ): Promise<{ name: string; size: number; type: string }> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const record = {
        id: 'screensaver_video',
        blob: file,
        name: name || 'video.mp4',
        type: type || 'video/mp4',
        size: size || file.size,
        updated_at: new Date().toISOString()
      };
      store.put(record);
      tx.oncomplete = () => {
        resolve({
          name: record.name,
          size: record.size,
          type: record.type
        });
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getVideoMedia(): Promise<{
    blob: Blob;
    name: string;
    type: string;
    size: number;
    updated_at: string;
  } | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MEDIA, 'readonly');
        const store = tx.objectStore(STORE_MEDIA);
        const req = store.get('screensaver_video');
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] getVideoMedia error:', err);
      return null;
    }
  }

  public async deleteVideoMedia(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        store.delete('screensaver_video');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] deleteVideoMedia error:', err);
    }
  }

  public async hasVideoMedia(): Promise<boolean> {
    const media = await this.getVideoMedia();
    return Boolean(media && media.blob);
  }
}

export const offlineDB = new OfflineDB();
