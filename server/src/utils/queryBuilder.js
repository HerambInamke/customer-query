import { SORT_OPTIONS } from '../constants/index.js';

const buildSearchFilter = (search) => {
  if (!search) {
    return {};
  }

  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearch, 'i');

  return {
    $or: [
      { customerName: regex },
      { customerEmail: regex },
      { customerPhone: regex },
      { subject: regex },
      { description: regex },
    ],
  };
};

export const buildSortOption = (sort) => {
  const sortMap = {
    [SORT_OPTIONS.NEWEST]: { createdAt: -1 },
    [SORT_OPTIONS.OLDEST]: { createdAt: 1 },
    [SORT_OPTIONS.PRIORITY]: { priority: 1 },
    [SORT_OPTIONS.STATUS]: { status: 1 },
    [SORT_OPTIONS.ALPHABETICAL]: { customerName: 1 },
  };

  return sortMap[sort] || sortMap[SORT_OPTIONS.NEWEST];
};

const buildDateRangeFilter = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return {};
  }

  const filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  return filter;
};

export const buildQueryFilter = (queryParams) => {
  const { status, priority, category, assignedTo, startDate, endDate, search, deleted } = queryParams;

  let filter = {};

  if (status) {
    filter.status = status;
  }
  if (priority) {
    filter.priority = priority;
  }
  if (category) {
    filter.category = category;
  }
  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }
  if (deleted === 'true') {
    filter.deleted = true;
  }

  const dateFilter = buildDateRangeFilter(startDate, endDate);
  const searchFilter = buildSearchFilter(search);

  filter = { ...filter, ...dateFilter, ...searchFilter };

  return filter;
};
