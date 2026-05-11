import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CardService, Card, Priority } from '../../core/services/card.service';
import { ColumnService, Column } from '../../core/services/column.service';
import { LabelService, Label } from '../../core/services/label.service';
import { CardFormComponent } from './card-form.component';
import { CardDetailComponent } from './card-detail.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CardFormComponent, CardDetailComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <!-- Toast de erro -->
      @if (toastMessage()) {
        <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {{ toastMessage() }}
        </div>
      }

      <!-- Header do board -->
      <div class="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <a href="/boards" class="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">← Boards</a>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Board</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <a href="/labels" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Etiquetas</a>
          <a [href]="'/columns?boardId=' + boardId" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Colunas</a>
          <button (click)="themeService.toggleTheme()"
            class="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {{ themeService.isDark() ? 'Light' : 'Dark' }}
          </button>
          <button (click)="auth.logout()"
            class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 font-medium">
            Sair
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <!-- Busca por título -->
        <div class="flex items-center gap-2">
          <input type="text" placeholder="Buscar card..." (input)="onSearch($event)"
            [value]="searchQuery()"
            class="text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-1"
            style="min-width:160px" />
        </div>

        <!-- Filtro por etiqueta -->
        @if (labels().length > 0) {
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 dark:text-gray-400 font-medium">Etiqueta:</label>
            <select (change)="onFilterLabel($event)"
              style="min-width:120px"
              class="text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-2 py-1">
              <option value="">Todas</option>
              @for (label of labels(); track label.id) {
                <option [value]="label.id">{{ label.name }}</option>
              }
            </select>
          </div>
        }

        <!-- Filtro por prioridade -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400 font-medium">Prioridade:</label>
          <select (change)="onFilterPriority($event)"
            style="min-width:100px"
            class="text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-2 py-1">
            <option value="">Todas</option>
            <option value="Low">Baixa</option>
            <option value="Medium">Média</option>
            <option value="High">Alta</option>
          </select>
        </div>

        <!-- Limpar filtros -->
        @if (filterLabelId() !== null || filterPriority() !== null || searchQuery()) {
          <button (click)="clearFilters()"
            class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 font-medium underline">
            Limpar filtros
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Carregando board...</p>
          </div>
        </div>
      }

      <!-- Colunas -->
      @if (!loading()) {
        <div class="flex gap-4 p-6 overflow-x-auto min-h-[calc(100vh-65px)]">
          @for (col of sortedColumns(); track col.id) {
            <div class="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col"
              (dragover)="onDragOver($event, col.id)"
              (drop)="onDrop($event, col.id)"
              (dragleave)="onDragLeave()"
              [class.ring-2]="dragOverColumnId() === col.id"
              [class.ring-blue-400]="dragOverColumnId() === col.id">
              <!-- Header da coluna -->
              <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 class="font-semibold text-gray-800 dark:text-gray-100 text-sm">{{ col.name }}</h2>
                <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                  {{ cardsForColumn(col.id).length }}
                </span>
              </div>

              <!-- Cards -->
              <div class="flex-1 p-3 space-y-2 overflow-y-auto">
                @for (card of cardsForColumn(col.id); track card.id) {
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-600 cursor-pointer"
                    draggable="true"
                    (click)="openDetail(card)"
                    (dragstart)="onDragStart(card.id)"
                    (dragend)="onDragEnd()"
                    (dragover)="onDragOverCard($event, card.id)"
                    (dragleave)="onDragLeaveCard()"
                    [class.opacity-50]="draggingCardId() === card.id"
                    [class.border-blue-400]="dragOverCardId() === card.id && draggingCardId() !== card.id"
                    [class.border-2]="dragOverCardId() === card.id && draggingCardId() !== card.id">
                    <!-- Prioridade + título -->
                    <div class="flex items-start gap-2 mb-2">
                      <span class="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full" [class]="priorityDot(card.priority)"></span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white leading-tight">{{ card.title }}</span>
                    </div>

                    <!-- Descrição (preview) -->
                    @if (card.description) {
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{{ card.description }}</p>
                    }

                    <!-- Prazo -->
                    @if (card.dueDate) {
                      <p class="text-xs mb-2" [class]="dueDateClass(card.dueDate)">📅 {{ formatDate(card.dueDate) }}</p>
                    }

                    <!-- Etiquetas -->
                    @if (card.labels.length > 0) {
                      <div class="flex flex-wrap gap-1 mb-2">
                        @for (label of card.labels; track label.id) {
                          <span class="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            [style.background-color]="label.color">
                            {{ label.name }}
                          </span>
                        }
                      </div>
                    }

                    <!-- Contadores (subtarefas e comentários) -->
                    <div class="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                      @if (card.subtasks.length > 0) {
                        <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          ▣ {{ card.subtasks.filter(s => s.isCompleted).length }}/{{ card.subtasks.length }}
                        </span>
                      }
                      @if (card.comments.length > 0) {
                        <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          💬 {{ card.comments.length }}
                        </span>
                      }
                      <span class="ml-auto text-xs text-gray-300 dark:text-gray-600">clique para abrir</span>
                    </div>
                  </div>
                }
                @if (cardsForColumn(col.id).length === 0) {
                  <p class="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Nenhum card</p>
                }
              </div>

              <!-- Adicionar card -->
              <div class="p-3 border-t border-gray-100 dark:border-gray-700">
                <button (click)="openCreate(col.id)"
                  class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left px-2">
                  + Adicionar card
                </button>
              </div>
            </div>
          }

          @if (sortedColumns().length === 0) {
            <div class="flex-1 flex items-center justify-center">
              <p class="text-gray-400 dark:text-gray-500 text-sm">
                Nenhuma coluna encontrada.
                <a href="/columns" class="text-blue-500 hover:underline">Criar colunas</a>
              </p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal CardForm -->
    @if (showForm()) {
      <app-card-form
        [card]="editingCard()"
        [columns]="columns()"
        [labels]="labels()"
        [defaultColumnId]="formColumnId()"
        (saved)="onSaved($event)"
        (cancelled)="closeForm()"
      />
    }

    <!-- Modal CardDetail -->
    @if (selectedCard()) {
      <app-card-detail
        [card]="selectedCard()!"
        [columns]="sortedColumns()"
        (closed)="closeDetail()"
        (edited)="onEditFromDetail($event)"
        (deleted)="closeDetail(); onDelete(selectedCard()!)"
        (moved)="onMoveFromDetail($event)"
        (cardUpdated)="onCardUpdated($event)"
      />
    }

    <!-- Modal de confirmação -->
    @if (confirmModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeConfirm()">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          <p class="text-gray-800 dark:text-gray-100 text-sm font-medium mb-6">{{ confirmModal()!.message }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="closeConfirm()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
            <button (click)="executeConfirm()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BoardComponent implements OnInit {
  private cardService = inject(CardService);
  private columnService = inject(ColumnService);
  private labelService = inject(LabelService);
  private route = inject(ActivatedRoute);
  protected themeService = inject(ThemeService);
  protected auth = inject(AuthService);

  boardId = 0;

  columns = signal<Column[]>([]);
  cards = signal<Card[]>([]);
  labels = signal<Label[]>([]);
  loading = signal(true);

  sortedColumns = computed(() => [...this.columns()].sort((a, b) => a.order - b.order));

  filterLabelId = signal<number | null>(null);
  filterPriority = signal<Priority | null>(null);
  searchQuery = signal('');

  filteredCards = computed(() => {
    let result = this.cards();
    const labelId = this.filterLabelId();
    const priority = this.filterPriority();
    const query = this.searchQuery().trim().toLowerCase();
    if (labelId !== null) {
      result = result.filter((c) => c.labels.some((l) => l.id === labelId));
    }
    if (priority !== null) {
      result = result.filter((c) => c.priority === priority);
    }
    if (query) {
      result = result.filter((c) => c.title.toLowerCase().includes(query));
    }
    return result;
  });

  showForm = signal(false);
  editingCard = signal<Card | undefined>(undefined);
  formColumnId = signal<number | undefined>(undefined);

  draggingCardId = signal<number | null>(null);
  dragOverColumnId = signal<number | null>(null);
  dragOverCardId = signal<number | null>(null);
  toastMessage = signal('');
  confirmModal = signal<{ message: string; onConfirm: () => void } | null>(null);

  selectedCard = signal<Card | null>(null);
  private editingFromDetail = false;

  ngOnInit(): void {
    this.boardId = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.labelService.getAll().subscribe((labels) => this.labels.set(labels));
    forkJoin({
      cols: this.columnService.getAll(this.boardId),
      cards: this.cardService.getAll(),
    }).subscribe(({ cols, cards }) => {
      this.columns.set(cols);
      this.cards.set(cards.map(c => ({ ...c, comments: c.comments ?? [] })));
      this.loading.set(false);
    });
  }

  cardsForColumn(columnId: number): Card[] {
    return this.filteredCards()
      .filter(c => c.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  priorityDot(priority: Priority): string {
    return {
      Low: 'bg-green-400',
      Medium: 'bg-yellow-400',
      High: 'bg-red-500',
    }[priority];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  dueDateClass(date: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
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

  openEdit(card: Card): void {
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

    // Preserva comments e subtasks que já estavam em memória (a API de update não retorna comments)
    const existing = this.cards().find(c => c.id === savedCard.id);
    const merged: Card = {
      ...savedCard,
      comments: savedCard.comments?.length ? savedCard.comments : (existing?.comments ?? []),
      subtasks: savedCard.subtasks?.length !== undefined ? savedCard.subtasks : (existing?.subtasks ?? []),
    };

    this.cards.update((list) => {
      const idx = list.findIndex((c) => c.id === merged.id);
      return idx >= 0 ? list.map((c) => (c.id === merged.id ? merged : c)) : [...list, merged];
    });

    this.closeForm();

    if (reopenDetail) {
      this.selectedCard.set(merged);
    }
  }

  onMove(card: Card, event: Event): void {
    const columnId = Number((event.target as HTMLSelectElement).value);
    if (!columnId) return;
    (event.target as HTMLSelectElement).value = '';
    this.cardService.move(card.id, columnId).subscribe({
      next: () => this.cardService.getAll().subscribe(cards => this.cards.set(cards)),
      error: () => this.showToast('Erro ao mover card. Tente novamente.'),
    });
  }

  onDelete(card: Card): void {
    this.openConfirm(
      `Excluir o card "${card.title}"? Esta ação não pode ser desfeita.`,
      () => {
        this.cardService.delete(card.id).subscribe({
          next: () => {
            this.cards.update((list) => list.filter((c) => c.id !== card.id));
            if (this.selectedCard()?.id === card.id) this.closeDetail();
          },
          error: () => this.showToast('Erro ao excluir card. Tente novamente.')
        });
      }
    );
  }

  onEditFromDetail(card: Card): void {
    this.editingFromDetail = true;
    this.closeDetail();
    this.openEdit(card);
  }

  private openConfirm(message: string, onConfirm: () => void): void {
    this.confirmModal.set({ message, onConfirm });
  }

  closeConfirm(): void {
    this.confirmModal.set(null);
  }

  executeConfirm(): void {
    this.confirmModal()?.onConfirm();
    this.confirmModal.set(null);
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

  onDragStart(cardId: number): void {
    this.draggingCardId.set(cardId);
  }

  onDragOver(event: DragEvent, columnId: number): void {
    event.preventDefault();
    this.dragOverColumnId.set(columnId);
  }

  onDragOverCard(event: DragEvent, cardId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverCardId.set(cardId);
  }

  onDragLeaveCard(): void {
    this.dragOverCardId.set(null);
  }

  onDrop(event: DragEvent, targetColumnId: number): void {
    event.preventDefault();
    const cardId = this.draggingCardId();
    if (cardId === null) return;

    const card = this.cards().find(c => c.id === cardId);
    if (!card) {
      this.draggingCardId.set(null);
      this.dragOverColumnId.set(null);
      this.dragOverCardId.set(null);
      return;
    }

    const targetCardId = this.dragOverCardId();

    // Reordenação dentro da mesma coluna
    if (card.columnId === targetColumnId) {
      if (targetCardId === null || targetCardId === cardId) {
        this.draggingCardId.set(null);
        this.dragOverColumnId.set(null);
        this.dragOverCardId.set(null);
        return;
      }

      const colCards = this.cardsForColumn(targetColumnId);
      const targetIndex = colCards.findIndex(c => c.id === targetCardId);
      if (targetIndex === -1) {
        this.draggingCardId.set(null);
        this.dragOverColumnId.set(null);
        this.dragOverCardId.set(null);
        return;
      }

      const snapshot = this.cards();
      const withoutDragging = colCards.filter(c => c.id !== cardId);
      withoutDragging.splice(targetIndex, 0, card);
      this.cards.update(list => {
        const others = list.filter(c => c.columnId !== targetColumnId);
        const reordered = withoutDragging.map((c, i) => ({ ...c, order: i }));
        return [...others, ...reordered];
      });

      this.draggingCardId.set(null);
      this.dragOverColumnId.set(null);
      this.dragOverCardId.set(null);

      this.cardService.reorder(cardId, targetIndex).subscribe({
        next: () => {},
        error: () => { this.cards.set(snapshot); this.showToast('Erro ao reordenar card. Alteração revertida.'); }
      });
      return;
    }

    // Mudança de coluna
    const snapshot = this.cards();
    this.cards.update(list => list.map(c => c.id === cardId ? { ...c, columnId: targetColumnId, order: 99999 } : c));
    this.draggingCardId.set(null);
    this.dragOverColumnId.set(null);
    this.dragOverCardId.set(null);

    this.cardService.move(cardId, targetColumnId).subscribe({
      next: () => {
        this.cardService.getAll().subscribe(freshCards => {
          this.cards.set(freshCards.map(fc => {
            const existing = this.cards().find(c => c.id === fc.id);
            return existing ? { ...fc, comments: existing.comments } : fc;
          }));
        });
      },
      error: () => { this.cards.set(snapshot); this.showToast('Erro ao mover card. Alteração revertida.'); }
    });
  }

  onDragLeave(): void {
    this.dragOverColumnId.set(null);
  }

  onDragEnd(): void {
    this.draggingCardId.set(null);
    this.dragOverColumnId.set(null);
    this.dragOverCardId.set(null);
  }

  openDetail(card: Card): void {
    this.selectedCard.set(card);
  }

  closeDetail(): void {
    this.selectedCard.set(null);
  }

  onCardUpdated(card: Card): void {
    this.cards.update(list => list.map(c => c.id === card.id ? card : c));
    this.selectedCard.set(card);
  }

  onMoveFromDetail(event: { card: Card; columnId: number }): void {
    this.cardService.move(event.card.id, event.columnId).subscribe({
      next: () => {
        this.cardService.getAll().subscribe(freshCards => {
          const merged = freshCards.map(fc => {
            const existing = this.cards().find(c => c.id === fc.id);
            return existing ? { ...fc, comments: existing.comments } : fc;
          });
          this.cards.set(merged);
          const updatedCard = merged.find(c => c.id === event.card.id);
          if (updatedCard) this.selectedCard.set(updatedCard);
        });
      },
      error: () => this.showToast('Erro ao mover card. Tente novamente.')
    });
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
