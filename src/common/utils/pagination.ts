import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { PaginationMeta } from '../interfaces/api-response.interface';

export function applyPagination<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number,
  limit: number,
): void {
  const offset = (page - 1) * limit;
  queryBuilder.skip(offset).take(limit);
}

export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
}
