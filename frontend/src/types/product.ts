export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  sku: string;
  barcode?: string;

  // Pricing
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  retailPrice?: number;
  profitMargin?: number;

  // Stock Management
  stock: number;
  currentStock: number; // API response uses this field
  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint?: number;

  // Supplier Information
  supplier:
    | string
    | {
        name: string;
        contact?: string;
        email?: string;
        phone?: string;
        address?: string;
      };

  // Physical Properties
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  // Status
  isActive: boolean;
  tags?: string[];
  images?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Additional fields for display
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalSuppliers: number;
  totalCategories: number;

  // Recent activity
  recentSales?: {
    count: number;
    value: number;
  };

  // Top products
  topProducts?: Array<{
    product: Product;
    sales: number;
    revenue: number;
  }>;

  // Category breakdown
  categoryBreakdown?: Array<{
    category: string;
    count: number;
    value: number;
  }>;

  // Stock alerts
  stockAlerts?: Array<{
    product: Product;
    alertType: "low" | "out" | "overstock";
  }>;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  supplier?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  retailPrice?: number;
  currentStock: number; // Backend expects this
  minStockLevel: number;
  maxStockLevel?: number;
  // Supplier reference (new way)
  supplierId?: string;
  // Supplier embedded info (backward compatibility)
  supplier?: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  images?: string[];
}

export interface StockUpdateRequest {
  productId: string;
  quantity: number;
  operation: "add" | "subtract" | "set";
  reason?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  count: number;
  isPopular?: boolean;
  type?: "user_created" | "from_products" | "popular";
}

export interface Supplier {
  _id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  productCount: number;
  totalValue: number;
}

export interface ExtendedSupplier {
  _id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  productCount: number;
  totalValue: number;
  contactPerson?: string;
  lastOrder?: string;
  status?: "active" | "inactive";
  paymentTerms?: string;
  category?: string;
  businessType?: string;
  taxId?: string;
  creditLimit?: number;
  website?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOrderDate?: string;
  totalOrderValue?: number;
}
