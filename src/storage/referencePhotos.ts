import type { ReferencePhoto } from '../domain/types';

const DB_NAME = 'line-sticker-studio';
const STORE = 'reference-photos';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('無法開啟本機照片資料庫'));
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = action(database.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => { database.close(); resolve(request.result); };
    request.onerror = () => { database.close(); reject(request.error ?? new Error('本機照片資料庫操作失敗')); };
  });
}

export async function saveReferencePhoto(id: string, blob: Blob): Promise<void> { await transaction('readwrite', (store) => store.put(blob, id)); }
export async function getReferencePhoto(id: string): Promise<Blob | undefined> { return transaction('readonly', (store) => store.get(id)); }
export async function removeReferencePhoto(id: string): Promise<void> { await transaction('readwrite', (store) => store.delete(id)); }

export function assertReferencePhotoCapacity(existing: number, incoming: number): void {
  if (existing + incoming > 5) throw new Error('參考照片最多 5 張');
}

export function validateReferencePhotoFile(file: Pick<File, 'name' | 'type' | 'size'>): void {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error(`${file.name} 只支援 PNG、JPEG 或 WebP`);
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} 超過 20 MB`);
}

export function isDuplicateReferencePhoto(hash: string, photos: ReferencePhoto[]): boolean { return photos.some((photo) => photo.hash === hash); }

export async function createReferencePhoto(file: File, order: number, primary: boolean): Promise<ReferencePhoto> {
  validateReferencePhotoFile(file);
  const dimensions = await imageDimensions(file);
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  const hash = Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  const id = crypto.randomUUID();
  await saveReferencePhoto(id, file);
  return { id, name: file.name, type: file.type as ReferencePhoto['type'], width: dimensions.width, height: dimensions.height,
    bytes: file.size, hash, order, primary };
}

function imageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('無法讀取參考照片')); };
    image.src = url;
  });
}
