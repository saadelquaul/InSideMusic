import { Injectable, signal, inject } from '@angular/core';
import { Album, CreateAlbumDto, UpdateAlbumDto } from '../models';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private readonly categoryService = inject(CategoryService);

  private readonly albumsSignal = signal<Album[]>([
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Nova',
      description: 'A journey through nocturnal soundscapes',
      coverUrl: 'https://picsum.photos/seed/album1/300/300',
      releaseDate: new Date('2024-01-15'),
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Electric Soul',
      artist: 'The Neon Lights',
      description: 'High energy rock anthems',
      coverUrl: 'https://picsum.photos/seed/album2/300/300',
      releaseDate: new Date('2023-11-20'),
      categoryId: '2',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Blue Note Sessions',
      artist: 'Marcus Cole Trio',
      description: 'Classic jazz reimagined',
      coverUrl: 'https://picsum.photos/seed/album3/300/300',
      releaseDate: new Date('2024-03-01'),
      categoryId: '3',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Synthwave Nights',
      artist: 'Digital Dreams',
      description: 'Retro-futuristic electronic beats',
      coverUrl: 'https://picsum.photos/seed/album4/300/300',
      releaseDate: new Date('2024-02-14'),
      categoryId: '4',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  readonly albums = this.albumsSignal.asReadonly();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  getAll(): Album[] {
    return this.albumsSignal();
  }

  getById(id: string): Album | undefined {
    return this.albumsSignal().find(a => a.id === id);
  }

  getByCategory(categoryId: string): Album[] {
    return this.albumsSignal().filter(a => a.categoryId === categoryId);
  }

  create(dto: CreateAlbumDto): Album {
    const newAlbum: Album = {
      id: this.generateId(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.albumsSignal.update(albums => [...albums, newAlbum]);
    return newAlbum;
  }

  update(id: string, dto: UpdateAlbumDto): Album | undefined {
    const index = this.albumsSignal().findIndex(a => a.id === id);
    if (index === -1) return undefined;

    const updated: Album = {
      ...this.albumsSignal()[index],
      ...dto,
      updatedAt: new Date()
    };

    this.albumsSignal.update(albums => {
      const newAlbums = [...albums];
      newAlbums[index] = updated;
      return newAlbums;
    });

    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this.albumsSignal().length;
    this.albumsSignal.update(albums => albums.filter(a => a.id !== id));
    return this.albumsSignal().length < initialLength;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categoryService.getById(categoryId);
    return category?.name ?? 'Unknown';
  }
}
