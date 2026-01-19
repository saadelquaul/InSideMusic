import { Component, inject } from '@angular/core';
import { AudioPlayerService } from '../../services';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [],
  template: `
    @if (audioPlayerService.currentTrack()) {
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div class="max-w-7xl mx-auto">
          <!-- Progress Bar -->
          <div
            class="h-1 bg-gray-200 cursor-pointer group"
            (click)="onProgressClick($event)"
          >
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative transition-all"
              [style.width.%]="audioPlayerService.progress()"
            >
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div class="px-4 py-3 flex items-center gap-4">
            <!-- Track Info -->
            <div class="flex items-center gap-3 min-w-0 w-64">
              <img
                [src]="audioPlayerService.currentTrack()?.coverUrl || 'https://via.placeholder.com/48/6366f1/ffffff?text=♪'"
                [alt]="audioPlayerService.currentTrack()?.title"
                class="w-14 h-14 rounded-lg object-cover shadow"
              >
              <div class="min-w-0">
                <h4 class="font-semibold text-gray-900 truncate">{{ audioPlayerService.currentTrack()?.title }}</h4>
                <p class="text-sm text-gray-500 truncate">{{ audioPlayerService.currentTrack()?.artist }}</p>
              </div>
            </div>

            <!-- Main Controls -->
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="flex items-center gap-2">
                <!-- Shuffle -->
                <button
                  (click)="audioPlayerService.toggleShuffle()"
                  class="p-2 rounded-full transition-colors"
                  [class.text-indigo-600]="audioPlayerService.isShuffled()"
                  [class.text-gray-400]="!audioPlayerService.isShuffled()"
                  [class.hover:text-gray-600]="!audioPlayerService.isShuffled()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                <!-- Previous -->
                <button
                  (click)="audioPlayerService.previous()"
                  [disabled]="!audioPlayerService.hasPrevious()"
                  class="p-2 rounded-full text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <!-- Play/Pause -->
                <button
                  (click)="togglePlayPause()"
                  class="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  @if (audioPlayerService.isBuffering()) {
                    <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  } @else if (audioPlayerService.isPlaying()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  }
                </button>

                <!-- Next -->
                <button
                  (click)="audioPlayerService.next()"
                  [disabled]="!audioPlayerService.hasNext()"
                  class="p-2 rounded-full text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>

                <!-- Loop -->
                <button
                  (click)="audioPlayerService.toggleLoop()"
                  class="p-2 rounded-full transition-colors"
                  [class.text-indigo-600]="audioPlayerService.isLooping()"
                  [class.text-gray-400]="!audioPlayerService.isLooping()"
                  [class.hover:text-gray-600]="!audioPlayerService.isLooping()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <!-- Time Display -->
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>{{ audioPlayerService.formattedCurrentTime() }}</span>
                <span>/</span>
                <span>{{ audioPlayerService.formattedDuration() }}</span>
              </div>
            </div>

            <!-- Volume Control -->
            <div class="flex items-center gap-2 w-36">
              <button
                (click)="audioPlayerService.toggleMute()"
                class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                @if (audioPlayerService.isMuted() || audioPlayerService.volume() === 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                } @else if (audioPlayerService.volume() < 0.5) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                }
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                [value]="audioPlayerService.volume()"
                (input)="onVolumeChange($event)"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Spacer to prevent content from being hidden behind the player -->
      <div class="h-24"></div>
    }
  `,
  styles: [`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4f46e5;
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4f46e5;
      cursor: pointer;
      border: none;
    }
  `]
})
export class AudioPlayerComponent {
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
