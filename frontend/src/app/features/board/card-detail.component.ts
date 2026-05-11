import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardService, Card, Priority } from '../../core/services/card.service';
import { SubtaskService, Subtask } from '../../core/services/subtask.service';
import { CommentService, Comment } from '../../core/services/comment.service';
import { ActivityService, CardActivity } from '../../core/services/activity.service';
import { Column } from '../../core/services/column.service';

type TimelineItem =
  | { kind: 'comment'; data: Comment }
  | { kind: 'activity'; data: CardActivity };

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto" (click)="onClose()">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8" (click)="$event.stopPropagation()">

        <!-- Header do modal -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-start gap-3">
            <span class="mt-1.5 flex-shrink-0 w-3 h-3 rounded-full" [class]="priorityDot(card.priority)"></span>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">{{ card.title }}</h2>
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="priorityBadge(card.priority)">
                  {{ priorityLabel(card.priority) }}
                </span>
                @if (card.dueDate) {
                  <span class="text-xs font-medium" [class]="dueDateClass(card.dueDate)">
                    📅 {{ formatDate(card.dueDate) }}
                  </span>
                }
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ columnName() }}
                </span>
              </div>
            </div>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-light ml-2">✕</button>
          </div>

          @if (card.labels.length > 0) {
            <div class="flex flex-wrap gap-1.5 mt-3">
              @for (label of card.labels; track label.id) {
                <span class="text-xs px-2.5 py-0.5 rounded-full text-white font-medium" [style.background-color]="label.color">
                  {{ label.name }}
                </span>
              }
            </div>
          }
        </div>

        <!-- Corpo do modal — duas colunas -->
        <div class="flex gap-0 divide-x divide-gray-100 dark:divide-gray-700 min-h-0">

          <!-- Coluna esquerda: descrição + subtarefas + ações -->
          <div class="flex-1 px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

            @if (card.description) {
              <div>
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Descrição</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ card.description }}</p>
              </div>
            }

            <!-- Subtarefas -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subtarefas</h3>
                @if (card.subtasks.length > 0) {
                  <span class="text-xs text-gray-400">{{ subtaskProgress() }}</span>
                }
              </div>

              @if (card.subtasks.length > 0) {
                <div class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
                  <div class="h-1 bg-blue-500 rounded-full transition-all" [style.width.%]="subtaskProgressPercent()"></div>
                </div>
              }

              <div class="space-y-1.5">
                @for (subtask of card.subtasks; track subtask.id) {
                  <div class="flex items-center gap-2 group py-0.5">
                    <input type="checkbox" [checked]="subtask.isCompleted"
                      (change)="onToggleSubtask(subtask)"
                      class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0" />
                    @if (editingSubtaskId() === subtask.id) {
                      <input type="text" class="flex-1 text-sm rounded border border-blue-400 dark:border-blue-500 dark:bg-gray-700 dark:text-white px-2 py-0.5"
                        [value]="editingSubtaskTitle()"
                        (input)="editingSubtaskTitle.set($any($event.target).value)"
                        (keydown.enter)="onRenameSubtask(subtask)"
                        (keydown.escape)="cancelEditSubtask()"
                        (blur)="onRenameSubtask(subtask)" />
                    } @else {
                      <span class="text-sm flex-1 cursor-pointer select-none"
                        [class.line-through]="subtask.isCompleted"
                        [class.text-gray-400]="subtask.isCompleted"
                        [class.text-gray-700]="!subtask.isCompleted"
                        [class.dark:text-gray-200]="!subtask.isCompleted"
                        (click)="onToggleSubtask(subtask)"
                        (dblclick)="startEditSubtask(subtask)">
                        {{ subtask.title }}
                      </span>
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="startEditSubtask(subtask)" class="text-xs text-gray-400 hover:text-blue-500 px-1">✎</button>
                        <button (click)="onDeleteSubtask(subtask)" class="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="flex items-center gap-2 mt-3">
                <input type="text" placeholder="Nova subtarefa..."
                  [value]="newSubtaskTitle()"
                  (input)="newSubtaskTitle.set($any($event.target).value)"
                  (keydown.enter)="onAddSubtask()"
                  class="flex-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-1.5" />
                <button (click)="onAddSubtask()"
                  [disabled]="!newSubtaskTitle().trim()"
                  class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  +
                </button>
              </div>
            </div>

            <!-- Ações -->
            <div class="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button (click)="onEdit()"
                  class="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  ✎ Editar
                </button>
                <select (change)="onMove($event)"
                  class="text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-1.5">
                  <option value="">Mover para...</option>
                  @for (col of columns; track col.id) {
                    @if (col.id !== card.columnId) {
                      <option [value]="col.id">{{ col.name }}</option>
                    }
                  }
                </select>
              </div>
              <button (click)="onDelete()"
                class="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                Excluir
              </button>
            </div>
          </div>

          <!-- Coluna direita: comentários + atividades -->
          <div class="w-80 flex-shrink-0 px-5 py-5 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">

            <!-- Novo comentário -->
            <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">
              Comentários
              @if (card.comments.length > 0) {
                <span class="normal-case font-normal ml-1">({{ card.comments.length }})</span>
              }
            </h3>
            <div class="flex-shrink-0">
              <textarea placeholder="Escreva um comentário..."
                rows="3"
                [value]="newCommentText()"
                (input)="newCommentText.set($any($event.target).value)"
                class="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 resize-none focus:border-blue-400 focus:outline-none transition-colors"></textarea>
              <div class="flex justify-end mt-1.5">
                <button (click)="onAddComment()"
                  [disabled]="!newCommentText().trim()"
                  class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">
                  Comentar
                </button>
              </div>
            </div>

            <!-- Timeline unificada: comentários + atividades -->
            <div class="space-y-2 flex-1">
              @for (item of timeline(); track item.kind + '_' + item.data.id) {
                @if (item.kind === 'comment') {
                  <div class="group bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                    @if (editingCommentId() === item.data.id) {
                      <textarea class="w-full text-sm rounded border border-blue-400 dark:border-blue-500 dark:bg-gray-600 dark:text-white px-2 py-1.5 resize-none"
                        rows="3"
                        [value]="editingCommentText()"
                        (input)="editingCommentText.set($any($event.target).value)"
                        (keydown.escape)="cancelEditComment()"></textarea>
                      <div class="flex gap-2 mt-1.5">
                        <button (click)="onUpdateComment(asComment(item.data))"
                          class="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded font-medium transition-colors">
                          Salvar
                        </button>
                        <button (click)="cancelEditComment()"
                          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 px-1 py-1">
                          Cancelar
                        </button>
                      </div>
                    } @else {
                      <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{{ asComment(item.data).text }}</p>
                      <div class="flex items-center justify-between mt-1.5">
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                          💬 {{ formatDate(item.data.createdAt) }}{{ asComment(item.data).updatedAt ? ' · editado' : '' }}
                        </span>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button (click)="startEditComment(asComment(item.data))" class="text-xs text-gray-400 hover:text-blue-500">✎</button>
                          <button (click)="onDeleteComment(asComment(item.data))" class="text-xs text-red-400 hover:text-red-600">✕</button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="flex items-start gap-2 py-1">
                    <span class="text-gray-300 dark:text-gray-600 text-xs mt-0.5 flex-shrink-0">●</span>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-600 dark:text-gray-400 leading-snug">{{ asActivity(item.data).description }}</p>
                      <span class="text-xs text-gray-400 dark:text-gray-600">{{ formatDateTime(item.data.createdAt) }}</span>
                    </div>
                  </div>
                }
              }
              @if (timeline().length === 0) {
                <p class="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhuma atividade ainda.</p>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CardDetailComponent implements OnInit, OnChanges {
  @Input() card!: Card;
  @Input() columns: Column[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() edited = new EventEmitter<Card>();
  @Output() deleted = new EventEmitter<Card>();
  @Output() moved = new EventEmitter<{ card: Card; columnId: number }>();
  @Output() cardUpdated = new EventEmitter<Card>();

  private subtaskService = inject(SubtaskService);
  private commentService = inject(CommentService);
  private activityService = inject(ActivityService);

  newSubtaskTitle = signal('');
  editingSubtaskId = signal<number | null>(null);
  editingSubtaskTitle = signal('');

  newCommentText = signal('');
  editingCommentId = signal<number | null>(null);
  editingCommentText = signal('');

  activities = signal<CardActivity[]>([]);

  ngOnInit(): void {
    if (this.card.comments.length === 0) {
      this.commentService.getAll(this.card.id).subscribe(comments => {
        this.card = { ...this.card, comments };
        this.cardUpdated.emit(this.card);
      });
    }
    this.activityService.getAll(this.card.id).subscribe(acts => this.activities.set(acts));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && !changes['card'].firstChange) {
      this.activityService.getAll(this.card.id).subscribe(acts => this.activities.set(acts));
    }
  }

  timeline(): TimelineItem[] {
    const items: TimelineItem[] = [
      ...this.card.comments.map(c => ({ kind: 'comment' as const, data: c })),
      ...this.activities().map(a => ({ kind: 'activity' as const, data: a }))
    ];
    return items.sort((a, b) => new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime());
  }

  asComment(data: Comment | CardActivity): Comment { return data as Comment; }
  asActivity(data: Comment | CardActivity): CardActivity { return data as CardActivity; }

  columnName(): string {
    return this.columns.find(c => c.id === this.card.columnId)?.name ?? '';
  }

  priorityDot(priority: Priority): string {
    return { Low: 'bg-green-400', Medium: 'bg-yellow-400', High: 'bg-red-500' }[priority];
  }

  priorityBadge(priority: Priority): string {
    return { Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }[priority];
  }

  priorityLabel(priority: Priority): string {
    return { Low: 'Baixa', Medium: 'Média', High: 'Alta' }[priority];
  }

  dueDateClass(date: string): string {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(date); due.setHours(0, 0, 0, 0);
    if (due < today) return 'text-red-500 dark:text-red-400 font-medium';
    if (due.getTime() === today.getTime()) return 'text-yellow-500 dark:text-yellow-400 font-medium';
    return 'text-gray-500 dark:text-gray-400';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  subtaskProgress(): string {
    const done = this.card.subtasks.filter(s => s.isCompleted).length;
    return `${done}/${this.card.subtasks.length}`;
  }

  subtaskProgressPercent(): number {
    const total = this.card.subtasks.length;
    if (total === 0) return 0;
    return Math.round((this.card.subtasks.filter(s => s.isCompleted).length / total) * 100);
  }

  // --- Subtarefas ---
  onAddSubtask(): void {
    const title = this.newSubtaskTitle().trim();
    if (!title) return;
    this.subtaskService.create(this.card.id, title).subscribe(subtask => {
      this.card = { ...this.card, subtasks: [...this.card.subtasks, subtask] };
      this.cardUpdated.emit(this.card);
      this.newSubtaskTitle.set('');
      this.refreshActivities();
    });
  }

  onToggleSubtask(subtask: Subtask): void {
    this.subtaskService.toggle(this.card.id, subtask.id, !subtask.isCompleted).subscribe(updated => {
      this.card = { ...this.card, subtasks: this.card.subtasks.map(s => s.id === subtask.id ? updated : s) };
      this.cardUpdated.emit(this.card);
      this.refreshActivities();
    });
  }

  startEditSubtask(subtask: Subtask): void {
    this.editingSubtaskId.set(subtask.id);
    this.editingSubtaskTitle.set(subtask.title);
  }

  cancelEditSubtask(): void {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  onRenameSubtask(subtask: Subtask): void {
    const title = this.editingSubtaskTitle().trim();
    if (!title || title === subtask.title) { this.cancelEditSubtask(); return; }
    this.subtaskService.rename(this.card.id, subtask.id, title).subscribe(updated => {
      this.card = { ...this.card, subtasks: this.card.subtasks.map(s => s.id === subtask.id ? updated : s) };
      this.cardUpdated.emit(this.card);
      this.cancelEditSubtask();
      this.refreshActivities();
    });
  }

  onDeleteSubtask(subtask: Subtask): void {
    this.subtaskService.delete(this.card.id, subtask.id).subscribe(() => {
      this.card = { ...this.card, subtasks: this.card.subtasks.filter(s => s.id !== subtask.id) };
      this.cardUpdated.emit(this.card);
      this.refreshActivities();
    });
  }

  // --- Comentários ---
  onAddComment(): void {
    const text = this.newCommentText().trim();
    if (!text) return;
    this.commentService.create(this.card.id, text).subscribe(comment => {
      this.card = { ...this.card, comments: [...this.card.comments, comment] };
      this.cardUpdated.emit(this.card);
      this.newCommentText.set('');
      this.refreshActivities();
    });
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId.set(comment.id);
    this.editingCommentText.set(comment.text);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
  }

  onUpdateComment(comment: Comment): void {
    const text = this.editingCommentText().trim();
    if (!text || text === comment.text) { this.cancelEditComment(); return; }
    this.commentService.update(this.card.id, comment.id, text).subscribe(updated => {
      this.card = { ...this.card, comments: this.card.comments.map(c => c.id === comment.id ? updated : c) };
      this.cardUpdated.emit(this.card);
      this.cancelEditComment();
    });
  }

  onDeleteComment(comment: Comment): void {
    this.commentService.delete(this.card.id, comment.id).subscribe(() => {
      this.card = { ...this.card, comments: this.card.comments.filter(c => c.id !== comment.id) };
      this.cardUpdated.emit(this.card);
      this.refreshActivities();
    });
  }

  private refreshActivities(): void {
    this.activityService.getAll(this.card.id).subscribe(acts => this.activities.set(acts));
  }

  // --- Ações do card ---
  onEdit(): void { this.edited.emit(this.card); }
  onDelete(): void { this.deleted.emit(this.card); }
  onClose(): void { this.closed.emit(); }
  onMove(event: Event): void {
    const columnId = Number((event.target as HTMLSelectElement).value);
    if (!columnId) return;
    (event.target as HTMLSelectElement).value = '';
    this.moved.emit({ card: this.card, columnId });
  }
}
