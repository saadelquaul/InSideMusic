export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  duration: number; // in seconds
  categoryId: string;
  audioFileId?: string; // Reference to IndexedDB audio file
  audioUrl?: string; // Blob URL for playback
  coverImageId?: string; // Reference to IndexedDB cover image
  coverUrl?: string; // Blob URL for display
  dateAdded: Date;
  updatedAt: Date;
}

export interface CreateTrackDto {
  title: string;
  artist: string;
  description?: string;
  categoryId: string;
  audioFile?: File; // MP3, WAV, OGG
  coverImage?: File; // PNG, JPEG
}

export interface UpdateTrackDto {
  title?: string;
  artist?: string;
  description?: string;
  categoryId?: string;
  audioFile?: File;
  coverImage?: File;
}

export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
export const SUPPORTED_IMAGE_FORMATS = ['image/png', 'image/jpeg'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_TITLE_SIZE = 50;
export const MAX_DESCRIPTION_LENGTH = 200;
