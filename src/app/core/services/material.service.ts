import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { MaterialInput, MaterialViewModel } from '../models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/materias-primas`;

  getAllMaterials(): Observable<MaterialViewModel[]> {
    return this.http.get<MaterialViewModel[]>(this.baseUrl);
  }

  getMaterial(id: number): Observable<MaterialViewModel> {
    return this.http.get<MaterialViewModel>(`${this.baseUrl}/${id}`);
  }

  createMaterial(payload: MaterialInput): Observable<MaterialViewModel> {
    return this.http.post<MaterialViewModel>(this.baseUrl, payload);
  }

  updateMaterial(id: number, payload: MaterialInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
