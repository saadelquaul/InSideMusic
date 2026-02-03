import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: 'InSideMusic - Home'
  },
  // Track routes
  {
    path: 'tracks',
    loadComponent: () => import('./components/track-list/track-list').then(m => m.TrackList),
    title: 'Library - InSideMusic'
  },
  {
    path: 'tracks/new',
    loadComponent: () => import('./components/track-form/track-form').then(m => m.TrackForm),
    title: 'Upload Track - InSideMusic'
  },
  {
    path: 'tracks/:id/edit',
    loadComponent: () => import('./components/track-form/track-form').then(m => m.TrackForm),
    title: 'Edit Track - InSideMusic'
  },
  // Category routes
  {
    path: 'categories',
    loadComponent: () => import('./components/category-list/category-list').then(m => m.CategoryList),
    title: 'Categories - InSideMusic'
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
