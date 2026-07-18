export const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TICKET_CATEGORY = {
  TECHNICAL: 'Technical',
  BILLING: 'Billing',
  SALES: 'Sales',
  COMPLAINT: 'Complaint',
  GENERAL: 'General',
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPPORT: 'Support',
  USER: 'User',
};

export const API_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  QUERIES: '/queries',
};
