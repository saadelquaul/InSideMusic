import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlbumService, CategoryService } from '../../services';
import { CreateAlbumDto, UpdateAlbumDto } from '../../models';


@Component({
  selector: 'app-album-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './album-form.html',
  styleUrl: './album-form.css',
})
export class AlbumForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly albumService = inject(AlbumService);
  private readonly categoryService = inject(CategoryService);

   protected readonly categories = this.categoryService.categories;
  protected readonly isEditMode = signal(false);

  private albumId: string | null = null;
  releaseDateString = '';

  formData: CreateAlbumDto = {
    title: '',
    artist: '',
    description: '',
    categoryId: '',
    coverUrl: ''
  };

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');

    if (this.albumId) {
      this.isEditMode.set(true);
      const album = this.albumService.getById(this.albumId);
      if (album) {
        this.formData = {
          title: album.title,
          artist: album.artist,
          description: album.description || '',
          categoryId: album.categoryId,
          coverUrl: album.coverUrl || ''
        };
        if (album.releaseDate) {
          this.releaseDateString = new Date(album.releaseDate).toISOString().split('T')[0];
        }
      } else {
        this.router.navigate(['/albums']);
      }
    }
  }

  onSubmit() {
    const dto: CreateAlbumDto | UpdateAlbumDto = {
      ...this.formData,
      releaseDate: this.releaseDateString ? new Date(this.releaseDateString) : undefined
    };

    if (this.isEditMode() && this.albumId) {
      this.albumService.update(this.albumId, dto as UpdateAlbumDto);
    } else {
      this.albumService.create(dto as CreateAlbumDto);
    }
    this.router.navigate(['/albums']);
  }
}
