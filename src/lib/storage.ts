export type StorageType = 'local' | 'session';

export function getBrowserStorage(type: StorageType = 'local'): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    const probeKey = '__wgc_storage_probe__';
    storage.setItem(probeKey, 'ok');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

function resolveStorage(storage: StorageType | Storage | null | undefined): Storage | null {
  if (typeof storage === 'string') {
    return getBrowserStorage(storage);
  }

  return storage ?? null;
}

export function getStorageItem(
  key: string,
  storage: StorageType | Storage = 'local',
  fallback: string | null = null,
): string | null {
  const target = resolveStorage(storage);
  if (!target) return fallback;

  try {
    return target.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem(key: string, value: string, storage: StorageType | Storage = 'local') {
  const target = resolveStorage(storage);
  if (!target) return;

  try {
    target.setItem(key, value);
  } catch {
    // Ignore storage quota/security errors rather than crashing the UI.
  }
}

export function removeStorageItem(key: string, storage: StorageType | Storage = 'local') {
  const target = resolveStorage(storage);
  if (!target) return;

  try {
    target.removeItem(key);
  } catch {
    // Ignore storage errors rather than letting the app fail.
  }
}
