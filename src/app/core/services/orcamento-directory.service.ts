import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CfgIdentifier } from '../models/cfg-identifiers';
import { CfgQueryInput, CfgQueryResult } from '../models/cfg.model';
import { CfgApiService } from './cfg-api.service';

@Injectable({ providedIn: 'root' })
export class OrcamentoDirectoryService {
  private readonly cfgApi = inject(CfgApiService);

  load(page = 1, pageSize = 50, extra?: Partial<CfgQueryInput>): Observable<CfgQueryResult> {
    return this.cfgApi.query(CfgIdentifier.OrcamentoGrid, {
      page,
      pageSize,
      ...extra
    });
  }
}
