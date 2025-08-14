// API configuration and service functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import type { 
  Product, 
  DashboardStats, 
  ProductFilters, 
  CreateProductRequest, 
  StockUpdateRequest,
  Category,
  Supplier
} from '@/types/product';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  async verifyToken(): Promise<ApiResponse> {
    return this.request('/auth/verify', {
      method: 'GET',
    });
  }

  // Product-related methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/products/dashboard-stats', {
      method: 'GET',
    });
  }

  async getProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'GET',
    });
  }

  async createProduct(product: CreateProductRequest): Promise<ApiResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<CreateProductRequest>): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStock(stockUpdate: StockUpdateRequest): Promise<ApiResponse> {
    return this.request('/products/update-stock', {
      method: 'POST',
      body: JSON.stringify(stockUpdate),
    });
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/products/categories', {
      method: 'GET',
    });
  }

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return this.request('/products/suppliers', {
      method: 'GET',
    });
  }

  // Helper methods for token management
  saveAuthData(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserData(): User | null {
    const userData = localStorage.getItem('userData');
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
