import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { OrcamentoInput, OrcamentoViewModel } from '../models/orcamento.model';

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orcamentos`;

  getOrcamento(id: number): Observable<OrcamentoViewModel> {
    return this.http.get<OrcamentoViewModel>(`${this.baseUrl}/${id}`);
  }

  createOrcamento(payload: OrcamentoInput): Observable<OrcamentoViewModel> {
    return this.http.post<OrcamentoViewModel>(this.baseUrl, payload);
  }

  updateOrcamento(id: number, payload: OrcamentoInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteOrcamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
