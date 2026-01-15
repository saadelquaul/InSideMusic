import { Injectable, signal } from '@angular/core';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly categoriesSignal =
    signal<Category[]>([
      {
        id: '1',
        name: 'Pop',
        description: 'Popular music with catchy melodies',
        color: '#f472b6',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Rock',
        description: 'Rock and alternative music',
        color: '#ef4444',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Jazz',
        description: 'Jazz and blues music',
        color: '#8b5cf6',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Electronic',
        description: 'Electronic and dance music',
        color: '#22c55e',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Classical',
        description: 'Classical and orchestral music',
        color: '#f59e0b',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Rap',
        description: 'Hip-hop and rap music',
        color: '#3b82f6',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  readonly categories = this.categoriesSignal.asReadonly();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  getAll(): Category[] {
    return this.categoriesSignal();
  }

  getById(id: string): Category | undefined {
    return this.categoriesSignal().find(c => c.id === id);
  }

  create(dto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: this.generateId(),
      color: dto.color || this.getRandomColor(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categoriesSignal.update(categories => [...categories, newCategory]);
    return newCategory;
  }

  update(id: string, dto: UpdateCategoryDto): Category | undefined {
    const index = this.categoriesSignal().findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updated: Category = {
      ...this.categoriesSignal()[index],
      ...dto,
      updatedAt: new Date()
    };

    this.categoriesSignal.update(categories => {
      const newCategories = [...categories];
      newCategories[index] = updated;
      return newCategories;
    });

    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this.categoriesSignal().length;
    this.categoriesSignal.update(categories => categories.filter(c => c.id !== id));
    return this.categoriesSignal().length < initialLength;
  }

  private getRandomColor(): string {
    const colors = ['#f472b6', '#ef4444', '#8b5cf6',
      '#22c55e', '#f59e0b', '#3b82f6',
      '#06b6d4', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
