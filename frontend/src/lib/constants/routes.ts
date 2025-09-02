// Application routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // App routes (protected)
  DASHBOARD: '/dashboard',
  
  // Inventory routes
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  ADD_PRODUCT: '/products/add',
  EDIT_PRODUCT: (id: string) => `/products/${id}/edit`,
  CATEGORIES: '/categories',
  SUPPLIERS: '/suppliers',
  
  // Sales routes
  SALES: '/sales',
  NEW_SALE: '/sales/new',
  SALE_DETAILS: (id: string) => `/sales/${id}`,
  BILLING: '/billing',
  
  // Customer routes
  CUSTOMERS: '/customers',
  CUSTOMER_DETAILS: (id: string) => `/customers/${id}`,
  ADD_CUSTOMER: '/customers/add',
  
  // Reports routes
  REPORTS: '/reports',
  SALES_REPORT: '/reports/sales',
  STOCK_REPORT: '/reports/stock',
  CUSTOMER_REPORT: '/reports/customers',
  
  // User management routes (Admin)
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  ADD_USER: '/users/add',
  
  // Settings routes
  SETTINGS: '/settings',
  PROFILE: '/profile',
  COMPANY_SETTINGS: '/settings/company',
  
  // Special routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
} as const;

// Route groups for navigation
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.HOME, ROUTES.ABOUT, ROUTES.CONTACT],
  AUTH: [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD],
  MAIN: [
    ROUTES.DASHBOARD,
    ROUTES.PRODUCTS,
    ROUTES.SALES,
    ROUTES.CUSTOMERS,
    ROUTES.REPORTS,
  ],
  ADMIN: [ROUTES.USERS, ROUTES.SETTINGS],
} as const;

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    title: 'Inventory',
    href: ROUTES.PRODUCTS,
    icon: 'Package',
    children: [
      {
        title: 'Products',
        href: ROUTES.PRODUCTS,
      },
      {
        title: 'Categories',
        href: ROUTES.CATEGORIES,
      },
      {
        title: 'Suppliers',
        href: ROUTES.SUPPLIERS,
      },
    ],
  },
  {
    title: 'Sales',
    href: ROUTES.SALES,
    icon: 'ShoppingCart',
    children: [
      {
        title: 'All Sales',
        href: ROUTES.SALES,
      },
      {
        title: 'New Sale',
        href: ROUTES.NEW_SALE,
      },
      {
        title: 'Billing',
        href: ROUTES.BILLING,
      },
    ],
  },
  {
    title: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: 'Users',
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: 'BarChart3',
    children: [
      {
        title: 'Sales Report',
        href: ROUTES.SALES_REPORT,
      },
      {
        title: 'Stock Report',
        href: ROUTES.STOCK_REPORT,
      },
      {
        title: 'Customer Report',
        href: ROUTES.CUSTOMER_REPORT,
      },
    ],
  },
] as const;

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: 'UserCog',
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: 'Settings',
  },
] as const;
