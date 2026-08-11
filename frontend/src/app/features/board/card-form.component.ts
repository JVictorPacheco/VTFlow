import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardService, Card, CardRequest, Priority } from '../../core/services/card.service';
import { Column } from '../../core/services/column.service';
import { Label } from '../../core/services/label.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './card-form.component.html',
})
export class CardFormComponent implements OnInit {
  @Input() card?: Card;
  @Input() columns: Column[] = [];
  @Input() labels: Label[] = [];
  @Input() defaultColumnId?: number;
  @Output() saved = new EventEmitter<Card>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private cardService = inject(CardService);

  selectedLabelIds = new Set<number>();
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: [''],
    priority: ['Medium' as Priority],
    columnId: [0, Validators.required]
  });

  ngOnInit(): void {
    const columnId = this.card?.columnId ?? this.defaultColumnId ?? this.columns[0]?.id ?? 0;
    this.form.patchValue({
      title: this.card?.title ?? '',
      description: this.card?.description ?? '',
      dueDate: this.card?.dueDate ? this.card.dueDate.substring(0, 10) : '',
      priority: this.card?.priority ?? 'Medium',
      columnId
    });
    if (this.card?.labels) {
      this.card.labels.forEach(l => this.selectedLabelIds.add(l.id));
    }
  }

  toggleLabel(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    checked ? this.selectedLabelIds.add(id) : this.selectedLabelIds.delete(id);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const { title, description, dueDate, priority, columnId } = this.form.value;
    const data: CardRequest = {
      title: title!,
      description: description || undefined,
      dueDate: dueDate || undefined,
      priority: priority as Priority,
      columnId: Number(columnId),
      labelIds: Array.from(this.selectedLabelIds)
    };

    const request$ = this.card
      ? this.cardService.update(this.card.id, data)
      : this.cardService.create(data);

    request$.subscribe({
      next: card => { this.saving = false; this.saved.emit(card); },
      error: () => { this.errorMessage = 'Erro ao salvar card'; this.saving = false; }
    });
  }

  onCancel(): void { this.cancelled.emit(); }
}
