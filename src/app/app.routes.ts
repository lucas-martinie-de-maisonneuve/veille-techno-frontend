import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, adminGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    canActivate: [noAuthGuard],
  },
  {
    path: 'board',
    loadComponent: () => import('./features/board/board/board').then((m) => m.Board),
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users').then((m) => m.Users),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'board',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'board',
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users').then((m) => m.Users),
    canActivate: [adminGuard],
  },
];
