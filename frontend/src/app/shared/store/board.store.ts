import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, forkJoin, tap } from 'rxjs';
import { CardService, Card } from '../../core/services/card.service';
import { ColumnService, Column } from '../../core/services/column.service';
import { LabelService, Label } from '../../core/services/label.service';

@Injectable({ providedIn: 'root' })
export class BoardStore {
  private cardService = inject(CardService);
  private columnService = inject(ColumnService);
  private labelService = inject(LabelService);

  private readonly _boardId = signal<number>(0);
  private readonly _columns = signal<Column[]>([]);
  private readonly _cards = signal<Card[]>([]);
  private readonly _labels = signal<Label[]>([]);
  private readonly _loading = signal(true);
  private readonly _loaded = signal(false);

  readonly boardId = this._boardId.asReadonly();
  readonly columns = this._columns.asReadonly();
  readonly cards = this._cards.asReadonly();
  readonly labels = this._labels.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly sortedColumns = computed(() =>
    [...this._columns()].sort((a, b) => a.order - b.order)
  );

  readonly cardsByColumn = computed(() => {
    const map = new Map<number, Card[]>();
    for (const card of this._cards()) {
      const list = map.get(card.columnId) ?? [];
      list.push(card);
      map.set(card.columnId, list);
    }
    return map;
  });

  load(boardId: number): Observable<{ columns: Column[]; cards: Card[]; labels: Label[] }> {
    if (this._loaded() && this._boardId() === boardId) {
      return of({ columns: this._columns(), cards: this._cards(), labels: this._labels() });
    }

    this._boardId.set(boardId);
    this._loading.set(true);

    return forkJoin({
      labels: this.labelService.getAll(),
      columns: this.columnService.getAll(boardId),
      cards: this.cardService.getAll(),
    }).pipe(
      tap(({ labels, columns, cards }) => {
        this._labels.set(labels);
        this._columns.set(columns);
        this._cards.set(cards.map(c => ({ ...c, comments: c.comments ?? [] })));
        this._loading.set(false);
        this._loaded.set(true);
      })
    );
  }

  addCard(card: Card): void {
    this._cards.update(list => [...list, { ...card, comments: card.comments ?? [], subtasks: card.subtasks ?? [] }]);
  }

  updateCard(updated: Card): void {
    this._cards.update(list => list.map(c => c.id === updated.id
      ? { ...updated, comments: updated.comments?.length ? updated.comments : c.comments, subtasks: updated.subtasks?.length !== undefined ? updated.subtasks : c.subtasks }
      : c
    ));
  }

  removeCard(id: number): void {
    this._cards.update(list => list.filter(c => c.id !== id));
  }

  moveCard(cardId: number, targetColumnId: number): void {
    this._cards.update(list => list.map(c => c.id === cardId ? { ...c, columnId: targetColumnId } : c));
  }

  reorderCards(cardId: number, newOrder: number): void {
    this._cards.update(list => {
      const card = list.find(c => c.id === cardId);
      if (!card) return list;
      const siblings = list.filter(c => c.columnId === card.columnId && c.id !== cardId).sort((a, b) => a.order - b.order);
      siblings.splice(Math.min(newOrder, siblings.length), 0, card);
      const reordered = siblings.map((c, i) => ({ ...c, order: i }));
      const others = list.filter(c => c.columnId !== card.columnId);
      return [...others, ...reordered];
    });
  }

  refreshCards(cards: Card[]): void {
    this._cards.update(current =>
      cards.map(fc => {
        const existing = current.find(c => c.id === fc.id);
        return existing ? { ...fc, comments: existing.comments } : fc;
      })
    );
  }

  invalidate(): void {
    this._loaded.set(false);
  }
}
