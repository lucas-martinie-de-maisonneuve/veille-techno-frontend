import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { List } from '@shared/models/list.model';
import { Card } from '@shared/models/card.model';
import { CardService } from '@shared/services/card';
import { ToastService } from '@core/services/toast';
import { MatDialog } from '@angular/material/dialog';
import { CardDialog } from '../card-dialog/card-dialog';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-list-column',
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './list-column.html',
  styleUrl: './list-column.scss',
})
export class ListColumn implements OnInit {
  @Input() list!: List;
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() titleChanged = new EventEmitter<string>();
  @Input() connectedLists: string[] = [];

  cards = signal<Card[]>([]);
  newCardTitle = '';
  showAddCard = signal(false);
  editingTitle = signal(false);
  editTitle = '';

  constructor(
    private readonly cardService: CardService,
    private readonly toast: ToastService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.cardService.getCards(this.list.id).subscribe({
      next: (cards) => this.cards.set(cards),
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to load cards'),
    });
  }

  addCard(): void {
    if (!this.newCardTitle.trim()) return;
    this.cardService.createCard(this.list.id, this.newCardTitle.trim()).subscribe({
      next: (card) => {
        this.cards.update((cards) => [...cards, card]);
        this.newCardTitle = '';
        this.showAddCard.set(false);
        this.toast.success('Card created');
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to create card'),
    });
  }

  cancelAddCard(): void {
    this.newCardTitle = '';
    this.showAddCard.set(false);
  }

  startEditTitle(): void {
    this.editTitle = this.list.title;
    this.editingTitle.set(true);
  }

  saveTitle(): void {
    if (!this.editTitle.trim() || this.editTitle === this.list.title) {
      this.editingTitle.set(false);
      return;
    }
    this.titleChanged.emit(this.editTitle.trim());
    this.editingTitle.set(false);
  }

  cancelEditTitle(): void {
    this.editingTitle.set(false);
  }

  openCard(card: Card): void {
    const dialogRef = this.dialog.open(CardDialog, {
      width: '90vw',
      maxWidth: '95vw',
      height: '85vw',
      maxHeight: '90vh',
      data: { card, listTitle: this.list.title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result.action === 'update') {
        this.cards.update((cards) => cards.map((c) => (c.id === result.card.id ? result.card : c)));
      }
      if (result.action === 'delete') {
        this.confirmAndDelete(result.card.id);
      }
    });
  }

  confirmAndDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete card',
        message: 'Are you sure you want to delete this card?',
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.cardService.deleteCard(id).subscribe({
        next: () => {
          this.cards.update((cards) => cards.filter((c) => c.id !== id));
          this.toast.success('Card deleted');
        },
        error: (err) => this.toast.error(err.error?.message ?? 'Failed to delete card'),
      });
    });
  }

  onDrop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.cards.set([...event.container.data]);
      this.cardService
        .updateCard(event.container.data[event.currentIndex].id, {
          position: event.currentIndex,
        })
        .subscribe({
          error: (err) => this.toast.error(err.error?.message ?? 'Failed to move card'),
        });
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.cards.set([...event.container.data]);
      const movedCard = event.container.data[event.currentIndex];
      this.cardService
        .updateCard(movedCard.id, {
          listId: this.list.id,
          position: event.currentIndex,
        })
        .subscribe({
          error: (err) => this.toast.error(err.error?.message ?? 'Failed to move card'),
        });
    }
  }
}
