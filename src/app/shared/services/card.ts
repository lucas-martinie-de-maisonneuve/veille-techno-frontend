import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '@shared/models/card.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCards(listId: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/lists/${listId}/cards`, {
      withCredentials: true,
    });
  }

  createCard(listId: string, title: string): Observable<Card> {
    return this.http.post<Card>(
      `${this.apiUrl}/lists/${listId}/cards`,
      { title },
      { withCredentials: true },
    );
  }

  updateCard(
    id: string,
    data: { title?: string; position?: number; listId?: string },
  ): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/cards/${id}`, data, { withCredentials: true });
  }

  deleteCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cards/${id}`, {
      withCredentials: true,
    });
  }
}
