import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8090';

  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

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
          this.loadCurrentUser();
        }),
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
          this.router.navigate(['/login']);
        },
      });
  }

  loadCurrentUser(): void {
    this.http
      .get<User>(`${this.apiUrl}/users/me`, { withCredentials: true })
      .subscribe({
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
}