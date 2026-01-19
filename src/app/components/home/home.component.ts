import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackService, CategoryService, AudioPlayerService } from '../../services';
import { Track } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">InSideMusic</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Your personal music player. Upload your tracks and enjoy your music anywhere.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <a routerLink="/tracks" class="block bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-indigo-200 text-sm font-medium">Total Tracks</p>
              <p class="text-4xl font-bold mt-2">{{ trackCount() }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
        </a>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-200 text-sm font-medium">Total Duration</p>
              <p class="text-4xl font-bold mt-2">{{ totalDuration() }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <a routerLink="/categories" class="block bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-pink-200 text-sm font-medium">Categories</p>
              <p class="text-4xl font-bold mt-2">{{ categoryCount() }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      <!-- Recent Tracks -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Recent Tracks</h2>
          <a routerLink="/tracks" class="text-indigo-600 hover:text-indigo-800 font-medium">View all →</a>
        </div>

        @if (recentTracks().length === 0) {
          <div class="bg-white rounded-xl shadow-md p-12 text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No tracks yet</h3>
            <p class="text-gray-500 mb-4">Upload your first track to get started!</p>
            <a
              routerLink="/tracks/new"
              class="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Your First Track
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (track of recentTracks(); track track.id) {
              <div
                class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                (click)="playTrack(track)"
              >
                <div class="relative">
                  <img
                    [src]="track.coverUrl || 'https://via.placeholder.com/300/6366f1/ffffff?text=♪'"
                    [alt]="track.title"
                    class="w-full h-40 object-cover"
                  >
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                      @if (isCurrentTrack(track) && audioPlayerService.isPlaying()) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      }
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 truncate">{{ track.title }}</h3>
                  <p class="text-gray-500 text-sm">{{ track.artist }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-400">{{ trackService.formatDuration(track.duration) }}</span>
                    <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                      {{ trackService.getCategoryName(track.categoryId) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Categories Overview -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <a routerLink="/categories" class="text-indigo-600 hover:text-indigo-800 font-medium">Manage →</a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (category of categories(); track category.id) {
            <button
              (click)="playByCategory(category.id)"
              class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow text-center group"
            >
              <div
                class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                [style.backgroundColor]="category.color + '20'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" [style.color]="category.color">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">{{ category.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ getTrackCountByCategory(category.id) }} tracks</p>
            </button>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-4">Quick Actions</h2>
        <div class="flex flex-wrap gap-4">
          <a
            routerLink="/tracks/new"
            class="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Upload Track
          </a>
          <button
            (click)="playAll()"
            [disabled]="trackCount() === 0"
            class="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Play All
          </button>
          <button
            (click)="shuffleAll()"
            [disabled]="trackCount() === 0"
            class="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Shuffle All
          </button>
          <a
            routerLink="/categories"
            class="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Manage Categories
          </a>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  protected readonly trackService = inject(TrackService);
  protected readonly audioPlayerService = inject(AudioPlayerService);
  private readonly categoryService = inject(CategoryService);

  protected readonly trackCount = computed(() => this.trackService.getAll().length);
  protected readonly categoryCount = computed(() => this.categoryService.getAll().length);
  protected readonly categories = computed(() => this.categoryService.getAll());

  protected readonly totalDuration = computed(() => {
    const totalSeconds = this.trackService.getAll().reduce((sum: number, track: Track) => sum + track.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  });

  protected readonly recentTracks = computed(() => {
    return [...this.trackService.getAll()]
      .sort((a: Track, b: Track) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 4);
  });

  ngOnInit(): void {
    // Load tracks from storage on init
    this.trackService.loadTracksFromStorage();
  }

  getTrackCountByCategory(categoryId: string): number {
    return this.trackService.getByCategory(categoryId).length;
  }

  playTrack(track: Track): void {
    const allTracks = this.trackService.getAll().filter((t: Track) => t.audioUrl);
    this.audioPlayerService.setPlaylist(allTracks);
    this.audioPlayerService.playTrack(track);
  }

  playByCategory(categoryId: string): void {
    const tracks = this.trackService.getByCategory(categoryId).filter((t: Track) => t.audioUrl);
    if (tracks.length > 0) {
      this.audioPlayerService.setPlaylist(tracks);
      this.audioPlayerService.playTrack(tracks[0]);
    }
  }

  playAll(): void {
    const tracks = this.trackService.getAll().filter((t: Track) => t.audioUrl);
    if (tracks.length > 0) {
      this.audioPlayerService.setPlaylist(tracks);
      this.audioPlayerService.playTrack(tracks[0]);
    }
  }

  shuffleAll(): void {
    const tracks = this.trackService.getAll().filter((t: Track) => t.audioUrl);
    if (tracks.length > 0) {
      // Set playlist with shuffle enabled
      this.audioPlayerService.setPlaylist(tracks);
      if (!this.audioPlayerService.isShuffled()) {
        this.audioPlayerService.toggleShuffle();
      }
      // Play the first track (shuffle will handle random order)
      this.audioPlayerService.playTrack(tracks[0]);
    }
  }

  isCurrentTrack(track: Track): boolean {
    return this.audioPlayerService.currentTrack()?.id === track.id;
  }
}
