import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subtask } from './subtask.service';
import { Comment } from './comment.service';

export type Priority = 'Low' | 'Medium' | 'High';

export interface CardLabel {
  id: number;
  name: string;
  color: string;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  columnId: number;
  createdAt: string;
  labels: CardLabel[];
  order: number;
  subtasks: Subtask[];
  comments: Comment[];
}

export interface CardRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  columnId: number;
  labelIds: number[];
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/cards`;

  getAll(): Observable<Card[]> {
    return this.http.get<Card[]>(this.url);
  }

  getByColumn(columnId: number): Observable<Card[]> {
    const params = new HttpParams().set('columnId', columnId);
    return this.http.get<Card[]>(this.url, { params });
  }

  create(data: CardRequest): Observable<Card> {
    return this.http.post<Card>(this.url, data);
  }

  update(id: number, data: CardRequest): Observable<Card> {
    return this.http.put<Card>(`${this.url}/${id}`, data);
  }

  move(id: number, columnId: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/column`, { columnId });
  }

  reorder(cardId: number, order: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${cardId}/order`, { order });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
