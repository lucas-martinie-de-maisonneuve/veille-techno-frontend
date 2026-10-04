import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListService } from '@shared/services/list';
import { ToastService } from '@core/services/toast';
import { List } from '@shared/models/list.model';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { ListColumn } from '@features/board/list-column/list-column';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ListColumn,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit {
  lists = signal<List[]>([]);
  loading = signal(true);
  newListTitle = '';
  showAddList = signal(false);

  get listIds(): string[] {
    return this.lists().map((l) => l.id);
  }

  constructor(
    private readonly listService: ListService,
    private readonly toast: ToastService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.loading.set(true);
    this.listService.getLists().subscribe({
      next: (lists) => {
        this.lists.set(lists);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to load lists');
        this.loading.set(false);
      },
    });
  }

  addList(): void {
    if (!this.newListTitle.trim()) return;

    this.listService.createList(this.newListTitle.trim()).subscribe({
      next: (list) => {
        this.lists.update((lists) => [...lists, list]);
        this.newListTitle = '';
        this.showAddList.set(false);
        this.toast.success('List created');
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to create list');
      },
    });
  }

  deleteList(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete list',
        message: 'Are you sure you want to delete this list? All cards will be deleted too.',
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.listService.deleteList(id).subscribe({
        next: () => {
          this.lists.update((lists) => lists.filter((l) => l.id !== id));
          this.toast.success('List deleted');
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? 'Failed to delete list');
        },
      });
    });
  }

  cancelAddList(): void {
    this.newListTitle = '';
    this.showAddList.set(false);
  }

  onListDrop(event: CdkDragDrop<List[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.listsArray, event.previousIndex, event.currentIndex);

    const movedList = this.listsArray[event.currentIndex];
    this.listService.updateList(movedList.id, { position: event.currentIndex }).subscribe({
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to reorder list');
        this.loadLists();
      },
    });
  }

  get listsArray(): List[] {
    return this.lists();
  }

  updateListTitle(id: string, title: string): void {
    this.listService.updateList(id, { title }).subscribe({
      next: (updated) => {
        this.lists.update((lists) =>
          lists.map((l) => (l.id === id ? { ...l, title: updated.title } : l))
        );
        this.toast.success('List renamed');
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to rename list'),
    });
  }
}
