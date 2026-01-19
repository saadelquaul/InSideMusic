import { Injectable, signal } from '@angular/core';
import { Track } from '../models';


const DB_NAME = 'InSideMusicDB';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const AUDIO_FILES_STORE = 'audioFiles';
const COVER_IMAGES_STORE = 'coverImages';


export type StorageState = 'idle' | 'loading' | 'success' | 'error';

export interface StoredFile {
  id: string;
  file: Blob;
  mimeType: string;
  name: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db: IDBDatabase | null = null;
  private dbReady = signal(false);
  private state = signal<StorageState>('idle');
  private error = signal<string | null>(null);

  readonly isReady = this.dbReady.asReadonly();
  readonly storageState = this.state.asReadonly();
  readonly storageError = this.error.asReadonly();

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.state.set('loading');

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to open database');
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.dbReady.set(true);
        this.state.set('success');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tracks store
        if (!db.objectStoreNames.contains(TRACKS_STORE)) {
          const tracksStore = db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
          tracksStore.createIndex('title', 'title', { unique: false });
          tracksStore.createIndex('artist', 'artist', { unique: false });
          tracksStore.createIndex('categoryId', 'categoryId', { unique: false });
          tracksStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        }

        // Create audio files store
        if (!db.objectStoreNames.contains(AUDIO_FILES_STORE)) {
          db.createObjectStore(AUDIO_FILES_STORE, { keyPath: 'id' });
        }

        // Create cover images store
        if (!db.objectStoreNames.contains(COVER_IMAGES_STORE)) {
          db.createObjectStore(COVER_IMAGES_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDbReady(): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }
  }

  // ========== TRACK OPERATIONS ==========

  async getAllTracks(): Promise<Track[]> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(TRACKS_STORE, 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        this.state.set('success');
        resolve(request.result);
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to fetch tracks');
        reject(new Error('Failed to fetch tracks'));
      };
    });
  }

  async getTrackById(id: string): Promise<Track | undefined> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(TRACKS_STORE, 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve(request.result);
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to fetch track');
        reject(new Error('Failed to fetch track'));
      };
    });
  }

  async saveTrack(track: Track): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(TRACKS_STORE, 'readwrite');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.put(track);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to save track');
        reject(new Error('Failed to save track'));
      };
    });
  }

  async deleteTrack(id: string): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(TRACKS_STORE, 'readwrite');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to delete track');
        reject(new Error('Failed to delete track'));
      };
    });
  }

  // ========== AUDIO FILE OPERATIONS ==========

  async saveAudioFile(id: string, file: File): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    const storedFile: StoredFile = {
      id,
      file: file,
      mimeType: file.type,
      name: file.name,
      size: file.size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(AUDIO_FILES_STORE, 'readwrite');
      const store = transaction.objectStore(AUDIO_FILES_STORE);
      const request = store.put(storedFile);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to save audio file');
        reject(new Error('Failed to save audio file'));
      };
    });
  }

  async getAudioFile(id: string): Promise<StoredFile | undefined> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(AUDIO_FILES_STORE, 'readonly');
      const store = transaction.objectStore(AUDIO_FILES_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve(request.result);
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to fetch audio file');
        reject(new Error('Failed to fetch audio file'));
      };
    });
  }

  async deleteAudioFile(id: string): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(AUDIO_FILES_STORE, 'readwrite');
      const store = transaction.objectStore(AUDIO_FILES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to delete audio file');
        reject(new Error('Failed to delete audio file'));
      };
    });
  }

  // ========== COVER IMAGE OPERATIONS ==========

  async saveCoverImage(id: string, file: File): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    const storedFile: StoredFile = {
      id,
      file: file,
      mimeType: file.type,
      name: file.name,
      size: file.size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(COVER_IMAGES_STORE, 'readwrite');
      const store = transaction.objectStore(COVER_IMAGES_STORE);
      const request = store.put(storedFile);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to save cover image');
        reject(new Error('Failed to save cover image'));
      };
    });
  }

  async getCoverImage(id: string): Promise<StoredFile | undefined> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(COVER_IMAGES_STORE, 'readonly');
      const store = transaction.objectStore(COVER_IMAGES_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve(request.result);
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to fetch cover image');
        reject(new Error('Failed to fetch cover image'));
      };
    });
  }

  async deleteCoverImage(id: string): Promise<void> {
    await this.ensureDbReady();
    this.state.set('loading');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(COVER_IMAGES_STORE, 'readwrite');
      const store = transaction.objectStore(COVER_IMAGES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.state.set('success');
        resolve();
      };

      request.onerror = () => {
        this.state.set('error');
        this.error.set('Failed to delete cover image');
        reject(new Error('Failed to delete cover image'));
      };
    });
  }

  // ========== UTILITY ==========

  createBlobUrl(file: Blob): string {
    return URL.createObjectURL(file);
  }

  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  clearError(): void {
    this.error.set(null);
  }
}
