import { Routes } from '@angular/router';

export const taskRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./task-list/task-list').then(m => m.TaskList)
  },
  {
    path: 'create',
    loadComponent: () => import('./task-create/task-create').then(m => m.TaskCreate)
  }
];
