import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ServiceInput, ServiceViewModel } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/servicos`;

  getService(id: number): Observable<ServiceViewModel> {
    return this.http.get<ServiceViewModel>(`${this.baseUrl}/${id}`);
  }

  createService(payload: ServiceInput): Observable<ServiceViewModel> {
    return this.http.post<ServiceViewModel>(this.baseUrl, payload);
  }

  updateService(id: number, payload: ServiceInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
