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
  templateUrl: './card-detail.component.html',
})
export class CardDetailComponent implements OnInit, OnChanges {
  @Input() card!: Card;
  @Input() columns: Column[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() edited = new EventEmitter<Card>();
  @Output() deleted = new EventEmitter<Card>();
  @Output() duplicated = new EventEmitter<Card>();
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
    return {
      Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }[priority];
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

  formatDate(date: string): string { return new Date(date).toLocaleDateString('pt-BR'); }

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

  startEditSubtask(subtask: Subtask): void { this.editingSubtaskId.set(subtask.id); this.editingSubtaskTitle.set(subtask.title); }
  cancelEditSubtask(): void { this.editingSubtaskId.set(null); this.editingSubtaskTitle.set(''); }

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

  startEditComment(comment: Comment): void { this.editingCommentId.set(comment.id); this.editingCommentText.set(comment.text); }
  cancelEditComment(): void { this.editingCommentId.set(null); this.editingCommentText.set(''); }

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

  onEdit(): void { this.edited.emit(this.card); }
  onDelete(): void { this.deleted.emit(this.card); }
  onDuplicate(): void { this.duplicated.emit(this.card); }
  onClose(): void { this.closed.emit(); }
  onMove(event: Event): void {
    const columnId = Number((event.target as HTMLSelectElement).value);
    if (!columnId) return;
    (event.target as HTMLSelectElement).value = '';
    this.moved.emit({ card: this.card, columnId });
  }
}
