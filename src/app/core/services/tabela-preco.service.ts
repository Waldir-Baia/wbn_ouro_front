import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { TabelaPrecoInput, TabelaPrecoViewModel } from '../models/tabela-preco.model';

@Injectable({ providedIn: 'root' })
export class TabelaPrecoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tabelas-preco`;

  getAllTabelasPreco(): Observable<TabelaPrecoViewModel[]> {
    return this.http.get<TabelaPrecoViewModel[]>(this.baseUrl);
  }

  getTabelaPreco(id: number): Observable<TabelaPrecoViewModel> {
    return this.http.get<TabelaPrecoViewModel>(`${this.baseUrl}/${id}`);
  }

  createTabelaPreco(payload: TabelaPrecoInput): Observable<TabelaPrecoViewModel> {
    return this.http.post<TabelaPrecoViewModel>(this.baseUrl, payload);
  }

  updateTabelaPreco(id: number, payload: TabelaPrecoInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTabelaPreco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
