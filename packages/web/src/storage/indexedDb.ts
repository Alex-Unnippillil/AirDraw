import { type Stroke } from '../components/DrawingCanvas';

const DB_NAME = 'airdraw';
const STORE_NAME = 'state';
const KEY = 'session';

export interface StoredState {
  strokes: Stroke[];
  color: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveState(state: StoredState): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(state, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadState(): Promise<StoredState | undefined> {
  const db = await openDb();
  const result = await new Promise<StoredState | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(KEY);
    req.onsuccess = () => resolve(req.result as StoredState | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}
