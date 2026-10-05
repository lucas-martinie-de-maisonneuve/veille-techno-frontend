import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) return true;

  return authService
    .checkSession()
    .pipe(map((ok) => (ok ? true : router.createUrlTree(['/login']))));
};

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) return router.createUrlTree(['/board']);

  return authService
    .checkSession()
    .pipe(map((ok) => (ok ? router.createUrlTree(['/board']) : true)));
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.currentUser()?.role === 'admin') return true;

  return authService.checkSession().pipe(
    map((ok) => {
      if (!ok) return router.createUrlTree(['/login']);
      if (authService.currentUser()?.role !== 'admin') return router.createUrlTree(['/board']);
      return true;
    }),
  );
};
