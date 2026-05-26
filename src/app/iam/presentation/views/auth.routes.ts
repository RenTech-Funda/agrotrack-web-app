import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('../views/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('../views/register/register').then(m => m.RegisterComponent)
  }
];
