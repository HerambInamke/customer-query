import { PAGINATION_DEFAULTS } from '../constants/index.js';

export const parsePaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION_DEFAULTS.LIMIT)
  );

  return { page, limit };
};

export const buildPaginationMeta = (paginationResult) => {
  return {
    totalDocuments: paginationResult.totalDocs,
    totalPages: paginationResult.totalPages,
    currentPage: paginationResult.page,
    limit: paginationResult.limit,
    hasNextPage: paginationResult.hasNextPage,
    hasPrevPage: paginationResult.hasPrevPage,
    nextPage: paginationResult.nextPage,
    previousPage: paginationResult.prevPage,
  };
};
