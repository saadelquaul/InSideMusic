import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlbumService, TrackService, CategoryService } from '../../services';
import { Album, Track } from '../../models';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css',
})
export class AlbumDetail {

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
