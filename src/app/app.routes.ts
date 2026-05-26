import { Routes } from '@angular/router';
import {iamGuard} from './iam/infrastructure/iam.guard';
import {Layout} from './shared/presentation/components/layout/layout';

const baseTitle = 'Agrotrack';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./iam/presentation/views/login/login').then(m => m.LoginComponent),
    title: `${baseTitle} | Login`
  },
  {
    path: 'register',
    loadComponent: () => import('./iam/presentation/views/register/register').then(m => m.RegisterComponent),
    title: `${baseTitle} | Register`
  },
  {
    path: '',
    component: Layout,
    canActivate: [iamGuard],
    children: [
      {
        path: 'organization',
        loadChildren: () => import('./organization/presentation/views/organization.routes').then(m => m.organizationRoutes),
        title: `${baseTitle} | Organizations`
      },
      {
        path: 'report', // O 'reports' si decides cambiarlo
        loadChildren: () => import('./report/presentation/views/report.routes').then(m => m.reportRoutes),
        title: `${baseTitle} | Reports`
      },
      {
        path: 'monitoring',
        loadChildren: () => import('./monitoring-control/presentation/views/monitoring.routes').then(m => m.monitoringRoutes),
        title: `${baseTitle} | Monitoring`
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./monitoring-control/presentation/views/task.routes').then(m => m.taskRoutes),
        title: `${baseTitle} | Tasks`
      },
      {
        path: 'sampling-sessions',
        loadChildren: () =>
          import('./monitoring-control/presentation/views/plant-session.routes').then(m => m.plantSessionRoutes),
        title: `${baseTitle} | Sampling Sessions`
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/presentation/views/settings.routes').then(m => m.settingsRoutes),
        title: `${baseTitle} | Settings`
      }
    ]
  },

  { path: '**', loadComponent:() => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound),
  title: `${baseTitle} | Page Not Found`}

];
