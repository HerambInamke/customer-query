export const USER_ROLES = Object.freeze({
  ADMIN: 'Admin',
  SUPPORT: 'Support',
  USER: 'User',
});

export const QUERY_STATUS = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
});

export const QUERY_PRIORITY = Object.freeze({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
});

export const QUERY_CATEGORY = Object.freeze({
  TECHNICAL: 'Technical',
  BILLING: 'Billing',
  SALES: 'Sales',
  GENERAL: 'General',
  COMPLAINT: 'Complaint',
  OTHER: 'Other',
});

export const SORT_OPTIONS = Object.freeze({
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRIORITY: 'priority',
  STATUS: 'status',
  ALPHABETICAL: 'alphabetical',
});

export const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
});

