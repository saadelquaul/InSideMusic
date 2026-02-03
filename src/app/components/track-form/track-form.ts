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
  templateUrl: './track-form.html',
  styleUrl: './track-form.css',
})
export class TrackForm {
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
