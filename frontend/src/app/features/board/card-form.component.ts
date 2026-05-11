import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardService, Card, CardRequest, Priority } from '../../core/services/card.service';
import { Column } from '../../core/services/column.service';
import { Label } from '../../core/services/label.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="onCancel()">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-5">
          {{ card ? 'Editar card' : 'Novo card' }}
        </h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
            <input formControlName="title" type="text" placeholder="Título da tarefa"
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="text-red-500 text-xs mt-1">Título é obrigatório</p>
            }
          </div>

          <!-- Descrição -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea formControlName="description" rows="3" placeholder="Descrição opcional..."
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Prazo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo</label>
              <input formControlName="dueDate" type="date"
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
            </div>

            <!-- Prioridade -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
              <select formControlName="priority"
                style="width:100%;min-width:0;box-sizing:border-box"
                class="block rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm px-3 py-2">
                <option value="Low">Baixa</option>
                <option value="Medium">Média</option>
                <option value="High">Alta</option>
              </select>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select formControlName="columnId"
              style="width:100%;min-width:0;box-sizing:border-box"
              class="block rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm px-3 py-2">
              @for (col of columns; track col.id) {
                <option [value]="col.id">{{ col.name }}</option>
              }
            </select>
          </div>

          <!-- Etiquetas -->
          @if (labels.length > 0) {
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas</label>
              <div class="flex flex-wrap gap-2">
                @for (label of labels; track label.id) {
                  <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" [value]="label.id" (change)="toggleLabel(label.id, $event)"
                      [checked]="selectedLabelIds.has(label.id)"
                      class="rounded border-gray-300" />
                    <span class="w-3 h-3 rounded-full" [style.background-color]="label.color"></span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ label.name }}</span>
                  </label>
                }
              </div>
            </div>
          }

          @if (errorMessage) {
            <p class="text-red-500 text-sm">{{ errorMessage }}</p>
          }

          <!-- Botões -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="form.invalid || saving"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
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

  onCancel(): void {
    this.cancelled.emit();
  }
}
