import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CardService, Card, Priority } from '../../core/services/card.service';
import { Column } from '../../core/services/column.service';
import { CardFormComponent } from './card-form.component';
import { CardDetailComponent } from './card-detail.component';
import { BoardStore } from '../../shared/store/board.store';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CardFormComponent, CardDetailComponent, FormsModule, CdkDropList, CdkDrag, CdkDropListGroup],
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit {
  private cardService = inject(CardService);
  private route = inject(ActivatedRoute);
  protected themeService = inject(ThemeService);
  protected auth = inject(AuthService);
  protected store = inject(BoardStore);

  filterLabelId = signal<number | null>(null);
  filterPriority = signal<Priority | null>(null);
  searchQuery = signal('');

  filteredCards = computed(() => {
    let result = this.store.cards();
    const labelId = this.filterLabelId();
    const priority = this.filterPriority();
    const query = this.searchQuery().trim().toLowerCase();
    if (labelId !== null) result = result.filter(c => c.labels.some(l => l.id === labelId));
    if (priority !== null) result = result.filter(c => c.priority === priority);
    if (query) result = result.filter(c => c.title.toLowerCase().includes(query));
    return result;
  });

  showForm = signal(false);
  editingCard = signal<Card | undefined>(undefined);
  formColumnId = signal<number | undefined>(undefined);
  toastMessage = signal('');
  confirmModal = signal<{ message: string; onConfirm: () => void } | null>(null);
  selectedCard = signal<Card | null>(null);
  private editingFromDetail = false;
  private dragging = false;

  ngOnInit(): void {
    const boardId = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.store.load(boardId).subscribe();
  }

  cardsForColumn(columnId: number): Card[] {
    return this.filteredCards().filter(c => c.columnId === columnId).sort((a, b) => a.order - b.order);
  }

  priorityDot(priority: Priority): string {
    return { Low: 'bg-green-400', Medium: 'bg-yellow-400', High: 'bg-red-500' }[priority];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  dueDateClass(date: string): string {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(date); due.setHours(0, 0, 0, 0);
    if (due < today) return 'text-red-500 dark:text-red-400 font-medium';
    if (due.getTime() === today.getTime()) return 'text-yellow-500 dark:text-yellow-400 font-medium';
    return 'text-gray-400 dark:text-gray-500';
  }

  openCreate(columnId: number): void {
    this.editingFromDetail = false;
    this.editingCard.set(undefined);
    this.formColumnId.set(columnId);
    this.showForm.set(true);
  }

  private openEdit(card: Card): void {
    this.editingCard.set(card);
    this.formColumnId.set(card.columnId);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCard.set(undefined);
  }

  onSaved(savedCard: Card): void {
    const reopenDetail = this.editingFromDetail;
    this.editingFromDetail = false;
    if (this.store.cards().find(c => c.id === savedCard.id)) {
      this.store.updateCard(savedCard);
    } else {
      this.store.addCard(savedCard);
    }
    this.closeForm();
    if (reopenDetail) {
      const merged = this.store.cards().find(c => c.id === savedCard.id);
      if (merged) this.selectedCard.set(merged);
    }
  }

  onDelete(card: Card): void {
    this.openConfirm(`Excluir o card "${card.title}"? Esta ação não pode ser desfeita.`, () => {
      this.cardService.delete(card.id).subscribe({
        next: () => {
          this.store.removeCard(card.id);
          if (this.selectedCard()?.id === card.id) this.closeDetail();
        },
        error: () => this.showToast('Erro ao excluir card.')
      });
    });
  }

  onEditFromDetail(card: Card): void {
    this.editingFromDetail = true;
    this.closeDetail();
    this.openEdit(card);
  }

  onDeleteFromDetail(card: Card): void {
    this.closeDetail();
    this.onDelete(card);
  }

  // CDK Drag & Drop
  onDropList(event: CdkDragDrop<number>): void {
    const cardId = event.item.data as number;
    const targetColumnId = event.container.data as number;
    const sourceColumnId = event.previousContainer.data as number;

    if (!cardId) return;

    const card = this.store.cards().find(c => c.id === cardId);
    if (!card) return;

    // Same column: reorder
    if (sourceColumnId === targetColumnId) {
      if (event.previousIndex === event.currentIndex) return;
      const targetOrder = event.currentIndex;

      this.store.reorderCards(cardId, targetOrder);

      this.cardService.reorder(cardId, targetOrder).subscribe({
        error: () => {
          this.store.load(this.store.boardId()).subscribe();
          this.showToast('Erro ao reordenar. Alteração revertida.');
        }
      });
      return;
    }

    // Different column: move
    const sourceOrder = card.order;
    const targetCards = this.store.cards().filter(c => c.columnId === targetColumnId);
    const newOrder = targetCards.length > 0 ? Math.max(...targetCards.map(c => c.order)) + 1 : 0;
    this.store.moveCard(cardId, targetColumnId, newOrder);

    this.cardService.move(cardId, targetColumnId).subscribe({
      next: () => {
        this.cardService.getAll().subscribe(freshCards => this.store.refreshCards(freshCards));
      },
      error: () => {
        this.store.moveCard(cardId, sourceColumnId, sourceOrder);
        this.showToast('Erro ao mover card. Alteração revertida.');
      }
    });
  }

  onFilterLabel(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterLabelId.set(value ? Number(value) : null);
  }

  onFilterPriority(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterPriority.set(value ? (value as Priority) : null);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearFilters(): void {
    this.filterLabelId.set(null);
    this.filterPriority.set(null);
    this.searchQuery.set('');
  }

  openDetail(card: Card): void {
    if (this.dragging) return;
    this.selectedCard.set(card);
  }

  onDragStarted(): void {
    this.dragging = true;
  }

  onDragEnded(): void {
    setTimeout(() => this.dragging = false, 0);
  }

  closeDetail(): void {
    this.selectedCard.set(null);
  }

  onCardUpdated(card: Card): void {
    this.store.updateCard(card);
    this.selectedCard.set(card);
  }

  onMoveFromDetail(event: { card: Card; columnId: number }): void {
    this.cardService.move(event.card.id, event.columnId).subscribe({
      next: () => {
        this.cardService.getAll().subscribe(freshCards => {
          this.store.refreshCards(freshCards);
          const updatedCard = this.store.cards().find(c => c.id === event.card.id);
          if (updatedCard) this.selectedCard.set(updatedCard);
        });
      },
      error: () => this.showToast('Erro ao mover card.')
    });
  }

  private openConfirm(message: string, onConfirm: () => void): void {
    this.confirmModal.set({ message, onConfirm });
  }

  closeConfirm(): void { this.confirmModal.set(null); }

  executeConfirm(): void {
    this.confirmModal()?.onConfirm();
    this.confirmModal.set(null);
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
