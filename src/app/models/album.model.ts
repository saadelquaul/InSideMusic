export interface Album {
  id: string;
  title: string;
  artist: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: Date;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlbumDto {
  title: string;
  artist: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: Date;
  categoryId: string;
}

export interface UpdateAlbumDto extends Partial<CreateAlbumDto> {}
