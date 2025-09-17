# Layouts System

This folder contains all layout components for the Stockify application.

## InventoryLayout

The main layout component that includes sidebar navigation and top bar. Use this for all inventory-related pages.

### Usage

```tsx
import { InventoryLayout } from "@/layouts";

export default function YourPage() {
  return (
    <InventoryLayout activeSection="YourSection">
      <div className="p-8">{/* Your page content */}</div>
    </InventoryLayout>
  );
}
```

### Props

- `children`: React.ReactNode - The page content
- `activeSection?`: string - The active navigation section (defaults to 'Dashboard')

### Available Sections

- Dashboard
- Inventory
- Billing
- Customers
- Suppliers
- Reports
- Barcode Generator
- Label Printing
- Profile
- Settings

## Benefits of This Structure

1. **Consolidated**: All layout logic in one place
2. **Reusable**: Easy to apply to any page
3. **Maintainable**: Changes to layout affect all pages automatically
4. **Clean Imports**: Single import instead of multiple components
5. **Type Safe**: Full TypeScript support
6. **Responsive**: Built-in responsive design

## Migration Guide

### Before (Old Pattern)

```tsx
import { Sidebar } from "@/components/inventory/Sidebar";
import { Topbar } from "@/components/inventory/Topbar";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Section" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">{/* Content */}</main>
      </div>
    </div>
  );
}
```

### After (New Pattern)

```tsx
import { InventoryLayout } from "@/layouts";

export default function Page() {
  return (
    <InventoryLayout activeSection="Section">
      <div className="p-8">{/* Content */}</div>
    </InventoryLayout>
  );
}
```

## Future Layouts

Additional layouts can be added to this system:

- AdminLayout (for admin pages)
- PublicLayout (for public pages)
- AuthLayout (for login/signup pages)
