# Components Directory

This directory contains all React components organized by feature and function for better maintainability.

## Directory Structure

```
components/
├── index.ts                    # Main barrel export file
├── auth/                       # Authentication related components
│   ├── index.ts
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── charts/                     # Data visualization components
│   ├── index.ts
│   ├── MiniAnalytics.tsx
│   └── SalesChart.tsx
├── common/                     # Shared/common components
│   ├── index.ts
│   └── ProtectedRoute.tsx
├── forms/                      # Form components
│   ├── index.ts
│   └── AddProductForm.tsx
├── inventory/                  # Inventory management components
│   ├── index.ts
│   ├── LowStockAlert.tsx
│   ├── PDFBulkImport.tsx
│   ├── ProductTable.tsx
│   └── SummaryCards.tsx
├── navigation/                 # Navigation related components
│   ├── index.ts
│   └── AppNavbar.tsx
├── product/                    # Product related components
│   ├── index.ts
│   ├── DynamicCategorySelect.tsx
│   └── QuickAddProduct.tsx
└── ui/                        # Base UI components (shadcn/ui)
    ├── index.ts
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── Navbar.tsx
    ├── table.tsx
    └── ... (other UI components)
```

## Import Guidelines

### Preferred Import Pattern

Use the barrel exports from category folders:

```typescript
// ✅ Good - Use barrel exports
import { LoginForm, SignupForm } from "@/components/auth";
import { AppNavbar } from "@/components/navigation";
import { QuickAddProduct } from "@/components/product";
import { Button, Card, Dialog } from "@/components/ui";

// ✅ Also good - Import from main barrel
import { LoginForm, AppNavbar, Button } from "@/components";
```

### Avoid Direct File Imports

```typescript
// ❌ Avoid - Direct file imports (unless necessary for tree-shaking)
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
```

## Component Categories

### 📝 Auth Components

Authentication and user management related components.

- `LoginForm` - User login form with validation
- `SignupForm` - User registration form with validation

### 📊 Chart Components

Data visualization and analytics components.

- `MiniAnalytics` - Small analytics widgets
- `SalesChart` - Sales data visualization charts

### 🔗 Common Components

Reusable components used across the application.

- `ProtectedRoute` - Route protection wrapper for authenticated users

### 📋 Form Components

Specialized form components for data entry.

- `AddProductForm` - Product creation form

### 📦 Inventory Components

Inventory management specific components.

- `LowStockAlert` - Low stock warning notifications
- `PDFBulkImport` - Bulk product import from PDF files
- `ProductTable` - Product listing and management table
- `SummaryCards` - Dashboard summary cards

### 🧭 Navigation Components

Navigation and routing related components.

- `AppNavbar` - Main application navigation bar

### 🏷️ Product Components

Product management specific components.

- `DynamicCategorySelect` - Category selection dropdown
- `QuickAddProduct` - Quick product addition component

### 🎨 UI Components

Base UI components from shadcn/ui library and custom UI elements.

- Core shadcn/ui components: `Button`, `Card`, `Dialog`, `Input`, etc.
- Custom components: `Navbar`

## File Naming Conventions

- **Component Files**: PascalCase (e.g., `LoginForm.tsx`, `AppNavbar.tsx`)
- **Index Files**: lowercase `index.ts` for barrel exports
- **Directory Names**: lowercase with hyphens if needed

## Adding New Components

1. Choose the appropriate category folder
2. Create component file in PascalCase
3. Add export to the category's `index.ts` file
4. Update main `components/index.ts` if creating new category

Example:

```typescript
// components/auth/NewAuthComponent.tsx
export function NewAuthComponent() {
  return <div>New Component</div>;
}

// components/auth/index.ts
export { NewAuthComponent } from "./NewAuthComponent";
```

## Migration Notes

This structure was created to improve:

- **Organization**: Components grouped by feature/function
- **Maintainability**: Clear separation of concerns
- **Import Consistency**: Standardized import patterns
- **Developer Experience**: Easier to find and use components

All existing imports have been updated to use the new barrel export system.
