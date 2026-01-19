import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrackService, CategoryService } from '../../services';
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE
} from '../../models';

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="mb-8">
        <a routerLink="/tracks" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Library
        </a>
      </div>

      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">
          {{ isEditMode() ? 'Edit Track' : 'Add New Track' }}
        </h1>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="trackForm" (ngSubmit)="onSubmit()">
          <div class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                Title * <span class="text-gray-400">({{ trackForm.get('title')?.value?.length || 0 }}/{{ MAX_TITLE_LENGTH }})</span>
              </label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="trackForm.get('title')?.invalid && trackForm.get('title')?.touched"
                [class.border-gray-300]="!(trackForm.get('title')?.invalid && trackForm.get('title')?.touched)"
                placeholder="Enter track title"
              >
              @if (trackForm.get('title')?.invalid && trackForm.get('title')?.touched) {
                <p class="mt-1 text-xs text-red-500">
                  @if (trackForm.get('title')?.errors?.['required']) {
                    Title is required
                  } @else if (trackForm.get('title')?.errors?.['maxlength']) {
                    Title must be {{ MAX_TITLE_LENGTH }} characters or less
                  }
                </p>
              }
            </div>

            <!-- Artist -->
            <div>
              <label for="artist" class="block text-sm font-medium text-gray-700 mb-1">Artist *</label>
              <input
                type="text"
                id="artist"
                formControlName="artist"
                class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="trackForm.get('artist')?.invalid && trackForm.get('artist')?.touched"
                [class.border-gray-300]="!(trackForm.get('artist')?.invalid && trackForm.get('artist')?.touched)"
                placeholder="Enter artist name"
              >
              @if (trackForm.get('artist')?.invalid && trackForm.get('artist')?.touched) {
                <p class="mt-1 text-xs text-red-500">Artist is required</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-gray-400">({{ trackForm.get('description')?.value?.length || 0 }}/{{ MAX_DESCRIPTION_LENGTH }})</span>
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="trackForm.get('description')?.invalid && trackForm.get('description')?.touched"
                [class.border-gray-300]="!(trackForm.get('description')?.invalid && trackForm.get('description')?.touched)"
                placeholder="Optional description (max 200 characters)"
              ></textarea>
              @if (trackForm.get('description')?.invalid && trackForm.get('description')?.touched) {
                <p class="mt-1 text-xs text-red-500">Description must be {{ MAX_DESCRIPTION_LENGTH }} characters or less</p>
              }
            </div>

            <!-- Category -->
            <div>
              <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                id="categoryId"
                formControlName="categoryId"
                class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-300]="trackForm.get('categoryId')?.invalid && trackForm.get('categoryId')?.touched"
                [class.border-gray-300]="!(trackForm.get('categoryId')?.invalid && trackForm.get('categoryId')?.touched)"
              >
                <option value="">Select a category</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
              @if (trackForm.get('categoryId')?.invalid && trackForm.get('categoryId')?.touched) {
                <p class="mt-1 text-xs text-red-500">Please select a category</p>
              }
            </div>

            <!-- Audio File Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Audio File {{ isEditMode() ? '' : '*' }}
              </label>
              <div
                class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                [class.border-gray-300]="!audioFileError()"
                [class.border-red-300]="audioFileError()"
                (click)="audioFileInput.click()"
                (dragover)="onDragOver($event)"
                (drop)="onAudioFileDrop($event)"
              >
                <input
                  #audioFileInput
                  type="file"
                  accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                  class="hidden"
                  (change)="onAudioFileSelected($event)"
                >
                @if (audioFileName()) {
                  <div class="flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <div class="text-left">
                      <p class="font-medium text-gray-900">{{ audioFileName() }}</p>
                      <p class="text-sm text-gray-500">{{ audioFileSize() }}</p>
                    </div>
                    <button type="button" (click)="clearAudioFile($event)" class="p-1 text-gray-400 hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">
                    <span class="font-medium text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-500 mt-1">MP3, WAV, or OGG (max 10MB)</p>
                }
              </div>
              @if (audioFileError()) {
                <p class="mt-1 text-xs text-red-500">{{ audioFileError() }}</p>
              }
            </div>

            <!-- Cover Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image (Optional)</label>
              <div class="flex gap-4 items-start">
                <div
                  class="flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                  [class.border-gray-300]="!coverImageError()"
                  [class.border-red-300]="coverImageError()"
                  (click)="coverImageInput.click()"
                  (dragover)="onDragOver($event)"
                  (drop)="onCoverImageDrop($event)"
                >
                  <input
                    #coverImageInput
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    class="hidden"
                    (change)="onCoverImageSelected($event)"
                  >
                  @if (coverImageName()) {
                    <div class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p class="font-medium text-gray-900">{{ coverImageName() }}</p>
                      <button type="button" (click)="clearCoverImage($event)" class="p-1 text-gray-400 hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-600">
                      <span class="font-medium text-indigo-600">Upload cover</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">PNG or JPEG</p>
                  }
                </div>
                @if (coverImagePreview()) {
                  <img [src]="coverImagePreview()" class="w-24 h-24 rounded-lg object-cover shadow-md" alt="Cover preview">
                }
              </div>
              @if (coverImageError()) {
                <p class="mt-1 text-xs text-red-500">{{ coverImageError() }}</p>
              }
            </div>

            <!-- Submit Button -->
            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                [disabled]="isSubmitting() || (!isEditMode() && !audioFile())"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                } @else {
                  {{ isEditMode() ? 'Update Track' : 'Create Track' }}
                }
              </button>
              <a
                routerLink="/tracks"
                class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TrackFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly trackService = inject(TrackService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  protected readonly MAX_TITLE_LENGTH = MAX_TITLE_LENGTH;
  protected readonly MAX_DESCRIPTION_LENGTH = MAX_DESCRIPTION_LENGTH;

  protected readonly categories = this.categoryService.categories;
  protected readonly isEditMode = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Audio file signals
  protected readonly audioFile = signal<File | null>(null);
  protected readonly audioFileName = signal<string>('');
  protected readonly audioFileSize = signal<string>('');
  protected readonly audioFileError = signal<string | null>(null);

  // Cover image signals
  protected readonly coverImage = signal<File | null>(null);
  protected readonly coverImageName = signal<string>('');
  protected readonly coverImagePreview = signal<string>('');
  protected readonly coverImageError = signal<string | null>(null);

  private trackId: string | null = null;

  trackForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(MAX_TITLE_LENGTH)]],
    artist: ['', [Validators.required]],
    description: ['', [Validators.maxLength(MAX_DESCRIPTION_LENGTH)]],
    categoryId: ['', [Validators.required]]
  });

  ngOnInit() {
    this.trackId = this.route.snapshot.paramMap.get('id');

    if (this.trackId) {
      this.isEditMode.set(true);
      const track = this.trackService.getById(this.trackId);
      if (track) {
        this.trackForm.patchValue({
          title: track.title,
          artist: track.artist,
          description: track.description || '',
          categoryId: track.categoryId
        });

        // Show existing file info
        if (track.audioUrl) {
          this.audioFileName.set('Existing audio file');
        }
        if (track.coverUrl) {
          this.coverImagePreview.set(track.coverUrl);
          this.coverImageName.set('Existing cover image');
        }
      } else {
        this.router.navigate(['/tracks']);
      }
    }
  }

  // File validation and selection
  onAudioFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleAudioFile(input.files[0]);
    }
  }

  onAudioFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleAudioFile(file);
    }
  }

  private handleAudioFile(file: File) {
    this.audioFileError.set(null);

    // Validate format
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      this.audioFileError.set('Invalid format. Please use MP3, WAV, or OGG.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      this.audioFileError.set(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    this.audioFile.set(file);
    this.audioFileName.set(file.name);
    this.audioFileSize.set(this.formatFileSize(file.size));
  }

  clearAudioFile(event: Event) {
    event.stopPropagation();
    this.audioFile.set(null);
    this.audioFileName.set('');
    this.audioFileSize.set('');
    this.audioFileError.set(null);
  }

  onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleCoverImage(input.files[0]);
    }
  }

  onCoverImageDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleCoverImage(file);
    }
  }

  private handleCoverImage(file: File) {
    this.coverImageError.set(null);

    // Validate format
    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      this.coverImageError.set('Invalid format. Please use PNG or JPEG.');
      return;
    }

    // Validate size (5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      this.coverImageError.set('File too large. Maximum size is 5MB.');
      return;
    }

    this.coverImage.set(file);
    this.coverImageName.set(file.name);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverImagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearCoverImage(event: Event) {
    event.stopPropagation();
    this.coverImage.set(null);
    this.coverImageName.set('');
    this.coverImagePreview.set('');
    this.coverImageError.set(null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async onSubmit() {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }

    // For new tracks, audio file is required
    if (!this.isEditMode() && !this.audioFile()) {
      this.audioFileError.set('Please select an audio file');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const formValue = this.trackForm.value;

      if (this.isEditMode() && this.trackId) {
        await this.trackService.update(this.trackId, {
          title: formValue.title,
          artist: formValue.artist,
          description: formValue.description || undefined,
          categoryId: formValue.categoryId,
          audioFile: this.audioFile() || undefined,
          coverImage: this.coverImage() || undefined
        });
      } else {
        await this.trackService.create({
          title: formValue.title,
          artist: formValue.artist,
          description: formValue.description || undefined,
          categoryId: formValue.categoryId,
          audioFile: this.audioFile() || undefined,
          coverImage: this.coverImage() || undefined
        });
      }

      this.router.navigate(['/tracks']);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Failed to save track');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
