import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { username, email, password } = this.form.value;

    this.authService.register(username, email, password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.toast.error(err.error?.message ?? 'An error occurred');
        this.loading.set(false);
      },
    });
  }

  onNavigateToLogin(): void {
    const host = document.querySelector('app-register') as HTMLElement;
    host.style.animation = 'collapseOut 400ms ease-in forwards';
    setTimeout(() => this.router.navigate(['/login']), 400);
  }
}
