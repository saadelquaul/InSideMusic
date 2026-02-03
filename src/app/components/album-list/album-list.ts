import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlbumService, CategoryService, TrackService } from '../../services';


@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './album-list.html',
  styleUrl: './album-list.css',
})
export class AlbumList {
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
