import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService, AlbumService, TrackService } from '../../services';
import { Category, CreateCategoryDto } from '../../models';


@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {
private readonly categoryService = inject(CategoryService);
  private readonly albumService = inject(AlbumService);
  private readonly trackService = inject(TrackService);

  protected readonly categories = this.categoryService.categories;
  protected readonly showForm = signal(false);
  protected readonly editingCategory = signal<Category | null>(null);

  formData: CreateCategoryDto = {
    name: '',
    description: ''
  };

  getAlbumCount(categoryId: string): number {
    return this.albumService.getByCategory(categoryId).length;
  }

  getTrackCount(categoryId: string): number {
    return this.trackService.getByCategory(categoryId).length;
  }

  canDelete(categoryId: string): boolean {
    return this.getAlbumCount(categoryId) === 0 && this.getTrackCount(categoryId) === 0;
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.formData = {
      name: category.name,
      description: category.description || ''
    };
    this.showForm.set(true);
  }

  cancelEdit() {
    this.editingCategory.set(null);
    this.resetForm();
  }

  onSubmit() {
    const editing = this.editingCategory();

    if (editing) {
      this.categoryService.update(editing.id, this.formData);
    } else {
      this.categoryService.create(this.formData);
    }

    this.resetForm();
    this.showForm.set(false);
    this.editingCategory.set(null);
  }

  deleteCategory(id: string) {
    if (!this.canDelete(id)) return;

    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id);
    }
  }

  private resetForm() {
    this.formData = {
      name: '',
      description: ''
    };
  }
}
