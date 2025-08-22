// API endpoints constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    LIST: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    UPDATE_STOCK: '/products/update-stock',
    BULK_UPDATE: '/products/bulk-update',
    DASHBOARD_STATS: '/products/dashboard-stats',
    LOW_STOCK: '/products/low-stock',
    SEARCH: '/products/search',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    LIST: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Suppliers
  SUPPLIERS: {
    BASE: '/suppliers',
    LIST: '/suppliers',
    BY_ID: (id: string) => `/suppliers/${id}`,
    CREATE: '/suppliers',
    UPDATE: (id: string) => `/suppliers/${id}`,
    DELETE: (id: string) => `/suppliers/${id}`,
    PRODUCTS: (id: string) => `/suppliers/${id}/products`,
  },

  // Sales
  SALES: {
    BASE: '/sales',
    LIST: '/sales',
    BY_ID: (id: string) => `/sales/${id}`,
    CREATE: '/sales',
    UPDATE: (id: string) => `/sales/${id}`,
    DELETE: (id: string) => `/sales/${id}`,
    STATS: '/sales/stats',
    DAILY_SALES: '/sales/daily',
    MONTHLY_SALES: '/sales/monthly',
    TOP_PRODUCTS: '/sales/top-products',
  },

  // Customers
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
    CREATE: '/customers',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    HISTORY: (id: string) => `/customers/${id}/history`,
    PAYMENTS: (id: string) => `/customers/${id}/payments`,
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    SALES: '/reports/sales',
    STOCK: '/reports/stock',
    CUSTOMERS: '/reports/customers',
    PROFIT_LOSS: '/reports/profit-loss',
    EXPORT: '/reports/export',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_SALES: '/dashboard/recent-sales',
    LOW_STOCK_ALERTS: '/dashboard/low-stock',
    TOP_CUSTOMERS: '/dashboard/top-customers',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  VALIDATION_ERROR: 'Validation error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
