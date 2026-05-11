import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';
  isDark = signal<boolean>(this.loadTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'dark';
  }
}
