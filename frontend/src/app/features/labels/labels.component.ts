import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LabelService, Label } from '../../core/services/label.service';

@Component({
  selector: 'app-labels',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div class="max-w-2xl mx-auto">
        <a href="/board" class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6">
          ← Voltar ao board
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Etiquetas</h1>

        <!-- Formulário de criação -->
        <form [formGroup]="createForm" (ngSubmit)="onCreate()" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow mb-6 flex gap-3 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <input formControlName="name" type="text" placeholder="Ex: Urgente"
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
            <input formControlName="color" type="color"
              class="h-10 w-14 rounded-lg border-gray-300 cursor-pointer" />
          </div>
          <button type="submit" [disabled]="createForm.invalid || creating()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {{ creating() ? 'Criando...' : 'Criar' }}
          </button>
        </form>

        @if (createError()) {
          <p class="text-red-500 text-sm mb-4">{{ createError() }}</p>
        }

        <!-- Lista -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow divide-y divide-gray-100 dark:divide-gray-700">
          @if (labels().length === 0) {
            <p class="text-gray-500 dark:text-gray-400 text-sm p-6 text-center">Nenhuma etiqueta cadastrada</p>
          }
          @for (label of labels(); track label.id) {
            <div class="p-4 flex items-center gap-3">
              @if (editingId() === label.id) {
                <!-- Modo edição inline -->
                <form [formGroup]="editForm" (ngSubmit)="onUpdate(label.id)" class="flex gap-2 items-center flex-1">
                  <input formControlName="name" type="text"
                    class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
                  <input formControlName="color" type="color"
                    class="h-9 w-12 rounded border-gray-300 cursor-pointer" />
                  <button type="submit" [disabled]="editForm.invalid"
                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                    Salvar
                  </button>
                  <button type="button" (click)="cancelEdit()"
                    class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg">
                    Cancelar
                  </button>
                </form>
              } @else {
                <!-- Modo visualização -->
                <span class="w-4 h-4 rounded-full flex-shrink-0" [style.background-color]="label.color"></span>
                <span class="flex-1 text-gray-900 dark:text-white text-sm font-medium">{{ label.name }}</span>
                <button (click)="startEdit(label)"
                  class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-2 py-1">
                  Editar
                </button>
                <button (click)="onDelete(label.id)"
                  class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium px-2 py-1">
                  Excluir
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LabelsComponent implements OnInit {
  private labelService = inject(LabelService);
  private fb = inject(FormBuilder);

  labels = signal<Label[]>([]);
  editingId = signal<number | null>(null);
  creating = signal(false);
  createError = signal('');

  createForm = this.fb.group({
    name: ['', Validators.required],
    color: ['#3B82F6']
  });

  editForm = this.fb.group({
    name: ['', Validators.required],
    color: ['#3B82F6']
  });

  ngOnInit(): void {
    this.loadLabels();
  }

  private loadLabels(): void {
    this.labelService.getAll().subscribe(data => this.labels.set(data));
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set('');
    const { name, color } = this.createForm.value;
    this.labelService.create(name!, color!).subscribe({
      next: label => {
        this.labels.update(list => [...list, label]);
        this.createForm.reset({ name: '', color: '#3B82F6' });
        this.creating.set(false);
      },
      error: err => {
        this.createError.set(err.status === 409 ? 'Etiqueta já existe' : 'Erro ao criar etiqueta');
        this.creating.set(false);
      }
    });
  }

  startEdit(label: Label): void {
    this.editingId.set(label.id);
    this.editForm.setValue({ name: label.name, color: label.color });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;
    const { name, color } = this.editForm.value;
    this.labelService.update(id, name!, color!).subscribe({
      next: updated => {
        this.labels.update(list => list.map(l => l.id === id ? updated : l));
        this.editingId.set(null);
      },
      error: () => this.cancelEdit()
    });
  }

  onDelete(id: number): void {
    this.labelService.delete(id).subscribe({
      next: () => this.labels.update(list => list.filter(l => l.id !== id))
    });
  }
}
