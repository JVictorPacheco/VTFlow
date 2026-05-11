import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { HealthService } from './core/services/health.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly themeService = inject(ThemeService);
  private readonly healthService = inject(HealthService);
  protected readonly auth = inject(AuthService);
  protected readonly apiStatus = signal<string>('');

  ngOnInit(): void {
    this.healthService.checkHealth().subscribe(result => {
      this.apiStatus.set(result.status);
    });
  }
}
