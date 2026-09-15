import { PackingListResultSchema } from './schemas';
import type { PackingListResult, StoredTrip } from './types';

export const STORAGE_KEY = 'packsmart_ai_current_trip';

export type StorageStatus = 'ok' | 'unavailable' | 'quota' | 'error';

/**
 * localStorage can throw on access in private-browsing modes, sandboxed frames,
 * or when cookies/storage are blocked — so every call is guarded.
 * Never store API keys or secrets here: this is user-readable.
 */
function getStore(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const store = window.localStorage;
    const probe = '__packsmart_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  return getStore() !== null;
}

export function loadTrip(): PackingListResult | null {
  const store = getStore();
  if (!store) return null;

  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredTrip>;
    const candidate = parsed?.version === 1 ? parsed.result : parsed;
    const validated = PackingListResultSchema.safeParse(candidate);
    if (!validated.success) {
      // Corrupt or outdated data: drop it rather than crashing the app.
      clearTrip();
      return null;
    }
    return validated.data as PackingListResult;
  } catch {
    clearTrip();
    return null;
  }
}

export function saveTrip(result: PackingListResult): StorageStatus {
  const store = getStore();
  if (!store) return 'unavailable';
  const payload: StoredTrip = { version: 1, result };
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(payload));
    return 'ok';
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return 'quota';
    }
    return 'error';
  }
}

export function clearTrip(): StorageStatus {
  const store = getStore();
  if (!store) return 'unavailable';
  try {
    store.removeItem(STORAGE_KEY);
    return 'ok';
  } catch {
    return 'error';
  }
}
