import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Card } from '@shared/models/card.model';
import { CardService } from '@shared/services/card';
import { ToastService } from '@core/services/toast';

export interface CardDialogData {
  card: Card;
  listTitle: string;
}

@Component({
  selector: 'app-card-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
  templateUrl: './card-dialog.html',
  styleUrl: './card-dialog.scss',
})
export class CardDialog {
  form: FormGroup;
  loading = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CardDialogData,
    private readonly fb: FormBuilder,
    private readonly cardService: CardService,
    private readonly toast: ToastService,
  ) {
    this.form = this.fb.group({
      title: [data.card.title, [Validators.required, Validators.minLength(1)]],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.cardService.updateCard(this.data.card.id, { title: this.form.value.title }).subscribe({
      next: (updated) => {
        this.toast.success('Card updated');
        this.dialogRef.close({ action: 'update', card: updated });
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to update card');
        this.loading.set(false);
      },
    });
  }

  delete(): void {
    this.dialogRef.close({ action: 'delete', card: this.data.card });
  }
}
