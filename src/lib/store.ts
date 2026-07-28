// IndexedDB-backed persistent store — replaces localStorage
// Survives cache clears, 50MB+ storage, works offline

const DB_NAME = "nihongo_app";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readonly");
      const req = tx.objectStore("kv").get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
    return localStorage.getItem(key);
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem(key, value);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.removeItem(key);
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readonly");
      const req = tx.objectStore("kv").getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return Object.keys(localStorage);
  }
}

export async function exportAll(): Promise<Record<string, string>> {
  const keys = await getAllKeys();
  const data: Record<string, string> = {};
  for (const key of keys) {
    const val = await getItem(key);
    if (val) data[key] = val;
  }
  return data;
}

export async function importAll(data: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(data)) {
    await setItem(key, value);
  }
}

// Simple key-value helpers — localStorage + IndexedDB dual-write
export function getLocal(key: string): string | null { return localStorage.getItem(key); }
export function setLocal(key: string, value: string): void { localStorage.setItem(key, value); setItem(key, value).catch(()=>{}); }
