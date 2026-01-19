import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlbumService, TrackService, CategoryService } from '../../services';
import { Album, Track } from '../../models';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <a routerLink="/albums" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Albums
        </a>
      </div>

      @if (album()) {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Album Header -->
          <div class="md:flex">
            <div class="md:w-80 md:flex-shrink-0">
              <img
                [src]="album()!.coverUrl || 'https://picsum.photos/seed/defaultalbum/400/400'"
                [alt]="album()!.title"
                class="w-full h-80 md:h-full object-cover"
              >
            </div>
            <div class="p-8 flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {{ getCategoryName() }}
                  </span>
                  <h1 class="mt-4 text-3xl font-bold text-gray-900">{{ album()!.title }}</h1>
                  <p class="mt-2 text-xl text-gray-600">{{ album()!.artist }}</p>
                </div>
                <a
                  [routerLink]="['/albums', album()!.id, 'edit']"
                  class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
              </div>
              @if (album()!.description) {
                <p class="mt-4 text-gray-600">{{ album()!.description }}</p>
              }
              <div class="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                @if (album()!.releaseDate) {
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ album()!.releaseDate | date:'mediumDate' }}
                  </div>
                }
                <div class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  {{ albumTracks().length }} tracks
                </div>
                <div class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ getTotalDuration() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Track List -->
          <div class="border-t border-gray-200">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900">Tracks</h2>
                <a
                  routerLink="/tracks/new"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  + Add Track
                </a>
              </div>

              @if (albumTracks().length === 0) {
                <p class="text-gray-500 text-center py-8">No tracks in this album yet.</p>
              } @else {
                <div class="space-y-2">
                  @for (track of albumTracks(); track track.id; let i = $index) {
                    <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                      <span class="w-8 text-center text-gray-400 text-sm">{{ i + 1 }}</span>
                      <img
                        [src]="track.coverUrl || album()!.coverUrl || 'https://picsum.photos/seed/default/50/50'"
                        class="w-12 h-12 rounded object-cover"
                      >
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-900 truncate">{{ track.title }}</h4>
                        <p class="text-sm text-gray-500">{{ track.artist }}</p>
                      </div>
                      <span class="text-gray-500 text-sm">{{ trackService.formatDuration(track.duration) }}</span>
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <a
                          [routerLink]="['/tracks', track.id, 'edit']"
                          class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-gray-500">Album not found</p>
        </div>
      }
    </div>
  `
})
export class AlbumDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly albumService = inject(AlbumService);
  protected readonly trackService = inject(TrackService);
  private readonly categoryService = inject(CategoryService);

  protected readonly album = signal<Album | undefined>(undefined);
  protected readonly albumTracks = signal<Track[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const album = this.albumService.getById(id);
      if (album) {
        this.album.set(album);
        this.albumTracks.set(this.trackService.getByAlbum(id));
      } else {
        this.router.navigate(['/albums']);
      }
    }
  }

  getCategoryName(): string {
    const album = this.album();
    if (!album) return '';
    return this.categoryService.getById(album.categoryId)?.name ?? 'Unknown';
  }

  getTotalDuration(): string {
    const totalSeconds = this.albumTracks().reduce((sum, track) => sum + track.duration, 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
