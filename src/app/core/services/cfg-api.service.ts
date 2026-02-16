import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CfgField, CfgQueryInput, CfgQueryResult, CfgSummary } from '../models/cfg.model';

interface CfgQueryResponse {
  data: string;
  primaryKey?: string | null;
  searchIdentifierColumn?: string | null;
  searchDescriptionColumn?: string | null;
  alternateCodeColumn?: string | null;
  fields: CfgField[];
}

@Injectable({ providedIn: 'root' })
export class CfgApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cfg`;

  list(): Observable<CfgSummary[]> {
    return this.http.get<CfgSummary[]>(this.baseUrl);
  }

  query(identifier: string, payload: CfgQueryInput = {}): Observable<CfgQueryResult> {
    return this.http
      .post<CfgQueryResponse>(`${this.baseUrl}/${identifier}/query`, this.normalizePayload(payload))
      .pipe(map((response) => this.mapResponse(response)));
  }

  private normalizePayload(payload: CfgQueryInput): CfgQueryInput {
    return {
      filters: payload.filters ?? null,
      codeFilters: payload.codeFilters ?? null,
      customWhere: payload.customWhere ?? null,
      page: payload.page ?? 1,
      pageSize: payload.pageSize ?? 25,
      orderByField: payload.orderByField ?? null,
      orderByDirection: payload.orderByDirection ?? null
    };
  }

  private mapResponse(response: CfgQueryResponse): CfgQueryResult {
    return {
      data: this.parseData(response.data),
      fields: response.fields ?? [],
      primaryKey: response.primaryKey ?? null,
      searchIdentifierColumn: response.searchIdentifierColumn ?? null,
      searchDescriptionColumn: response.searchDescriptionColumn ?? null,
      alternateCodeColumn: response.alternateCodeColumn ?? null
    };
  }

  private parseData(raw: string): Array<Record<string, unknown>> {
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Erro ao converter dados do CFG', error);
      return [];
    }
  }
}
