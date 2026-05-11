import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);

  checkHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${environment.apiUrl}/health`).pipe(
      catchError(() => of({ status: 'API indisponível' }))
    );
  }
}
