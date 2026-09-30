import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { List } from '../../../shared/models/list.model';
import { Card } from '../../../shared/models/card.model';
import { CardService } from '../../../shared/services/card';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-list-column',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: './list-column.html',
  styleUrl: './list-column.scss',
})
export class ListColumn implements OnInit {
  @Input() list!: List;
  @Output() deleteRequested = new EventEmitter<void>();

  cards = signal<Card[]>([]);
  newCardTitle = '';
  showAddCard = signal(false);

  constructor(
    private readonly cardService: CardService,
    private readonly toast: ToastService,
  ) { }

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
}