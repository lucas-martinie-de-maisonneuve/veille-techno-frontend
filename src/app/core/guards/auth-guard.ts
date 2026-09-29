import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/models/user.model';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const authService = inject(AuthService);

  return http.get<User>('http://localhost:8090/users/me', { withCredentials: true }).pipe(
    map((user) => {
      authService.currentUser.set(user);
      authService.isLoggedIn.set(true);
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    }),
  );
};

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const authService = inject(AuthService);

  return http.get<User>('http://localhost:8090/users/me', { withCredentials: true }).pipe(
    map((user) => {
      authService.currentUser.set(user);
      authService.isLoggedIn.set(true);
      return router.createUrlTree(['/board']);
    }),
    catchError(() => {
      return of(true);
    }),
  );
};
