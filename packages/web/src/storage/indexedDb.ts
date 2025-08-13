export interface ProjectState<Stroke = any> {
  strokes: Stroke[];
  palette: string;
}

const DB_NAME = 'airdraw';
const STORE_NAME = 'projects';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveProjectState<Stroke = any>(projectId: string, state: ProjectState<Stroke>): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(state, projectId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadProjectState<Stroke = any>(projectId: string): Promise<ProjectState<Stroke> | undefined> {
  const db = await openDb();
  const result = await new Promise<ProjectState<Stroke> | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(projectId);
    req.onsuccess = () => resolve(req.result as ProjectState<Stroke> | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}
