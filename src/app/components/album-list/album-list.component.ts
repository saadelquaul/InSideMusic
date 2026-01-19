import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlbumService, CategoryService, TrackService } from '../../services';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Albums</h1>
        <a
          routerLink="/albums/new"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Album
        </a>
      </div>

      <!-- Filter by Category -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
        <select
          (change)="onCategoryFilter($event)"
          class="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.name }}</option>
          }
        </select>
      </div>

      <!-- Albums Grid -->
      @if (filteredAlbums().length === 0) {
        <div class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No albums found</h3>
          <p class="mt-2 text-gray-500">Get started by adding a new album.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (album of filteredAlbums(); track album.id) {
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div class="relative group">
                <img
                  [src]="album.coverUrl || 'https://picsum.photos/seed/defaultalbum/300/300'"
                  [alt]="album.title"
                  class="w-full h-56 object-cover"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-lg text-gray-900 truncate">{{ album.title }}</h3>
                <p class="text-gray-600 text-sm mt-1">{{ album.artist }}</p>
                @if (album.description) {
                  <p class="text-gray-500 text-sm mt-2 line-clamp-2">{{ album.description }}</p>
                }
                <div class="flex items-center justify-between mt-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ albumService.getCategoryName(album.categoryId) }}
                  </span>
                  <span class="text-gray-500 text-sm">
                    {{ getTrackCount(album.id) }} tracks
                  </span>
                </div>
                @if (album.releaseDate) {
                  <p class="text-gray-400 text-xs mt-2">
                    Released: {{ album.releaseDate | date:'mediumDate' }}
                  </p>
                }
                <div class="flex gap-2 mt-4">
                  <a
                    [routerLink]="['/albums', album.id]"
                    class="flex-1 text-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    View
                  </a>
                  <a
                    [routerLink]="['/albums', album.id, 'edit']"
                    class="flex-1 text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </a>
                  <button
                    (click)="deleteAlbum(album.id)"
                    class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AlbumListComponent {
  protected readonly albumService = inject(AlbumService);
  private readonly categoryService = inject(CategoryService);
  private readonly trackService = inject(TrackService);

  protected readonly categories = this.categoryService.categories;
  protected readonly selectedCategoryId = signal<string>('');

  protected readonly filteredAlbums = computed(() => {
    const categoryId = this.selectedCategoryId();
    const albums = this.albumService.getAll();

    if (!categoryId) return albums;
    return albums.filter(a => a.categoryId === categoryId);
  });

  onCategoryFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCategoryId.set(select.value);
  }

  getTrackCount(albumId: string): number {
    return this.trackService.getByAlbum(albumId).length;
  }

  deleteAlbum(id: string) {
    const trackCount = this.getTrackCount(id);
    const message = trackCount > 0
      ? `This album has ${trackCount} tracks. Are you sure you want to delete it?`
      : 'Are you sure you want to delete this album?';

    if (confirm(message)) {
      this.albumService.delete(id);
    }
  }
}
