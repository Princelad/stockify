// API configuration and service functions
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import type {
  Product,
  DashboardStats,
  ProductFilters,
  CreateProductRequest,
  StockUpdateRequest,
  ExtendedSupplier,
  Category,
} from "@/types/product";

import type {
  Return,
  ReturnEligibility,
  CreateReturnData,
  ReturnFilters,
  ReturnsResponse,
} from "@/types/return";

// Additional types for sales and customers
export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isDealer: boolean;
  totalDue: number;
  purchaseHistory: Array<{
    saleId: string;
    amount: number;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  productId: string;
  quantity: number;
}

export interface CreateSaleRequest {
  customerId?: string;
  items: BillItem[];
  discountPercentage?: number;
  paymentMethod?: "cash" | "card" | "upi" | "netbanking" | "credit";
  paymentStatus?: "paid" | "pending" | "partial";
}

export interface Sale {
  _id: string;
  customer?: Customer;
  items: Array<{
    product: {
      _id: string;
      name: string;
      sku: string;
    };
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesResponse {
  sales: Sale[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  token?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoriesResponse {
  categories: Category[];
  popular: Category[];
  userCreated: Category[];
  fromProducts: Category[];
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

// Label printing types
export interface LabelTemplate {
  id: string;
  name: string;
  size: string;
  fields: string[];
  layout: "single" | "grid";
  isDefault?: boolean;
  isCustom?: boolean;
  settings?: {
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    showBorder?: boolean;
    borderColor?: string;
    padding?: number;
    alignment?: "left" | "center" | "right";
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelData {
  type: "product" | "custom";
  productId?: string;
  productName?: string;
  content: Record<string, any>;
  template: LabelTemplate;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// API service class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Handle FormData - don't set Content-Type header for FormData
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      credentials: "include",
    };

    // Set headers conditionally
    if (options.headers === undefined && isFormData) {
      // For FormData, let browser set Content-Type automatically
      config.headers = {};
    } else if (options.headers !== undefined) {
      // Use provided headers
      config.headers = options.headers;
    } else {
      // Default JSON headers
      config.headers = {
        "Content-Type": "application/json",
      };
    }

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Also check for application-level errors (success: false)
      if (data.success === false) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  async verifyToken(): Promise<ApiResponse> {
    return this.request("/auth/verify", {
      method: "GET",
    });
  }

  // User profile methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request("/users/profile", {
      method: "GET",
    });
  }

  async updateUserProfile(
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async changePassword(
    passwordData: ChangePasswordRequest
  ): Promise<ApiResponse> {
    return this.request("/users/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData();
    formData.append("avatar", file);

    return this.request("/users/avatar", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it with boundary
    });
  }

  async getUserStats(): Promise<ApiResponse> {
    return this.request("/users/stats", {
      method: "GET",
    });
  }

  async getUserActivity(): Promise<ApiResponse> {
    return this.request("/users/activity", {
      method: "GET",
    });
  }

  async getUserPreferences(): Promise<ApiResponse> {
    return this.request("/users/preferences", {
      method: "GET",
    });
  }

  async updateUserPreferences(preferences: any): Promise<ApiResponse> {
    return this.request("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  // Product-related methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request("/products/dashboard-stats", {
      method: "GET",
    });
  }

  async getProducts(
    filters?: ProductFilters
  ): Promise<ApiResponse<ProductsResponse>> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return this.request(endpoint, {
      method: "GET",
    });
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: "GET",
    });
  }

  async createProduct(
    product: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    id: string,
    product: Partial<CreateProductRequest>
  ): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async updateStock(stockUpdate: StockUpdateRequest): Promise<ApiResponse> {
    return this.request("/products/update-stock", {
      method: "POST",
      body: JSON.stringify(stockUpdate),
    });
  }

