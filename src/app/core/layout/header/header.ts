import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileDialog } from '../../profile-dialog/profile-dialog';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(
    readonly authService: AuthService,
    private readonly dialog: MatDialog,
  ) {}

  openProfile(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.dialog.open(ProfileDialog, {
      width: '700px',
      maxWidth: '95vw',
      data: user,
    });
  }
}
