import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ClienteInput, ClienteViewModel } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  getClientes(): Observable<ClienteViewModel[]> {
    return this.http.get<ClienteViewModel[]>(this.baseUrl);
  }

  getCliente(id: number): Observable<ClienteViewModel> {
    return this.http.get<ClienteViewModel>(`${this.baseUrl}/${id}`);
  }

  createCliente(payload: ClienteInput): Observable<ClienteViewModel> {
    return this.http.post<ClienteViewModel>(this.baseUrl, payload);
  }

  updateCliente(id: number, payload: ClienteInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
