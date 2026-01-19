import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { Track } from '../models';


export type PlayerState = 'stopped' | 'playing' | 'paused' | 'buffering';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService implements OnDestroy {
  private audio: HTMLAudioElement;

  // Player state signals
  private _state = signal<PlayerState>('stopped');
  private _currentTrack = signal<Track | null>(null);
  private _playlist = signal<Track[]>([]);
  private _currentIndex = signal<number>(-1);
  private _volume = signal<number>(1);
  private _currentTime = signal<number>(0);
  private _duration = signal<number>(0);
  private _isMuted = signal<boolean>(false);
  private _isLooping = signal<boolean>(false);
  private _isShuffled = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly state = this._state.asReadonly();
  readonly currentTrack = this._currentTrack.asReadonly();
  readonly playlist = this._playlist.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly isMuted = this._isMuted.asReadonly();
  readonly isLooping = this._isLooping.asReadonly();
  readonly isShuffled = this._isShuffled.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly progress = computed(() => {
    const duration = this._duration();
    return duration > 0 ? (this._currentTime() / duration) * 100 : 0;
  });

  readonly isPlaying = computed(() => this._state() === 'playing');
  readonly isPaused = computed(() => this._state() === 'paused');
  readonly isStopped = computed(() => this._state() === 'stopped');
  readonly isBuffering = computed(() => this._state() === 'buffering');

  readonly hasNext = computed(() => {
    const playlist = this._playlist();
    const index = this._currentIndex();
    return playlist.length > 0 && index < playlist.length - 1;
  });

  readonly hasPrevious = computed(() => {
    return this._currentIndex() > 0;
  });

  readonly formattedCurrentTime = computed(() => this.formatTime(this._currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this._duration()));

  constructor() {
    this.audio = new Audio();
    this.setupAudioEventListeners();
  }

  private setupAudioEventListeners(): void {
    // Playback events
    this.audio.addEventListener('play', () => {
      this._state.set('playing');
      this._error.set(null);
    });

    this.audio.addEventListener('pause', () => {
      if (!this.audio.ended) {
        this._state.set('paused');
      }
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('waiting', () => {
      this._state.set('buffering');
    });

    this.audio.addEventListener('canplay', () => {
      if (this._state() === 'buffering') {
        this._state.set('paused');
      }
    });

    // Time updates
    this.audio.addEventListener('timeupdate', () => {
      this._currentTime.set(this.audio.currentTime);
    });

    this.audio.addEventListener('durationchange', () => {
      this._duration.set(this.audio.duration || 0);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this._duration.set(this.audio.duration || 0);
    });

    // Volume events
    this.audio.addEventListener('volumechange', () => {
      this._volume.set(this.audio.volume);
      this._isMuted.set(this.audio.muted);
    });

    // Error handling
    this.audio.addEventListener('error', () => {
      this._state.set('stopped');
      const errorMessage = this.getAudioErrorMessage(this.audio.error?.code);
      this._error.set(errorMessage);
    });
  }

  private getAudioErrorMessage(code: number | undefined): string {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Playback was aborted';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error occurred while loading audio';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Error decoding audio file';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Audio format not supported';
      default:
        return 'An unknown error occurred';
    }
  }

  private handleTrackEnded(): void {
    if (this._isLooping()) {
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.hasNext()) {
      this.next();
    } else {
      this._state.set('stopped');
      this._currentTime.set(0);
    }
  }

  // ========== PLAYBACK CONTROLS ==========

  async loadTrack(track: Track): Promise<void> {
    if (!track.audioUrl) {
      this._error.set('No audio file available for this track');
      return;
    }

    this._state.set('buffering');
    this._currentTrack.set(track);
    this._error.set(null);

    this.audio.src = track.audioUrl;
    this.audio.load();
  }

  async play(): Promise<void> {
    if (!this.audio.src) {
      this._error.set('No track loaded');
      return;
    }

    try {
      await this.audio.play();
    } catch (error) {
      this._error.set('Failed to play audio');
      this._state.set('stopped');
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this._state.set('stopped');
    this._currentTime.set(0);
  }

  async playTrack(track: Track): Promise<void> {
    await this.loadTrack(track);
    await this.play();
  }

  async next(): Promise<void> {
    const playlist = this._playlist();
    let nextIndex: number;

    if (this._isShuffled()) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = this._currentIndex() + 1;
    }

    if (nextIndex < playlist.length) {
      this._currentIndex.set(nextIndex);
      await this.playTrack(playlist[nextIndex]);
    }
  }

  async previous(): Promise<void> {
    // If more than 3 seconds into the track, restart it
    if (this._currentTime() > 3) {
      this.seek(0);
      return;
    }

    const prevIndex = this._currentIndex() - 1;
    if (prevIndex >= 0) {
      const playlist = this._playlist();
      this._currentIndex.set(prevIndex);
      await this.playTrack(playlist[prevIndex]);
    }
  }

  // ========== PROGRESS & SEEK ==========

  seek(time: number): void {
    if (isFinite(time) && time >= 0 && time <= this._duration()) {
      this.audio.currentTime = time;
      this._currentTime.set(time);
    }
  }

  seekToPercent(percent: number): void {
    const time = (percent / 100) * this._duration();
    this.seek(time);
  }

  // ========== VOLUME CONTROLS ==========

  setVolume(value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value));
    this.audio.volume = clampedValue;
    this._volume.set(clampedValue);

    if (clampedValue > 0 && this._isMuted()) {
      this.audio.muted = false;
    }
  }

  mute(): void {
    this.audio.muted = true;
    this._isMuted.set(true);
  }

  unmute(): void {
    this.audio.muted = false;
    this._isMuted.set(false);
  }

  toggleMute(): void {
    if (this._isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // ========== PLAYLIST MANAGEMENT ==========

  setPlaylist(tracks: Track[], startIndex: number = 0): void {
    this._playlist.set(tracks);
    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      this._currentIndex.set(startIndex);
    }
  }

  addToPlaylist(track: Track): void {
    this._playlist.update(playlist => [...playlist, track]);
  }

  removeFromPlaylist(trackId: string): void {
    this._playlist.update(playlist => playlist.filter(t => t.id !== trackId));
  }

  clearPlaylist(): void {
    this.stop();
    this._playlist.set([]);
    this._currentIndex.set(-1);
    this._currentTrack.set(null);
  }

  // ========== PLAYBACK OPTIONS ==========

  toggleLoop(): void {
    this._isLooping.update(v => !v);
    this.audio.loop = this._isLooping();
  }

  toggleShuffle(): void {
    this._isShuffled.update(v => !v);
  }

  // ========== UTILITY ==========

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  clearError(): void {
    this._error.set(null);
  }

  ngOnDestroy(): void {
    this.stop();
    this.audio.src = '';
  }
}
