# 📁 Stockify Frontend Structure Guide

## 🎯 Optimized Frontend Architecture

This document outlines the recommended frontend structure for Stockify, designed to scale with the project's requirements and follow industry best practices.

## 📂 Directory Structure

```
frontend/
├── public/                           # Static assets
│   ├── icons/                       # App icons and favicons
│   ├── images/                      # Static images
│   └── manifest.json               # Web app manifest
├── src/
│   ├── app/                         # App-level configuration
│   │   ├── store/                   # Global state management
│   │   │   ├── index.ts            # Store configuration
│   │   │   ├── slices/             # Redux slices or Zustand stores
│   │   │   └── middleware/         # Store middleware
│   │   └── providers/              # App-level providers
│   │       ├── AppProviders.tsx    # Combined providers wrapper
│   │       ├── AuthProvider.tsx    # Authentication provider
│   │       ├── ThemeProvider.tsx   # Theme management
│   │       └── QueryProvider.tsx   # React Query provider
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                     # Basic UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts           # Export all UI components
│   │   │
│   │   ├── common/                # Common business components
│   │   │   ├── Layout/            # Layout components
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Navigation/        # Navigation components
│   │   │   │   ├── AppNavbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MobileNav.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── Forms/             # Form components
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormError.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── index.ts
│   │   │   ├── DataDisplay/       # Data display components
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   ├── Feedback/          # User feedback components
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   │
│   │   └── charts/                # Chart components
│   │       ├── BarChart.tsx
│   │       ├── LineChart.tsx
│   │       ├── PieChart.tsx
│   │       ├── SalesChart.tsx
│   │       └── StockChart.tsx
│   │
│   ├── features/                  # Feature-based modules
│   │   ├── auth/                  # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useSignup.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── dashboard/             # Dashboard feature
│   │   │   ├── components/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── RecentSales.tsx
│   │   │   │   ├── LowStockAlert.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboardStats.ts
│   │   │   │   └── useRecentActivity.ts
│   │   │   ├── services/
│   │   │   │   └── dashboardService.ts
│   │   │   └── types/
│   │   │       └── dashboard.types.ts
│   │   │
│   │   ├── inventory/             # Inventory/Products feature
│   │   │   ├── components/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   ├── StockUpdateForm.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   ├── SupplierFilter.tsx
│   │   │   │   ├── BulkImport.tsx
│   │   │   │   └── LowStockAlert.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   ├── useCreateProduct.ts
│   │   │   │   ├── useUpdateProduct.ts
│   │   │   │   ├── useDeleteProduct.ts
│   │   │   │   ├── useStockUpdate.ts
│   │   │   │   ├── useCategories.ts
│   │   │   │   └── useSuppliers.ts
│   │   │   ├── services/
│   │   │   │   ├── productService.ts
│   │   │   │   ├── categoryService.ts
│   │   │   │   └── supplierService.ts
│   │   │   └── types/
│   │   │       ├── product.types.ts
│   │   │       ├── category.types.ts
│   │   │       └── supplier.types.ts
│   │   │
│   │   ├── sales/                 # Sales & Billing feature
│   │   │   ├── components/
│   │   │   │   ├── SalesList.tsx
│   │   │   │   ├── SaleForm.tsx
│   │   │   │   ├── BillingForm.tsx
│   │   │   │   ├── InvoiceGenerator.tsx
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── SalesFilters.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSales.ts
│   │   │   │   ├── useCreateSale.ts
│   │   │   │   ├── useSalesStats.ts
│   │   │   │   └── useInvoice.ts
│   │   │   ├── services/
│   │   │   │   ├── salesService.ts
│   │   │   │   └── invoiceService.ts
│   │   │   └── types/
│   │   │       ├── sales.types.ts
│   │   │       └── invoice.types.ts
│   │   │
│   │   ├── customers/             # Customer Management feature
│   │   │   ├── components/
│   │   │   │   ├── CustomerList.tsx
│   │   │   │   ├── CustomerForm.tsx
│   │   │   │   ├── CustomerDetails.tsx
│   │   │   │   ├── CustomerHistory.tsx
│   │   │   │   ├── PaymentHistory.tsx
│   │   │   │   └── CreditManagement.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCustomers.ts
│   │   │   │   ├── useCustomer.ts
│   │   │   │   ├── useCustomerHistory.ts
│   │   │   │   └── usePaymentHistory.ts
│   │   │   ├── services/
│   │   │   │   └── customerService.ts
│   │   │   └── types/
│   │   │       └── customer.types.ts
│   │   │
│   │   ├── reports/               # Reports & Analytics feature
│   │   │   ├── components/
│   │   │   │   ├── SalesReport.tsx
│   │   │   │   ├── StockReport.tsx
│   │   │   │   ├── CustomerReport.tsx
│   │   │   │   ├── ProfitLossReport.tsx
│   │   │   │   ├── ReportFilters.tsx
│   │   │   │   └── ExportOptions.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useReports.ts
│   │   │   │   ├── useSalesReport.ts
│   │   │   │   ├── useStockReport.ts
│   │   │   │   └── useExportReport.ts
│   │   │   ├── services/
│   │   │   │   └── reportsService.ts
│   │   │   └── types/
│   │   │       └── reports.types.ts
│   │   │
│   │   └── users/                 # User Management feature (Admin)
│   │       ├── components/
│   │       │   ├── UserList.tsx
│   │       │   ├── UserForm.tsx
│   │       │   ├── UserDetails.tsx
│   │       │   ├── RoleManagement.tsx
│   │       │   └── PermissionMatrix.tsx
│   │       ├── hooks/
│   │       │   ├── useUsers.ts
│   │       │   ├── useUser.ts
│   │       │   ├── useRoles.ts
│   │       │   └── usePermissions.ts
│   │       ├── services/
│   │       │   └── userService.ts
│   │       └── types/
│   │           └── user.types.ts
│   │
│   ├── hooks/                     # Global custom hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useApi.ts             # API hook wrapper
│   │   ├── useLocalStorage.ts    # Local storage hook
│   │   ├── useSessionStorage.ts  # Session storage hook
│   │   ├── useDebounce.ts        # Debounce hook
│   │   ├── useToggle.ts          # Toggle state hook
│   │   ├── usePagination.ts      # Pagination hook
│   │   ├── useSearch.ts          # Search functionality hook
│   │   ├── useSort.ts            # Sorting hook
│   │   ├── useFilter.ts          # Filtering hook
│   │   ├── usePermissions.ts     # Permissions hook
│   │   └── index.ts              # Export all hooks
│   │
│   ├── lib/                       # Utility libraries and configurations
│   │   ├── api/                  # API configuration
│   │   │   ├── client.ts         # Axios/Fetch client setup
│   │   │   ├── endpoints.ts      # API endpoints constants
│   │   │   ├── types.ts          # API response types
│   │   │   └── index.ts          # Export API utilities
│   │   ├── auth/                 # Authentication utilities
│   │   │   ├── token.ts          # Token management
│   │   │   ├── permissions.ts    # Permission checks
│   │   │   └── guards.ts         # Route guards
│   │   ├── constants/            # Application constants
│   │   │   ├── routes.ts         # Route constants
│   │   │   ├── api.ts            # API constants
│   │   │   ├── roles.ts          # User roles constants
│   │   │   ├── permissions.ts    # Permissions constants
│   │   │   └── index.ts          # Export all constants
│   │   ├── schemas/              # Validation schemas
│   │   │   ├── auth.schemas.ts   # Authentication schemas
│   │   │   ├── product.schemas.ts # Product schemas
│   │   │   ├── sales.schemas.ts  # Sales schemas
│   │   │   └── customer.schemas.ts # Customer schemas
│   │   ├── utils/                # Utility functions
│   │   │   ├── format.ts         # Formatting utilities (currency, date, etc.)
│   │   │   ├── validation.ts     # Validation utilities
│   │   │   ├── storage.ts        # Storage utilities
│   │   │   ├── export.ts         # Export utilities (PDF, Excel)
│   │   │   ├── calculations.ts   # Business calculations
│   │   │   ├── cn.ts             # Class name utility (clsx + tailwind-merge)
│   │   │   └── index.ts          # Export all utilities
│   │   └── config/               # Configuration files
│   │       ├── env.ts            # Environment variables
│   │       ├── theme.ts          # Theme configuration
│   │       └── app.ts            # App configuration
│   │
│   ├── pages/                     # Page components (Route components)
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── DashboardPage.tsx
│   │   │   └── index.ts
│   │   ├── inventory/            # Inventory pages
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailsPage.tsx
│   │   │   ├── AddProductPage.tsx
│   │   │   ├── EditProductPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── SuppliersPage.tsx
│   │   │   └── index.ts
│   │   ├── sales/                # Sales pages
│   │   │   ├── SalesPage.tsx
│   │   │   ├── NewSalePage.tsx
│   │   │   ├── SaleDetailsPage.tsx
│   │   │   ├── BillingPage.tsx
│   │   │   └── index.ts
│   │   ├── customers/            # Customer pages
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── CustomerDetailsPage.tsx
│   │   │   ├── AddCustomerPage.tsx
│   │   │   └── index.ts
│   │   ├── reports/              # Reports pages
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SalesReportPage.tsx
│   │   │   ├── StockReportPage.tsx
│   │   │   └── index.ts
│   │   ├── users/                # User management pages (Admin)
│   │   │   ├── UsersPage.tsx
│   │   │   ├── UserDetailsPage.tsx
│   │   │   ├── AddUserPage.tsx
│   │   │   └── index.ts
│   │   ├── settings/             # Settings pages
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── CompanySettingsPage.tsx
│   │   │   └── index.ts
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── AboutPage.tsx         # About page
│   │   ├── ContactPage.tsx       # Contact page
│   │   ├── NotFoundPage.tsx      # 404 page
│   │   └── index.ts              # Export all pages
│   │
│   ├── styles/                    # Styling files
│   │   ├── globals.css           # Global styles
│   │   ├── components.css        # Component-specific styles
│   │   └── utilities.css         # Utility classes
│   │
│   ├── types/                     # Global TypeScript types
│   │   ├── api.types.ts          # API-related types
│   │   ├── auth.types.ts         # Authentication types
│   │   ├── common.types.ts       # Common/shared types
│   │   ├── navigation.types.ts   # Navigation types
│   │   └── index.ts              # Export all types
│   │
│   ├── App.tsx                    # Main App component
│   ├── main.tsx                   # Application entry point
│   ├── vite-env.d.ts             # Vite environment types
│   └── index.css                  # Main CSS file
│
├── .env.example                   # Environment variables example
├── .env.local                     # Local environment variables
├── .gitignore                     # Git ignore rules
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── components.json                # shadcn/ui configuration
├── index.html                     # Main HTML file
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json             # App-specific TypeScript config
├── tsconfig.node.json            # Node-specific TypeScript config
├── vite.config.ts                # Vite configuration
└── README.md                      # Frontend documentation
```

