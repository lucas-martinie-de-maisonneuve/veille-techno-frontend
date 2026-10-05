import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { User } from '@shared/models/user.model';
import { AuthService } from '@core/services/auth';
import { ToastService } from '@core/services/toast';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-profile-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.scss',
})
export class ProfileDialog {
  form: FormGroup;
  loading = signal(false);
  private readonly apiUrl = environment.apiUrl;

  constructor(
    public dialogRef: MatDialogRef<ProfileDialog>,
    @Inject(MAT_DIALOG_DATA) public user: User,
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly http: HttpClient,
  ) {
    this.form = this.fb.group({
      username: [user.username, [Validators.required, Validators.minLength(3)]],
      email: [user.email, [Validators.required, Validators.email]],
      password: [''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const payload: Record<string, string> = {};
    const { username, email, password } = this.form.value;
    if (username !== this.user.username) payload['username'] = username;
    if (email !== this.user.email) payload['email'] = email;
    if (password?.trim()) payload['password'] = password;

    if (Object.keys(payload).length === 0) {
      this.dialogRef.close();
      return;
    }

    this.http
      .patch<User>(`${this.apiUrl}/users/${this.user.id}`, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          this.authService.loadCurrentUser();
          this.toast.success('Profile updated');
          this.dialogRef.close();
          this.loading.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? 'Failed to update profile');
          this.loading.set(false);
        },
      });
  }
}
