import { SORT_OPTIONS } from '../constants/index.js';

const buildSearchFilter = (search) => {
  if (!search) return {};

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

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

const buildDateRangeFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};

  const createdAt = {};
  if (startDate) createdAt.$gte = new Date(startDate);
  if (endDate) createdAt.$lte = new Date(endDate);

  return { createdAt };
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

export const buildQueryFilter = (queryParams) => {
  const { status, priority, category, assignedTo, startDate, endDate, search } = queryParams;

  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;

  return {
    ...filter,
    ...buildDateRangeFilter(startDate, endDate),
    ...buildSearchFilter(search),
  };
};
