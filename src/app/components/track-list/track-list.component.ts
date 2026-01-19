import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrackService, CategoryService, AudioPlayerService } from '../../services';
import { Track } from '../../models';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Music Library</h1>
          <p class="text-gray-500 mt-1">{{ trackService.getAll().length }} tracks in your library</p>
        </div>
        <a
          routerLink="/tracks/new"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Track
        </a>
      </div>

      <!-- Search and Filter Bar -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by title, artist, or description..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
            @if (searchQuery()) {
              <button
                (click)="clearSearch()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            }
          </div>

          <!-- Category Filter -->
          <select
            [ngModel]="selectedCategoryId()"
            (ngModelChange)="onCategoryFilter($event)"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Loading State -->
      @if (trackService.isLoading()) {
        <div class="flex justify-center py-12">
          <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else if (filteredTracks().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            {{ searchQuery() || selectedCategoryId() ? 'No tracks found' : 'Your library is empty' }}
          </h3>
          <p class="mt-2 text-gray-500">
            {{ searchQuery() || selectedCategoryId() ? 'Try adjusting your search or filters.' : 'Get started by adding your first track.' }}
          </p>
          @if (!searchQuery() && !selectedCategoryId()) {
            <a routerLink="/tracks/new" class="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add your first track
            </a>
          }
        </div>
      } @else {
        <!-- Track List -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Header Row -->
          <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-1">#</div>
            <div class="col-span-5">Title</div>
            <div class="col-span-2">Category</div>
            <div class="col-span-2">Duration</div>
            <div class="col-span-2 text-right">Actions</div>
          </div>

          <!-- Track Rows -->
          <div class="divide-y divide-gray-100">
            @for (track of filteredTracks(); track track.id; let i = $index) {
              <div
                class="group px-6 py-4 hover:bg-indigo-50 transition-colors cursor-pointer"
                [class.bg-indigo-50]="audioPlayerService.currentTrack()?.id === track.id"
                (dblclick)="playTrack(track)"
              >
                <div class="grid grid-cols-12 gap-4 items-center">
                  <!-- Index/Play Button -->
                  <div class="col-span-1 flex items-center justify-center">
                    @if (audioPlayerService.currentTrack()?.id === track.id && audioPlayerService.isPlaying()) {
                      <button (click)="pauseTrack()" class="text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    } @else {
                      <button
                        (click)="playTrack(track)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
                        [class.opacity-100]="audioPlayerService.currentTrack()?.id === track.id"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <span class="group-hover:hidden text-gray-400 text-sm">{{ i + 1 }}</span>
                    }
                  </div>

                  <!-- Title & Artist with Cover -->
                  <div class="col-span-5 flex items-center gap-4 min-w-0">
                    <img
                      [src]="track.coverUrl || 'https://via.placeholder.com/48/6366f1/ffffff?text=♪'"
                      [alt]="track.title"
                      class="w-12 h-12 rounded object-cover flex-shrink-0"
                    >
                    <div class="min-w-0">
                      <h3 class="font-medium text-gray-900 truncate" [class.text-indigo-600]="audioPlayerService.currentTrack()?.id === track.id">
                        {{ track.title }}
                      </h3>
                      <p class="text-sm text-gray-500 truncate">{{ track.artist }}</p>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="col-span-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {{ trackService.getCategoryName(track.categoryId) }}
                    </span>
                  </div>

                  <!-- Duration -->
                  <div class="col-span-2 text-gray-500 text-sm">
                    {{ trackService.formatDuration(track.duration) }}
                  </div>

                  <!-- Actions -->
                  <div class="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      [routerLink]="['/tracks', track.id, 'edit']"
                      class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                    <button
                      (click)="deleteTrack(track.id, $event)"
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Description (if exists) -->
                @if (track.description) {
                  <p class="mt-2 text-sm text-gray-500 truncate ml-16 hidden md:block">{{ track.description }}</p>
                }
              </div>
            }
          </div>
        </div>

        <!-- Play All Button -->
        @if (filteredTracks().length > 0) {
          <div class="mt-6 flex justify-center">
            <button
              (click)="playAll()"
              class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              Play All ({{ filteredTracks().length }} tracks)
            </button>
          </div>
        }
      }
    </div>
  `
})
export class TrackListComponent {
  protected readonly trackService = inject(TrackService);
  protected readonly audioPlayerService = inject(AudioPlayerService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = this.categoryService.categories;
  protected readonly selectedCategoryId = signal<string>('');
  protected readonly searchQuery = signal<string>('');

  protected readonly filteredTracks = computed(() => {
    const categoryId = this.selectedCategoryId();
    const query = this.searchQuery().toLowerCase();
    let tracks: Track[] = this.trackService.getAll();

    // Filter by category
    if (categoryId) {
      tracks = tracks.filter((t: Track) => t.categoryId === categoryId);
    }

    // Filter by search query
    if (query) {
      tracks = tracks.filter((t: Track) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    return tracks;
  });

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  onCategoryFilter(categoryId: string) {
    this.selectedCategoryId.set(categoryId);
  }

  async playTrack(track: Track) {
    if (!track.audioUrl) {
      alert('This track has no audio file');
      return;
    }

    // Set playlist and play
    const tracks = this.filteredTracks();
    const index = tracks.findIndex((t: Track) => t.id === track.id);
    this.audioPlayerService.setPlaylist(tracks, index);
    await this.audioPlayerService.playTrack(track);
  }

  pauseTrack() {
    this.audioPlayerService.pause();
  }

  playAll() {
    const tracks = this.filteredTracks();
    if (tracks.length > 0 && tracks[0].audioUrl) {
      this.audioPlayerService.setPlaylist(tracks, 0);
      this.audioPlayerService.playTrack(tracks[0]);
    }
  }

  async deleteTrack(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this track? This will also delete the audio file.')) {
      // Stop if currently playing
      if (this.audioPlayerService.currentTrack()?.id === id) {
        this.audioPlayerService.stop();
      }
      await this.trackService.delete(id);
    }
  }
}
