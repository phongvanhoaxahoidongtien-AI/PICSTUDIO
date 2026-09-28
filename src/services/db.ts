import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ProjectData, ProjectMetadata } from '../types';

interface PhotoEditorDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectData;
    indexes: { 'by-updated': number };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'lumix-photo-editor-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PhotoEditorDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PhotoEditorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProject(project: ProjectData): Promise<void> {
  const db = await getDB();
  await db.put('projects', project);
}

export async function getProject(id: string): Promise<ProjectData | undefined> {
  const db = await getDB();
  return db.get('projects', id);
}

export async function getAllProjects(): Promise<ProjectMetadata[]> {
  const db = await getDB();
  const tx = db.transaction('projects', 'readonly');
  const index = tx.store.index('by-updated');
  const allProjects = await index.getAll();
  // Return metadata sorted by most recently updated
  return allProjects
    .map((p) => ({
      id: p.id,
      name: p.name,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      thumbnail: p.thumbnail,
      width: p.width,
      height: p.height,
    }))
    .reverse();
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    const val = await db.get('settings', key);
    return (val as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}
