import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt?: string;
  cardId: number;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private url = (cardId: number) => `${environment.apiUrl}/cards/${cardId}/comments`;

  getAll(cardId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.url(cardId));
  }

  create(cardId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(this.url(cardId), { text });
  }

  update(cardId: number, commentId: number, text: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.url(cardId)}/${commentId}`, { text });
  }

  delete(cardId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(cardId)}/${commentId}`);
  }
}
