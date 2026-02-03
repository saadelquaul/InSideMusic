import { Component, inject } from '@angular/core';
import { AudioPlayerService } from '../../services';

@Component({
  selector: 'app-audio-player',
  standalone:true,
  imports: [],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.css',
})
export class AudioPlayer {
   protected readonly audioPlayerService = inject(AudioPlayerService);

  togglePlayPause() {
    if (this.audioPlayerService.isPlaying()) {
      this.audioPlayerService.pause();
    } else {
      this.audioPlayerService.play();
    }
  }

  onProgressClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    this.audioPlayerService.seekToPercent(percent);
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audioPlayerService.setVolume(parseFloat(input.value));
  }

}
