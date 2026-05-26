import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token del sessionStorage
  const token = sessionStorage.getItem('auth_token');

  // Si existe el token y la petición no es de login o register, lo añadimos
  if (token && !req.url.includes('/sign-in') && !req.url.includes('/sign-up')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
