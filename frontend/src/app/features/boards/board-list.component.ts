import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService, Board } from '../../core/services/board.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Meus Boards</h1>
        <div class="flex items-center gap-3">
          <button (click)="themeService.toggleTheme()"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {{ themeService.isDark() ? '☀ Claro' : '☾ Escuro' }}
          </button>
          <a routerLink="/labels"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Etiquetas
          </a>
          <button (click)="onLogout()"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main class="max-w-5xl mx-auto p-8">

        <!-- Formulário de criação -->
        @if (showCreateForm()) {
          <form [formGroup]="createForm" (ngSubmit)="onCreate()"
            class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 border border-blue-200 dark:border-blue-700">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Novo Board</h2>
            <div class="flex flex-col gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input formControlName="name" type="text" placeholder="Ex: Trabalho"
                  class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (opcional)</label>
                <input formControlName="description" type="text" placeholder="Ex: Tarefas do projeto X"
                  class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
              </div>
              @if (createError()) {
                <p class="text-red-500 text-sm">{{ createError() }}</p>
              }
              <div class="flex gap-2 justify-end">
                <button type="button" (click)="cancelCreate()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="createForm.invalid || creating()"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
                  {{ creating() ? 'Criando...' : 'Criar Board' }}
                </button>
              </div>
            </div>
          </form>
        } @else {
          <div class="flex justify-end mb-8">
            <button (click)="showCreateForm.set(true)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow">
              + Novo Board
            </button>
          </div>
        }

        <!-- Estado vazio -->
        @if (boards().length === 0) {
          <div class="text-center py-20">
            <p class="text-gray-400 dark:text-gray-500 text-lg mb-2">Nenhum board criado ainda</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mb-6">Crie seu primeiro board para começar a organizar suas tarefas</p>
            <button (click)="showCreateForm.set(true)"
              class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Criar meu primeiro board
            </button>
          </div>
        }

        <!-- Grid de boards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (board of boards(); track board.id) {
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-4">

              @if (editingId() === board.id) {
                <!-- Modo edição inline -->
                <form [formGroup]="editForm" (ngSubmit)="onUpdate(board.id)" class="flex flex-col gap-2">
                  <input formControlName="name" type="text"
                    class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm font-semibold" />
                  <input formControlName="description" type="text" placeholder="Descrição (opcional)"
                    class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
                  <div class="flex gap-2 justify-end">
                    <button type="button" (click)="cancelEdit()"
                      class="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                      Cancelar
                    </button>
                    <button type="submit" [disabled]="editForm.invalid"
                      class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg">
                      Salvar
                    </button>
                  </div>
                </form>
              } @else {
                <!-- Modo visualização -->
                <div class="flex-1">
                  <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-1">{{ board.name }}</h2>
                  @if (board.description) {
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ board.description }}</p>
                  }
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Criado em {{ board.createdAt | date:'dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/boards', board.id]"
                    class="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Abrir
                  </a>
                  <button (click)="startEdit(board)"
                    class="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    Renomear
                  </button>
                  <button (click)="askDelete(board)"
                    class="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                    Excluir
                  </button>
                </div>
              }

            </div>
          }
        </div>

      </main>

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

    </div>
  `
})
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  protected themeService = inject(ThemeService);

  boards = signal<Board[]>([]);
  showCreateForm = signal(false);
  creating = signal(false);
  createError = signal('');
  editingId = signal<number | null>(null);
  confirmModal = signal<{ message: string; onConfirm: () => void } | null>(null);

  createForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  editForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.boardService.getAll().subscribe(data => this.boards.set(data));
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set('');
    const { name, description } = this.createForm.value;
    this.boardService.create({ name: name!, description: description ?? undefined }).subscribe({
      next: board => {
        this.boards.update(list => [board, ...list]);
        this.createForm.reset();
        this.showCreateForm.set(false);
        this.creating.set(false);
      },
      error: err => {
        this.createError.set(err.status === 409 ? 'Já existe um board com esse nome' : 'Erro ao criar board');
        this.creating.set(false);
      }
    });
  }

  cancelCreate(): void {
    this.createForm.reset();
    this.createError.set('');
    this.showCreateForm.set(false);
  }

  startEdit(board: Board): void {
    this.editingId.set(board.id);
    this.editForm.setValue({ name: board.name, description: board.description ?? '' });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;
    const { name, description } = this.editForm.value;
    this.boardService.update(id, { name: name!, description: description ?? undefined }).subscribe({
      next: updated => {
        this.boards.update(list => list.map(b => b.id === id ? updated : b));
        this.editingId.set(null);
      },
      error: () => this.cancelEdit()
    });
  }

  askDelete(board: Board): void {
    this.confirmModal.set({
      message: `Excluir o board "${board.name}"? Todas as colunas e cards serão removidos permanentemente.`,
      onConfirm: () => this.onDelete(board.id)
    });
  }

  private onDelete(id: number): void {
    this.boardService.delete(id).subscribe({
      next: () => this.boards.update(list => list.filter(b => b.id !== id))
    });
  }

  closeConfirm(): void {
    this.confirmModal.set(null);
  }

  executeConfirm(): void {
    this.confirmModal()?.onConfirm();
    this.confirmModal.set(null);
  }

  onLogout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
