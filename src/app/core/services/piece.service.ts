import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PieceInput, PieceViewModel } from '../models/piece.model';

@Injectable({ providedIn: 'root' })
export class PieceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  getProdutos(): Observable<PieceViewModel[]> {
    return this.http.get<PieceViewModel[]>(this.baseUrl);
  }

  getPiece(id: number): Observable<PieceViewModel> {
    return this.http.get<PieceViewModel>(`${this.baseUrl}/${id}`);
  }

  createPiece(payload: PieceInput): Observable<PieceViewModel> {
    return this.http.post<PieceViewModel>(this.baseUrl, payload);
  }

  updatePiece(id: number, payload: PieceInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deletePiece(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
