import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '@shared/models/user.model';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private sessionCheck$?: Observable<boolean>;

  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) { }

  checkSession(): Observable<boolean> {
    this.sessionCheck$ ??= this.http
      .get<User>(`${this.apiUrl}/users/me`, { withCredentials: true })
      .pipe(
        map((user) => {
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
          return true;
        }),
        catchError(() => {
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
          return of(false);
        }),
        shareReplay(1),
      );
    return this.sessionCheck$;
  }

  login(email: string, password: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          this.isLoggedIn.set(true);
          this.sessionCheck$ = undefined;
          this.loadCurrentUser();
        }),
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        this.sessionCheck$ = of(false);
        this.router.navigate(['/login']);
      },
    });
  }

  loadCurrentUser(): void {
    this.http.get<User>(`${this.apiUrl}/users/me`, { withCredentials: true }).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      },
      error: () => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      },
    });
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/auth/register`,
      { username, email, password },
      { withCredentials: true },
    );
  }
}
