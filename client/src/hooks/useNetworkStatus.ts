import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService.js';
import { SyncStatusState } from '../types/lead.js';

export function useNetworkStatus(): SyncStatusState & { triggerSync: () => Promise<void> } {
  const [status, setStatus] = useState<SyncStatusState>(syncService.getState());

  useEffect(() => {
    const unsubscribe = syncService.subscribe((newState) => {
      setStatus(newState);
    });
    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    await syncService.triggerSync();
  };

  return { ...status, triggerSync };
}