## 🎯 Key Benefits of This Structure

### 1. **Feature-Based Organization**
- Each feature (auth, inventory, sales, etc.) is self-contained
- Easy to locate and maintain feature-specific code
- Promotes code reusability and modularity

### 2. **Separation of Concerns**
- **Components**: Pure UI components
- **Hooks**: Business logic and state management
- **Services**: API calls and data fetching
- **Types**: TypeScript definitions
- **Utils**: Helper functions

### 3. **Scalability**
- Easy to add new features
- Clear patterns for adding components, hooks, and services
- Consistent folder structure across features

### 4. **Developer Experience**
- Clear import paths with TypeScript path mapping
- Easy to find specific functionality
- Consistent naming conventions

### 5. **Maintainability**
- Single responsibility principle
- Easy testing with isolated modules
- Clear dependencies between modules

## 📋 Migration Checklist

### Phase 1: Core Structure
- [ ] Create feature-based folders
- [ ] Move existing components to appropriate features
- [ ] Set up TypeScript path mapping
- [ ] Update import statements

### Phase 2: Component Organization
- [ ] Extract UI components to `components/ui`
- [ ] Create feature-specific components
- [ ] Implement common layout components
- [ ] Set up chart components

### Phase 3: State Management
- [ ] Implement custom hooks for each feature
- [ ] Set up global state management (Context/Redux/Zustand)
- [ ] Create service layers for API calls

### Phase 4: Utilities & Types
- [ ] Set up utility functions
- [ ] Create comprehensive type definitions
- [ ] Implement validation schemas
- [ ] Set up constants and configurations

### Phase 5: Pages & Routing
- [ ] Organize pages by features
- [ ] Implement protected routes
- [ ] Set up proper navigation structure

## 🚀 Next Steps

1. Start with **Phase 1** to establish the basic structure
2. Move existing components gradually
3. Implement missing features based on README requirements
4. Add comprehensive testing structure
5. Set up proper CI/CD pipeline

This structure will provide a solid foundation for your stock management system and ensure maintainability as the project grows.
