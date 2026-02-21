import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CategoryInput, CategoryViewModel } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tipos-categorias`;

  getAllCategories(): Observable<CategoryViewModel[]> {
    return this.http.get<CategoryViewModel[]>(this.baseUrl);
  }

  getCategory(id: number): Observable<CategoryViewModel> {
    return this.http.get<CategoryViewModel>(`${this.baseUrl}/${id}`);
  }

  createCategory(payload: CategoryInput): Observable<CategoryViewModel> {
    return this.http.post<CategoryViewModel>(this.baseUrl, payload);
  }

  updateCategory(id: number, payload: CategoryInput): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
