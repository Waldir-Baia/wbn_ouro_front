import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CfgIdentifier } from '../models/cfg-identifiers';
import { CfgQueryInput, CfgQueryResult } from '../models/cfg.model';
import { CfgApiService } from './cfg-api.service';

@Injectable({ providedIn: 'root' })
export class ClientDirectoryService {
  private readonly cfgApi = inject(CfgApiService);
  private readonly defaultPageSize = 50;

  load(page = 1, pageSize = this.defaultPageSize, extra?: Partial<CfgQueryInput>): Observable<CfgQueryResult> {
    return this.cfgApi.query(CfgIdentifier.ClientesGrid, {
      page,
      pageSize,
      ...extra
    });
  }
}
