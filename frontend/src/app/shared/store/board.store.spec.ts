import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BoardStore } from './board.store';
import { CardService, Card, Priority } from '../../core/services/card.service';
import { ColumnService, Column } from '../../core/services/column.service';
import { LabelService } from '../../core/services/label.service';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    title: 'Card',
    priority: 'Medium' as Priority,
    columnId: 1,
    createdAt: '2026-08-12T00:00:00Z',
    labels: [],
    order: 0,
    subtasks: [],
    comments: [],
    ...overrides,
  };
}

describe('BoardStore', () => {
  let store: BoardStore;
  let columnService: ColumnService;

  beforeEach(() => {
    const cardService = { getAll: vi.fn(() => of([])) };
    columnService = { getAll: vi.fn(() => of([])) } as unknown as ColumnService;
    const labelService = { getAll: vi.fn(() => of([])) };

    TestBed.configureTestingModule({
      providers: [
        BoardStore,
        { provide: CardService, useValue: cardService },
        { provide: ColumnService, useValue: columnService },
        { provide: LabelService, useValue: labelService },
      ],
    });
    store = TestBed.inject(BoardStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('addCard adds card with default empty arrays', () => {
    store.addCard(makeCard({ id: 1 }));

    expect(store.cards().length).toBe(1);
    expect(store.cards()[0].comments).toEqual([]);
    expect(store.cards()[0].subtasks).toEqual([]);
  });

  it('updateCard preserves existing comments when response has none', () => {
    store.addCard(makeCard({ id: 1, comments: [{ id: 1, text: 'oi', createdAt: 'x', cardId: 1 }] }));

    store.updateCard(makeCard({ id: 1, title: 'Atualizado', comments: undefined as never }));

    expect(store.cards()[0].title).toBe('Atualizado');
    expect(store.cards()[0].comments.length).toBe(1);
  });

  it('removeCard removes by id', () => {
    store.addCard(makeCard({ id: 1 }));
    store.addCard(makeCard({ id: 2 }));

    store.removeCard(1);

    expect(store.cards().length).toBe(1);
    expect(store.cards()[0].id).toBe(2);
  });

  it('moveCard changes columnId and order', () => {
    store.addCard(makeCard({ id: 1, columnId: 1, order: 0 }));

    store.moveCard(1, 2, 5);

    expect(store.cards()[0].columnId).toBe(2);
    expect(store.cards()[0].order).toBe(5);
  });

  it('moveCard changes only columnId when order not provided', () => {
    store.addCard(makeCard({ id: 1, columnId: 1, order: 3 }));

    store.moveCard(1, 2);

    expect(store.cards()[0].columnId).toBe(2);
    expect(store.cards()[0].order).toBe(3);
  });

  it('reorderCards reorders and renumbers within the same column', () => {
    store.addCard(makeCard({ id: 1, columnId: 1, order: 0 }));
    store.addCard(makeCard({ id: 2, columnId: 1, order: 1 }));
    store.addCard(makeCard({ id: 3, columnId: 1, order: 2 }));
    store.addCard(makeCard({ id: 9, columnId: 2, order: 0 }));

    store.reorderCards(3, 0);

    const col1 = store.cards().filter(c => c.columnId === 1).sort((a, b) => a.order - b.order);
    expect(col1.map(c => c.id)).toEqual([3, 1, 2]);
    expect(col1.map(c => c.order)).toEqual([0, 1, 2]);

    expect(store.cards().find(c => c.id === 9)?.order).toBe(0);
  });

  it('sortedColumns returns columns ordered by order', () => {
    (columnService.getAll as ReturnType<typeof vi.fn>).mockReturnValue(of([
      { id: 1, name: 'B', order: 2 },
      { id: 2, name: 'A', order: 1 },
      { id: 3, name: 'C', order: 3 },
    ] as Column[]));

    store.load(1).subscribe();

    expect(store.sortedColumns().map(c => c.name)).toEqual(['A', 'B', 'C']);
  });
});
