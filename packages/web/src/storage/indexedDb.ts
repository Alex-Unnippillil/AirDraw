import type { Stroke } from '../components/DrawingCanvas';

const DB_NAME = 'airdraw';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

interface ProjectState {
  strokes: Stroke[];
  color: string;
}

let memoryStore: Map<string, ProjectState> | null = null;

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
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

async function readProject(db: IDBDatabase | null, projectId: string): Promise<ProjectState | undefined> {
  if (!db) return memoryStore?.get(projectId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(projectId);
    req.onsuccess = () => resolve(req.result as ProjectState | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function writeProject(db: IDBDatabase | null, projectId: string, state: ProjectState): Promise<void> {
  if (!db) {
    if (!memoryStore) memoryStore = new Map();
    memoryStore.set(projectId, state);
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state, projectId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadProject(projectId: string): Promise<ProjectState | undefined> {
  const db = await openDb();
  return readProject(db, projectId);
}

export async function saveStrokes(projectId: string, strokes: Stroke[]): Promise<void> {
  const db = await openDb();
  const state = (await readProject(db, projectId)) ?? { strokes: [], color: '#000000' };
  state.strokes = strokes;
  await writeProject(db, projectId, state);
}

export async function saveColor(projectId: string, color: string): Promise<void> {
  const db = await openDb();
  const state = (await readProject(db, projectId)) ?? { strokes: [], color: '#000000' };
  state.color = color;
  await writeProject(db, projectId, state);
}

export async function clearDb(): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore = null;
    return;
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export type { ProjectState };
