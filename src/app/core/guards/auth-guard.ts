import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService)
    .checkSession()
    .pipe(map((ok) => (ok ? true : router.createUrlTree(['/login']))));
};

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService)
    .checkSession()
    .pipe(map((ok) => (ok ? router.createUrlTree(['/board']) : true)));
};
