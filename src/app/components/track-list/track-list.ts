import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrackService, CategoryService, AudioPlayerService } from '../../services';
import { Track } from '../../models';


@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './track-list.html',
  styleUrl: './track-list.css',
})
export class TrackList {

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
