import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/home/home').then(({ Home }) => Home),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('@features/portfolio/portfolio').then(({ Portfolio }) => Portfolio),
  },
  {
    path: '**',
    loadComponent: () => import('@features/not-found/not-found').then(({ NotFound }) => NotFound),
  },
];
