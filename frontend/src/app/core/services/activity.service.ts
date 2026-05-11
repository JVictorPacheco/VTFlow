import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CardActivity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  cardId: number;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private url = (cardId: number) => `${environment.apiUrl}/cards/${cardId}/activities`;

  getAll(cardId: number): Observable<CardActivity[]> {
    return this.http.get<CardActivity[]>(this.url(cardId));
  }
}
