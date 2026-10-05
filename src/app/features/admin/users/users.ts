import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { User } from '@shared/models/user.model';
import { ToastService } from '@core/services/toast';
import { environment } from '@env/environment';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly apiUrl = environment.apiUrl;

  users = signal<User[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  pageIndex = signal(0);
  pageSize = 20;

  editingUserId = signal<string | null>(null);
  editForm!: FormGroup;

  displayedColumns = ['username', 'email', 'role', 'createdAt', 'actions'];

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.users().filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  });

  paginatedUsers = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  constructor(
    private readonly http: HttpClient,
    private readonly toast: ToastService,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<User[]>(`${this.apiUrl}/users`, { withCredentials: true }).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  startEdit(user: User): void {
    this.editingUserId.set(user.id);
    this.editForm = this.fb.group({
      username: [user.username, [Validators.required, Validators.minLength(3)]],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role, Validators.required],
    });
  }

  cancelEdit(): void {
    this.editingUserId.set(null);
  }

  saveEdit(user: User): void {
    if (this.editForm.invalid) return;
    const payload = this.editForm.value;

    this.http
      .patch<User>(`${this.apiUrl}/users/${user.id}`, payload, { withCredentials: true })
      .subscribe({
        next: (updated) => {
          this.users.update((users) => users.map((u) => (u.id === updated.id ? updated : u)));
          this.editingUserId.set(null);
          this.toast.success('User updated');
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed to update user'),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.pageIndex.set(0);
  }
}