  async getCategories(): Promise<ApiResponse<CategoriesResponse>> {
    return this.request("/categories", {
      method: "GET",
    });
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse> {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async getPopularCategories(): Promise<ApiResponse<Category[]>> {
    return this.request("/categories/popular", {
      method: "GET",
    });
  }

  async updateCategory(
    id: string,
    categoryData: { name: string; description?: string }
  ): Promise<ApiResponse> {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // =====================================================
  // SUPPLIERS API METHODS
  // =====================================================

  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    ApiResponse<{
      suppliers: ExtendedSupplier[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>
  > {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/suppliers${query}`, {
      method: "GET",
    });
  }

  async getSupplier(id: string): Promise<ApiResponse<ExtendedSupplier>> {
    return this.request(`/suppliers/${id}`, {
      method: "GET",
    });
  }

  async createSupplier(supplierData: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: string;
    paymentTerms?: string;
    status?: "active" | "inactive";
    businessType?: string;
    taxId?: string;
    creditLimit?: number;
    website?: string;
    notes?: string;
  }): Promise<ApiResponse<ExtendedSupplier>> {
    return this.request("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(
    id: string,
    supplierData: {
      name?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      address?: string;
      category?: string;
      paymentTerms?: string;
      status?: "active" | "inactive";
      businessType?: string;
      taxId?: string;
      creditLimit?: number;
      website?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<ExtendedSupplier>> {
    return this.request(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id: string): Promise<ApiResponse> {
    return this.request(`/suppliers/${id}`, {
      method: "DELETE",
    });
  }

  async getSupplierStats(): Promise<
    ApiResponse<{
      overview: {
        totalSuppliers: number;
        activeSuppliers: number;
        inactiveSuppliers: number;
        totalCreditLimit: number;
      };
      categoryBreakdown: Array<{ _id: string; count: number }>;
      recentSuppliers: Array<{
        _id: string;
        name: string;
        category: string;
        status: string;
        createdAt: string;
      }>;
    }>
  > {
    return this.request("/suppliers/stats", {
      method: "GET",
    });
  }

  async searchSuppliers(
    query: string,
    limit?: number
  ): Promise<ApiResponse<ExtendedSupplier[]>> {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append("limit", limit.toString());

    return this.request(`/suppliers/search?${params.toString()}`, {
      method: "GET",
    });
  }

  // =====================================================
  // SALES API METHODS
  // =====================================================

  async getSales(params?: {
    page?: number;
    limit?: number;
    customer?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<SalesResponse>> {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/sales${query}`, {
      method: "GET",
    });
  }

  async getSale(id: string): Promise<ApiResponse<Sale>> {
    return this.request(`/sales/${id}`, {
      method: "GET",
    });
  }

  async createSale(saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    return this.request("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  }

  async updateSalePayment(
    id: string,
    paymentStatus: string
  ): Promise<ApiResponse<Sale>> {
    return this.request(`/sales/${id}/payment`, {
      method: "PUT",
      body: JSON.stringify({ paymentStatus }),
    });
  }

  async deleteSale(id: string): Promise<ApiResponse> {
    return this.request(`/sales/${id}`, {
      method: "DELETE",
    });
  }

  async getSalesStats(period?: number): Promise<
    ApiResponse<{
      totalSales: number;
      totalRevenue: number;
      recentSales: Sale[];
      period: number;
    }>
  > {
    const query = period ? `?period=${period}` : "";
    return this.request(`/sales/stats${query}`, {
      method: "GET",
    });
  }

  // =====================================================
  // RETURNS API METHODS
  // =====================================================

  async createReturn(
    returnData: CreateReturnData
  ): Promise<ApiResponse<Return>> {
    return this.request("/returns", {
      method: "POST",
      body: JSON.stringify(returnData),
    });
  }

  async getReturns(
    filters?: ReturnFilters
  ): Promise<ApiResponse<ReturnsResponse>> {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.customerId)
      queryParams.append("customerId", filters.customerId);
    if (filters?.search) queryParams.append("search", filters.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`/returns${query}`, {
      method: "GET",
    });
  }

  async getReturnById(returnId: string): Promise<ApiResponse<Return>> {
    return this.request(`/returns/${returnId}`, {
      method: "GET",
    });
  }

  async processReturn(
    returnId: string,
    action: "approve" | "reject",
    notes?: string
  ): Promise<ApiResponse<Return>> {
    return this.request(`/returns/${returnId}/process`, {
      method: "PUT",
      body: JSON.stringify({ action, notes }),
    });
  }

  async getReturnEligibility(
    saleId: string
  ): Promise<ApiResponse<ReturnEligibility>> {
    return this.request(`/returns/eligibility/${saleId}`, {
      method: "GET",
    });
  }

  // =====================================================
  // CUSTOMER API METHODS
  // =====================================================

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<CustomersResponse>> {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/customers${query}`, {
      method: "GET",
    });
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return this.request(`/customers/${id}`, {
      method: "GET",
    });
  }

  async createCustomer(customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    isDealer?: boolean;
  }): Promise<ApiResponse<Customer>> {
    return this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(
    id: string,
    customerData: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      isDealer?: boolean;
    }
  ): Promise<ApiResponse<Customer>> {
    return this.request(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    return this.request(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    return this.request(`/customers/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  }

  // Enhanced product search for billing (includes stock info)
  async searchProductsForBilling(
    query: string
  ): Promise<ApiResponse<ProductsResponse>> {
    return this.request(
      `/products/search/billing?q=${encodeURIComponent(query)}&limit=20`,
      {
        method: "GET",
      }
    );
  }

  // =====================================================
  // LABEL PRINTING API METHODS
  // =====================================================

  async getLabelTemplates(): Promise<
    ApiResponse<{
      templates: LabelTemplate[];
      defaultCount: number;
      customCount: number;
    }>
  > {
    return this.request("/labels/templates", {
      method: "GET",
    });
  }

  async createLabelTemplate(templateData: {
    name: string;
    size: string;
    fields: string[];
    layout: "single" | "grid";
    settings?: Record<string, any>;
  }): Promise<ApiResponse<{ template: LabelTemplate }>> {
    return this.request("/labels/templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  }

  async updateLabelTemplate(
    id: string,
    templateData: {
      name?: string;
      size?: string;
      fields?: string[];
      layout?: "single" | "grid";
      settings?: Record<string, any>;
    }
  ): Promise<ApiResponse<{ template: LabelTemplate }>> {
    return this.request(`/labels/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    });
  }

  async deleteLabelTemplate(id: string): Promise<ApiResponse> {
    return this.request(`/labels/templates/${id}`, {
      method: "DELETE",
    });
  }

  async generateLabels(labelData: {
    templateId: string;
    products?: string[];
    customText?: string;
    quantity?: number;
  }): Promise<
    ApiResponse<{
      labels: LabelData[];
      template: LabelTemplate;
      totalLabels: number;
      summary: {
        templateName: string;
        templateSize: string;
        labelCount: number;
        productsCount: number;
        customLabelsCount: number;
      };
    }>
  > {
    return this.request("/labels/generate", {
      method: "POST",
      body: JSON.stringify(labelData),
    });
  }

  async generateLabelPDF(labelData: {
    templateId: string;
    products?: string[];
    customText?: string;
    quantity?: number;
    options?: Record<string, any>;
  }): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/labels/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      credentials: "include",
      body: JSON.stringify(labelData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate PDF");
    }

    return response.blob();
  }

  // =====================================================
  // REPORTS API METHODS
  // =====================================================

  async getInventoryReport(params?: {
    period?: string;
    category?: string;
    supplier?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  }): Promise<
    ApiResponse<{
      inventoryData: any[];
      summary: {
        totalItems: number;
        totalValue: number;
        totalRetailValue: number;
        lowStockItems: number;
        outOfStockItems: number;
      };
      categoryStock: any[];
      stockMovements: any[];
      supplierAnalysis: any[];
      period: string;
    }>
  > {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/reports/inventory${query}`, {
      method: "GET",
    });
  }

  async getSalesReport(params?: {
    period?: string;
    customer?: string;
    paymentMethod?: string;
    category?: string;
  }): Promise<
    ApiResponse<{
      salesData: any[];
      topProducts: any[];
      categorySales: any[];
      summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageOrderValue: number;
        totalDiscountGiven: number;
        growthRate: number;
      };
      period: string;
    }>
  > {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/reports/sales${query}`, {
      method: "GET",
    });
  }

  async getTaxReport(params?: { period?: string; gstRate?: string }): Promise<
    ApiResponse<{
      taxData: any[];
      gstRates: any[];
      taxReturns: any[];
      summary: {
        totalTaxCollected: number;
        totalTaxableAmount: number;
        totalTransactions: number;
        pendingReturns: number;
        complianceScore: number;
      };
      period: string;
    }>
  > {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    return this.request(`/reports/tax${query}`, {
      method: "GET",
    });
  }

  async exportUserData(): Promise<ApiResponse> {
    return this.request("/users/export", {
      method: "GET",
    });
  }

  // PDF Processing methods
  async previewPDFExtraction(
    file: File,
    options?: {
      supplierName?: string;
      defaultCategory?: string;
      priceType?: string;
      enableOCR?: boolean;
    }
  ): Promise<
    ApiResponse<{
      summary: {
        totalProducts: number;
        confidence: number;
        method: string;
        templateName?: string;
        templateConfidence?: number;
        extractionMethod: string;
        ocrUsed: boolean;
        processingTime: string;
        fieldsFound: Record<string, { count: number; percentage: number }>;
      };
      sampleProducts: Product[];
      extractedText: string;
      recommendations: {
        confidence: number;
        suggestedMethod: string;
        fieldQuality: Record<string, any>;
      };
    }>
  > {
    const formData = new FormData();
    formData.append("pdfFile", file);

    if (options?.supplierName) {
      formData.append("supplierName", options.supplierName);
    }
    if (options?.defaultCategory) {
      formData.append("defaultCategory", options.defaultCategory);
    }
    if (options?.priceType) {
      formData.append("priceType", options.priceType);
    }
    if (options?.enableOCR !== undefined) {
      formData.append("enableOCR", String(options.enableOCR));
    }

    return this.request("/products/pdf-import/preview", {
      method: "POST",
      body: formData,
      // Don't set Content-Type, let browser set it for FormData
      headers: undefined,
    });
  }

  async processPDFImport(
    file: File,
    options: {
      supplierName: string;
      defaultCategory?: string;
      priceType?: string;
      enableOCR?: boolean;
    }
  ): Promise<
    ApiResponse<{
      extractedProducts: Product[];
      summary: any;
      importSessionId: string;
    }>
  > {
    const formData = new FormData();
    formData.append("pdfFile", file);
    formData.append("supplierName", options.supplierName);

    if (options.defaultCategory) {
      formData.append("defaultCategory", options.defaultCategory);
    }
    if (options.priceType) {
      formData.append("priceType", options.priceType);
    }
    if (options.enableOCR !== undefined) {
      formData.append("enableOCR", String(options.enableOCR));
    }

    return this.request("/products/pdf-import/process", {
      method: "POST",
      body: formData,
      headers: undefined,
    });
  }

  async confirmPDFImport(data: {
    products: Product[];
    supplierInfo: any;
    importOptions: any;
  }): Promise<
    ApiResponse<{
      importedCount: number;
      skippedCount: number;
      failedCount: number;
      importedProducts: Product[];
    }>
  > {
    return this.request("/products/pdf-import/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Helper methods for token management
  saveAuthData(token: string, user: User): void {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(user));
  }

  getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  getUserData(): User | null {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL);

// Export utility functions
export const saveAuthData = (token: string, user: User) => {
  apiService.saveAuthData(token, user);
};

export const clearAuthData = () => {
  apiService.logout();
};

export const isAuthenticated = () => {
  return apiService.isAuthenticated();
};

export const getCurrentUser = () => {
  return apiService.getUserData();
};
