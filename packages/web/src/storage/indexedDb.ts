import type { Stroke } from '../components/DrawingCanvas';

export interface ProjectData {
  strokes: Stroke[];
  settings: Record<string, any>;
}

const DB_NAME = 'airdraw';
const STORE_NAME = 'projects';
const LS_PREFIX = 'airdraw-project:';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProject(id: string, data: ProjectData): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    localStorage.setItem(`${LS_PREFIX}${id}`, JSON.stringify(data));
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadProject(id: string): Promise<ProjectData | null> {
  if (typeof indexedDB === 'undefined') {
    const raw = localStorage.getItem(`${LS_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as ProjectData) : null;
  }
  const db = await openDb();
  return new Promise<ProjectData | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as ProjectData) ?? null);
    req.onerror = () => reject(req.error);
  });
}
