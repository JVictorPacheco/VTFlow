import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Column {
  id: number;
  name: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class ColumnService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/columns`;

  getAll(boardId: number): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.url}?boardId=${boardId}`);
  }

  create(name: string, boardId: number): Observable<Column> {
    return this.http.post<Column>(this.url, { name, boardId });
  }

  rename(id: number, name: string): Observable<Column> {
    return this.http.put<Column>(`${this.url}/${id}`, { name });
  }

  reorder(id: number, order: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/order`, { order });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
