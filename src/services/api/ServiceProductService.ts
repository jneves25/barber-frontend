
import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Service {
  id?: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  companyId: number;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  companyId: number;
}

export class ServiceProductService extends BaseService {
  constructor() {
    super(''); // Base endpoint will be set in specific methods
  }

  validateService(service: Service): string | null {
    const requiredError = this.validateRequired(service, [
      'name', 'price', 'duration', 'description', 'companyId'
    ]);
    if (requiredError) return requiredError;
    
    if (service.price < 0) {
      return 'Price must be positive';
    }
    
    if (service.duration <= 0) {
      return 'Duration must be positive';
    }
    
    return null;
  }

  validateProduct(product: Product): string | null {
    const requiredError = this.validateRequired(product, [
      'name', 'description', 'price', 'stock', 'imageUrl', 'companyId'
    ]);
    if (requiredError) return requiredError;
    
    if (product.price < 0) {
      return 'Price must be positive';
    }
    
    return null;
  }

  // Service methods
  async getAllServices(companyId: number): Promise<ApiResponse<Service[]>> {
    return this.handleResponse<Service[]>(apiClient.get(`/service/company/${companyId}`));
  }

  async getServiceById(id: number): Promise<ApiResponse<Service>> {
    return this.handleResponse<Service>(apiClient.get(`/service/${id}`));
  }

  async createService(service: Service): Promise<ApiResponse<Service>> {
    const validationError = this.validateService(service);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Service>(apiClient.post('/service', service));
  }

  async updateService(id: number, service: Service): Promise<ApiResponse<Service>> {
    const validationError = this.validateService(service);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Service>(apiClient.put(`/service/${id}`, service));
  }

  async deleteService(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/service/${id}`));
  }

  // Product methods
  async getAllProducts(companyId: number): Promise<ApiResponse<Product[]>> {
    return this.handleResponse<Product[]>(apiClient.get(`/product/company/${companyId}`));
  }

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    return this.handleResponse<Product>(apiClient.get(`/product/${id}`));
  }

  async createProduct(product: Product): Promise<ApiResponse<Product>> {
    const validationError = this.validateProduct(product);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Product>(apiClient.post('/product', product));
  }

  async updateProduct(id: number, product: Product): Promise<ApiResponse<Product>> {
    const validationError = this.validateProduct(product);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Product>(apiClient.put(`/product/${id}`, product));
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/product/${id}`));
  }

  async updateProductStock(id: number, quantity: number): Promise<ApiResponse<Product>> {
    if (quantity < 0) {
      return { error: 'Quantity must be positive', status: 400, success: false };
    }
    
    return this.handleResponse<Product>(
      apiClient.patch(`/product/${id}/stock`, { stock: quantity })
    );
  }
}

export default new ServiceProductService();
