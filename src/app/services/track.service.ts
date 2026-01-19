import { Injectable, signal, inject, computed } from '@angular/core';
import {
  Track,
  CreateTrackDto,
  UpdateTrackDto,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH
} from '../models';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';


export type TrackLoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private readonly categoryService = inject(CategoryService);
  private readonly storageService = inject(StorageService);

  private readonly tracksSignal = signal<Track[]>([]);
  private readonly loadingState = signal<TrackLoadingState>('idle');
  private readonly errorSignal = signal<string | null>(null);

  readonly tracks = this.tracksSignal.asReadonly();
  readonly state = this.loadingState.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isLoading = computed(() => this.loadingState() === 'loading');

  constructor() {
    this.loadTracksFromStorage();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // ========== VALIDATION ==========

  validateTrackData(dto: CreateTrackDto | UpdateTrackDto): ValidationError[] {
    const errors: ValidationError[] = [];

    if ('title' in dto && dto.title !== undefined) {
      if (!dto.title.trim()) {
        errors.push({ field: 'title', message: 'Title is required' });
      } else if (dto.title.length > MAX_TITLE_LENGTH) {
        errors.push({ field: 'title', message: `Title must be ${MAX_TITLE_LENGTH} characters or less` });
      }
    }

    if ('artist' in dto && dto.artist !== undefined) {
      if (!dto.artist.trim()) {
        errors.push({ field: 'artist', message: 'Artist is required' });
      }
    }

    if ('description' in dto && dto.description !== undefined && dto.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push({ field: 'description', message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` });
    }

    if ('audioFile' in dto && dto.audioFile) {
      const audioErrors = this.validateAudioFile(dto.audioFile);
      errors.push(...audioErrors);
    }

    if ('coverImage' in dto && dto.coverImage) {
      const imageErrors = this.validateImageFile(dto.coverImage);
      errors.push(...imageErrors);
    }

    return errors;
  }

  validateAudioFile(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      errors.push({
        field: 'audioFile',
        message: 'Invalid audio format. Supported formats: MP3, WAV, OGG'
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        field: 'audioFile',
        message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      });
    }

    return errors;
  }

  validateImageFile(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      errors.push({
        field: 'coverImage',
        message: 'Invalid image format. Supported formats: PNG, JPEG'
      });
    }

    // 5MB limit for images
    if (file.size > 5 * 1024 * 1024) {
      errors.push({
        field: 'coverImage',
        message: 'Cover image must be under 5MB'
      });
    }

    return errors;
  }

  // ========== STORAGE OPERATIONS ==========

  async loadTracksFromStorage(): Promise<void> {
    this.loadingState.set('loading');
    try {
      const tracks = await this.storageService.getAllTracks();

      // Restore blob URLs for audio files and cover images
      const tracksWithUrls = await Promise.all(
        tracks.map(async (track) => {
          const updatedTrack = { ...track };

          if (track.audioFileId) {
            const audioFile = await this.storageService.getAudioFile(track.audioFileId);
            if (audioFile) {
              updatedTrack.audioUrl = this.storageService.createBlobUrl(audioFile.file);
            }
          }

          if (track.coverImageId) {
            const coverImage = await this.storageService.getCoverImage(track.coverImageId);
            if (coverImage) {
              updatedTrack.coverUrl = this.storageService.createBlobUrl(coverImage.file);
            }
          }

          return updatedTrack;
        })
      );

      this.tracksSignal.set(tracksWithUrls);
      this.loadingState.set('success');
    } catch (error) {
      this.loadingState.set('error');
      this.errorSignal.set('Failed to load tracks from storage');
    }
  }

  // ========== CRUD OPERATIONS ==========

  getAll(): Track[] {
    return this.tracksSignal();
  }

  getById(id: string): Track | undefined {
    return this.tracksSignal().find(t => t.id === id);
  }

  getByCategory(categoryId: string): Track[] {
    return this.tracksSignal().filter(t => t.categoryId === categoryId);
  }

  // Legacy method for album components (returns empty array as albums are not used)
  getByAlbum(albumId: string): Track[] {
    return [];
  }

  search(query: string): Track[] {
    const lowerQuery = query.toLowerCase();
    return this.tracksSignal().filter(t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.artist.toLowerCase().includes(lowerQuery) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery))
    );
  }

  async create(dto: CreateTrackDto): Promise<Track> {
    this.loadingState.set('loading');
    this.errorSignal.set(null);

    // Validate
    const errors = this.validateTrackData(dto);
    if (errors.length > 0) {
      this.loadingState.set('error');
      this.errorSignal.set(errors.map(e => e.message).join(', '));
      throw new Error(errors.map(e => e.message).join(', '));
    }

    try {
      const trackId = this.generateId();
      let audioFileId: string | undefined;
      let audioUrl: string | undefined;
      let coverImageId: string | undefined;
      let coverUrl: string | undefined;
      let duration = 0;

      // Save audio file
      if (dto.audioFile) {
        audioFileId = `audio-${trackId}`;
        await this.storageService.saveAudioFile(audioFileId, dto.audioFile);
        audioUrl = this.storageService.createBlobUrl(dto.audioFile);

        // Calculate duration
        duration = await this.getAudioDuration(dto.audioFile);
      }

      // Save cover image
      if (dto.coverImage) {
        coverImageId = `cover-${trackId}`;
        await this.storageService.saveCoverImage(coverImageId, dto.coverImage);
        coverUrl = this.storageService.createBlobUrl(dto.coverImage);
      }

      const newTrack: Track = {
        id: trackId,
        title: dto.title,
        artist: dto.artist,
        description: dto.description,
        categoryId: dto.categoryId,
        duration,
        audioFileId,
        audioUrl,
        coverImageId,
        coverUrl,
        dateAdded: new Date(),
        updatedAt: new Date()
      };

      // Save to IndexedDB
      await this.storageService.saveTrack(newTrack);

      // Update local state
      this.tracksSignal.update(tracks => [...tracks, newTrack]);
      this.loadingState.set('success');

      return newTrack;
    } catch (error) {
      this.loadingState.set('error');
      this.errorSignal.set('Failed to create track');
      throw error;
    }
  }

  async update(id: string, dto: UpdateTrackDto): Promise<Track> {
    this.loadingState.set('loading');
    this.errorSignal.set(null);

    const existingTrack = this.getById(id);
    if (!existingTrack) {
      this.loadingState.set('error');
      this.errorSignal.set('Track not found');
      throw new Error('Track not found');
    }

    // Validate
    const errors = this.validateTrackData(dto);
    if (errors.length > 0) {
      this.loadingState.set('error');
      this.errorSignal.set(errors.map(e => e.message).join(', '));
      throw new Error(errors.map(e => e.message).join(', '));
    }

    try {
      let { audioFileId, audioUrl, coverImageId, coverUrl, duration } = existingTrack;

      // Update audio file if provided
      if (dto.audioFile) {
        // Delete old audio file
        if (audioFileId) {
          await this.storageService.deleteAudioFile(audioFileId);
          if (audioUrl) this.storageService.revokeBlobUrl(audioUrl);
        }

        audioFileId = `audio-${id}`;
        await this.storageService.saveAudioFile(audioFileId, dto.audioFile);
        audioUrl = this.storageService.createBlobUrl(dto.audioFile);
        duration = await this.getAudioDuration(dto.audioFile);
      }

      // Update cover image if provided
      if (dto.coverImage) {
        // Delete old cover image
        if (coverImageId) {
          await this.storageService.deleteCoverImage(coverImageId);
          if (coverUrl) this.storageService.revokeBlobUrl(coverUrl);
        }

        coverImageId = `cover-${id}`;
        await this.storageService.saveCoverImage(coverImageId, dto.coverImage);
        coverUrl = this.storageService.createBlobUrl(dto.coverImage);
      }

      const updatedTrack: Track = {
        ...existingTrack,
        title: dto.title ?? existingTrack.title,
        artist: dto.artist ?? existingTrack.artist,
        description: dto.description ?? existingTrack.description,
        categoryId: dto.categoryId ?? existingTrack.categoryId,
        duration,
        audioFileId,
        audioUrl,
        coverImageId,
        coverUrl,
        updatedAt: new Date()
      };

      // Save to IndexedDB
      await this.storageService.saveTrack(updatedTrack);

      // Update local state
      this.tracksSignal.update(tracks =>
        tracks.map(t => t.id === id ? updatedTrack : t)
      );
      this.loadingState.set('success');

      return updatedTrack;
    } catch (error) {
      this.loadingState.set('error');
      this.errorSignal.set('Failed to update track');
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    this.loadingState.set('loading');
    this.errorSignal.set(null);

    const track = this.getById(id);
    if (!track) {
      this.loadingState.set('error');
      this.errorSignal.set('Track not found');
      return false;
    }

    try {
      // Delete audio file
      if (track.audioFileId) {
        await this.storageService.deleteAudioFile(track.audioFileId);
        if (track.audioUrl) this.storageService.revokeBlobUrl(track.audioUrl);
      }

      // Delete cover image
      if (track.coverImageId) {
        await this.storageService.deleteCoverImage(track.coverImageId);
        if (track.coverUrl) this.storageService.revokeBlobUrl(track.coverUrl);
      }

      // Delete track from IndexedDB
      await this.storageService.deleteTrack(id);

      // Update local state
      this.tracksSignal.update(tracks => tracks.filter(t => t.id !== id));
      this.loadingState.set('success');

      return true;
    } catch (error) {
      this.loadingState.set('error');
      this.errorSignal.set('Failed to delete track');
      return false;
    }
  }

  // ========== UTILITY ==========

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(Math.round(audio.duration));
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve(0);
      };
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categoryService.getById(categoryId);
    return category?.name ?? 'Unknown';
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
