import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Board {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface BoardRequest {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/boards`;

  getAll(): Observable<Board[]> {
    return this.http.get<Board[]>(this.url);
  }

  getById(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.url}/${id}`);
  }

  create(data: BoardRequest): Observable<Board> {
    return this.http.post<Board>(this.url, data);
  }

  update(id: number, data: BoardRequest): Observable<Board> {
    return this.http.put<Board>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
