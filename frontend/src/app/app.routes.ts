import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'boards', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'boards', loadComponent: () => import('./features/boards/board-list.component').then(m => m.BoardListComponent), canActivate: [authGuard] },
  { path: 'boards/:id', loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent), canActivate: [authGuard] },
  { path: 'labels', loadComponent: () => import('./features/labels/labels.component').then(m => m.LabelsComponent), canActivate: [authGuard] },
  { path: 'columns', loadComponent: () => import('./features/columns/columns-manager.component').then(m => m.ColumnsManagerComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'boards' }
];
