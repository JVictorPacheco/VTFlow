import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ColumnService, Column } from '../../core/services/column.service';

@Component({
  selector: 'app-columns-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div class="max-w-2xl mx-auto">
        <a [href]="'/boards/' + boardId" class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6">
          ← Voltar ao board
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Colunas do Board</h1>

        <!-- Formulário de criação -->
        <form [formGroup]="createForm" (ngSubmit)="onCreate()"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow mb-6 flex gap-3 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da coluna</label>
            <input formControlName="name" type="text" placeholder="Ex: Revisão"
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
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
          @if (columns().length === 0) {
            <p class="text-gray-500 dark:text-gray-400 text-sm p-6 text-center">Nenhuma coluna cadastrada</p>
          }
          @for (col of sortedColumns(); track col.id; let i = $index) {
            <div class="p-4 flex items-center gap-3">
              <span class="text-xs text-gray-400 dark:text-gray-500 w-5 text-center font-mono">{{ i + 1 }}</span>

              @if (renamingId() === col.id) {
                <!-- Modo renomeação inline -->
                <form [formGroup]="renameForm" (ngSubmit)="onRename(col.id)" class="flex gap-2 items-center flex-1">
                  <input formControlName="name" type="text"
                    class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
                  <button type="submit" [disabled]="renameForm.invalid"
                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                    Salvar
                  </button>
                  <button type="button" (click)="cancelRename()"
                    class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg">
                    Cancelar
                  </button>
                </form>
              } @else {
                <!-- Modo visualização -->
                <span class="flex-1 text-gray-900 dark:text-white text-sm font-medium">{{ col.name }}</span>

                <!-- Botões reordenar -->
                <button (click)="onMoveLeft(col)" [disabled]="i === 0"
                  class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 disabled:opacity-30 text-sm rounded">
                  ←
                </button>
                <button (click)="onMoveRight(col)" [disabled]="i === sortedColumns().length - 1"
                  class="px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 disabled:opacity-30 text-sm rounded">
                  →
                </button>

                <button (click)="startRename(col)"
                  class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-2 py-1">
                  Renomear
                </button>
                <button (click)="onDelete(col.id)"
                  class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium px-2 py-1">
                  Excluir
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    @if (confirmModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeConfirm()">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          @if (deleteError()) {
            <p class="text-red-500 text-sm font-medium mb-4">{{ deleteError() }}</p>
          } @else {
            <p class="text-gray-800 dark:text-gray-100 text-sm font-medium mb-4">{{ confirmModal()!.message }}</p>
          }

          <div class="flex justify-end gap-3">
            <button (click)="closeConfirm()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
            @if (!deleteError()) {
              <button (click)="executeConfirm()"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                Excluir
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ColumnsManagerComponent implements OnInit {
  private columnService = inject(ColumnService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  boardId = 0;
  columns = signal<Column[]>([]);
  sortedColumns = computed(() => [...this.columns()].sort((a, b) => a.order - b.order));
  renamingId = signal<number | null>(null);
  creating = signal(false);
  createError = signal('');
  confirmModal = signal<{ message: string; onConfirm: () => void } | null>(null);
  deleteError = signal('');

  createForm = this.fb.group({ name: ['', Validators.required] });
  renameForm = this.fb.group({ name: ['', Validators.required] });

  ngOnInit(): void {
    this.boardId = +(this.route.snapshot.queryParamMap.get('boardId') ?? 0);
    this.columnService.getAll(this.boardId).subscribe(data => this.columns.set(data));
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set('');
    const { name } = this.createForm.value;
    this.columnService.create(name!, this.boardId).subscribe({
      next: col => {
        this.columns.update(list => [...list, col]);
        this.createForm.reset();
        this.creating.set(false);
      },
      error: err => {
        this.createError.set(err.status === 409 ? 'Coluna já existe' : 'Erro ao criar coluna');
        this.creating.set(false);
      }
    });
  }

  startRename(col: Column): void {
    this.renamingId.set(col.id);
    this.renameForm.setValue({ name: col.name });
  }

  cancelRename(): void { this.renamingId.set(null); }

  onRename(id: number): void {
    if (this.renameForm.invalid) return;
    const { name } = this.renameForm.value;
    this.columnService.rename(id, name!).subscribe({
      next: updated => {
        this.columns.update(list => list.map(c => c.id === id ? updated : c));
        this.renamingId.set(null);
      },
      error: () => this.cancelRename()
    });
  }

  onMoveLeft(col: Column): void {
    const sorted = this.sortedColumns();
    const idx = sorted.findIndex(c => c.id === col.id);
    if (idx === 0) return;
    const target = sorted[idx - 1];
    this.columnService.reorder(col.id, target.order).subscribe(() => {
      this.columns.update(list => list.map(c => {
        if (c.id === col.id) return { ...c, order: target.order };
        if (c.id === target.id) return { ...c, order: col.order };
        return c;
      }));
    });
  }

  onMoveRight(col: Column): void {
    const sorted = this.sortedColumns();
    const idx = sorted.findIndex(c => c.id === col.id);
    if (idx === sorted.length - 1) return;
    const target = sorted[idx + 1];
    this.columnService.reorder(col.id, target.order).subscribe(() => {
      this.columns.update(list => list.map(c => {
        if (c.id === col.id) return { ...c, order: target.order };
        if (c.id === target.id) return { ...c, order: col.order };
        return c;
      }));
    });
  }

  openConfirm(message: string, onConfirm: () => void): void {
    this.deleteError.set('');
    this.confirmModal.set({ message, onConfirm });
  }

  closeConfirm(): void {
    this.confirmModal.set(null);
    this.deleteError.set('');
  }

  executeConfirm(): void {
    this.confirmModal()?.onConfirm();
  }

  onDelete(id: number): void {
    const col = this.columns().find(c => c.id === id);
    this.openConfirm(
      `Excluir a coluna "${col?.name}"? Esta ação não pode ser desfeita.`,
      () => {
        this.columnService.delete(id).subscribe({
          next: () => {
            this.columns.update(list => list.filter(c => c.id !== id));
            this.confirmModal.set(null);
          },
          error: (err) => {
            if (err.status === 409) {
              this.deleteError.set('Esta coluna possui cards e não pode ser excluída. Mova ou exclua os cards primeiro.');
            } else {
              this.deleteError.set('Erro ao excluir coluna. Tente novamente.');
            }
          }
        });
      }
    );
  }
}
