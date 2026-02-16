export interface CfgSummary {
  identifier: string;
  description: string;
  primaryKeyColumn?: string | null;
}

export interface CfgField {
  fieldKey: string;
  label: string;
  dataType: string;
  displayOrder: number;
  allowFilter: boolean;
  isEditable: boolean;
  isVisible: boolean;
  queryColumn: string;
  mask?: string | null;
  columnWidth: number;
}

export interface CfgFilterField {
  field: string;
  operator?: string;
  value?: string | number | boolean | null;
  values?: Array<string | number>;
}

export interface CfgQueryInput {
  filters?: CfgFilterField[] | null;
  codeFilters?: CfgFilterField[] | null;
  customWhere?: string | null;
  page?: number;
  pageSize?: number;
  orderByField?: string | null;
  orderByDirection?: 'ASC' | 'DESC' | 'asc' | 'desc' | null;
}

export interface CfgQueryResult {
  data: Array<Record<string, unknown>>;
  fields: CfgField[];
  primaryKey?: string | null;
  searchIdentifierColumn?: string | null;
  searchDescriptionColumn?: string | null;
  alternateCodeColumn?: string | null;
}
