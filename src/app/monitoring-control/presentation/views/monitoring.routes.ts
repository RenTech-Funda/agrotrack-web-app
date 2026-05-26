const readingList = () => import('./reading-list/reading-list').then(m => m.ReadingList);
const readingForm = () => import('./reading-form/reading-form').then(m => m.ReadingForm);
const plantRegistrationList = () => import('./plant-registration-list/plant-registration-list').then(m => m.PlantRegistrationList);
const wheatherStatus = () => import('./weather-status/weather-status').then(m => m.WeatherStatus);

export const monitoringRoutes = [
  { path: '', loadComponent: readingList },
  { path: 'new', loadComponent: readingForm },
  { path: 'plant-registration', loadComponent: plantRegistrationList },
  { path: 'weather', loadComponent: wheatherStatus }
];
