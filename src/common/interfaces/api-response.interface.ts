export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ResponseMetadata extends Record<string, unknown> {
  pagination?: PaginationMeta;
}

export interface ApiResponseShape<T> {
  status: number;
  message: string;
  data: T & { metadata?: ResponseMetadata };
}
