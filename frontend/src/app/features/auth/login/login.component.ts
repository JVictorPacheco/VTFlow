import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Entrar</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
            <input formControlName="username" type="text"
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="seu usuário" />
            @if (form.get('username')?.invalid && form.get('username')?.touched) {
              <p class="text-red-500 text-xs mt-1">Usuário é obrigatório</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <input formControlName="password" type="password"
              class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="••••••" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="text-red-500 text-xs mt-1">Senha deve ter no mínimo 6 caracteres</p>
            }
          </div>

          @if (errorMessage()) {
            <p class="text-red-500 text-sm text-center">{{ errorMessage() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || loading()"
            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Não tem conta? <a routerLink="/register" class="text-blue-600 hover:underline">Registrar</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      error: () => {
        this.errorMessage.set('Usuário ou senha incorretos');
        this.loading.set(false);
      }
    });
  }
}
