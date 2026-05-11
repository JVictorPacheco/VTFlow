import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Label {
  id: number;
  name: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class LabelService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/labels`;

  getAll(): Observable<Label[]> {
    return this.http.get<Label[]>(this.url);
  }

  create(name: string, color: string): Observable<Label> {
    return this.http.post<Label>(this.url, { name, color });
  }

  update(id: number, name: string, color: string): Observable<Label> {
    return this.http.put<Label>(`${this.url}/${id}`, { name, color });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
