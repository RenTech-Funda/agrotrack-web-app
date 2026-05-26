const plantSessionList = () => import('./plant-session-list/plant-session-list').then(m => m.PlantSessionList);
const plantSessionDetail = () => import('./plant-session-detail/plant-session-detail').then(m => m.PlantSessionDetail);
const plantSessionForm = () => import('./plant-session-form/plant-session-form').then(m => m.PlantSessionForm);
const plantObservationForm = () => import('./plant-observation-form/plant-observation-form').then(m => m.PlantObservationForm);

export const plantSessionRoutes = [
  { path: '', loadComponent: plantSessionList },
  { path: 'new', loadComponent: plantSessionForm },
  { path: ':sessionId/observations/new', loadComponent: plantObservationForm },
  { path: ':sessionId/observations/:observationId/edit', loadComponent: plantObservationForm },
  { path: ':id', loadComponent: plantSessionDetail }
];

