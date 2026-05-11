import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subtask {
  id: number;
  title: string;
  isCompleted: boolean;
  cardId: number;
}

@Injectable({ providedIn: 'root' })
export class SubtaskService {
  private http = inject(HttpClient);
  private url = (cardId: number) => `${environment.apiUrl}/cards/${cardId}/subtasks`;

  getAll(cardId: number): Observable<Subtask[]> {
    return this.http.get<Subtask[]>(this.url(cardId));
  }

  create(cardId: number, title: string): Observable<Subtask> {
    return this.http.post<Subtask>(this.url(cardId), { title });
  }

  toggle(cardId: number, subtaskId: number, isCompleted: boolean): Observable<Subtask> {
    return this.http.patch<Subtask>(`${this.url(cardId)}/${subtaskId}/toggle`, { isCompleted });
  }

  rename(cardId: number, subtaskId: number, title: string): Observable<Subtask> {
    return this.http.patch<Subtask>(`${this.url(cardId)}/${subtaskId}/rename`, { title });
  }

  delete(cardId: number, subtaskId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(cardId)}/${subtaskId}`);
  }
}
