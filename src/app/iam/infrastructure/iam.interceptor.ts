import {HttpInterceptorFn} from '@angular/common/http';
import {IamStore} from '../application/iam.store';
import {inject} from '@angular/core';

/**
 * HTTP interceptor for adding authorization headers to requests in the infrastructure layer of the IAM bounded context.
 * Injects the Bearer token from the IAM store if available.
 */
export const iamInterceptor: HttpInterceptorFn = (
  request,
  next) => {
  const store = inject(IamStore);
  // Get the token from local storage.
  const token = store.currentToken();
  // If the token exists, add it to the request headers. Otherwise, send the request as is.
  const handledRequest = token
    ? request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)})
    : request;
  console.log(token);
  // Return the handled request.
  return next(handledRequest);
};
