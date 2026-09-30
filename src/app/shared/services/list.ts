import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { List } from '@shared/models/list.model';
import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root',
})
export class ListService {
  private readonly apiUrl = environment.apiUrl;


  constructor(private readonly http: HttpClient) { }

  getLists(): Observable<List[]> {
    return this.http.get<List[]>(`${this.apiUrl}/lists`, {
      withCredentials: true,
    });
  }

  createList(title: string): Observable<List> {
    return this.http.post<List>(
      `${this.apiUrl}/lists`,
      { title },
      { withCredentials: true },
    );
  }

  deleteList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lists/${id}`, {
      withCredentials: true,
    });
  }

  updateList(id: string, title: string): Observable<List> {
    return this.http.patch<List>(
      `${this.apiUrl}/lists/${id}`,
      { title },
      { withCredentials: true },
    );
  }
}