
import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Client {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: string;
}

export class ClientService extends BaseService {
  constructor() {
    super('clients');
  }

  validateClient(client: Client): string | null {
    const requiredError = this.validateRequired(client, ['name', 'email', 'phone']);
    if (requiredError) return requiredError;
    
    const emailError = this.validateEmail(client.email);
    if (emailError) return emailError;
    
    if (client.password && client.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    // Simple phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(client.phone.replace(/\D/g, ''))) {
      return 'Invalid phone format';
    }
    
    return null;
  }

  async getAll(): Promise<ApiResponse<Client[]>> {
    return this.handleResponse<Client[]>(apiClient.get(`/${this.endpoint}`));
  }

  async getByCompany(companyId: number): Promise<ApiResponse<Client[]>> {
    return this.handleResponse<Client[]>(apiClient.get(`/${this.endpoint}/company/${companyId}`));
  }

  async getById(id: number): Promise<ApiResponse<Client>> {
    return this.handleResponse<Client>(apiClient.get(`/${this.endpoint}/${id}`));
  }

  async create(client: Client): Promise<ApiResponse<Client>> {
    const validationError = this.validateClient(client);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Client>(apiClient.post(`/${this.endpoint}`, client));
  }

  async update(id: number, client: Client): Promise<ApiResponse<Client>> {
    const validationError = this.validateClient(client);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Client>(apiClient.put(`/${this.endpoint}/${id}`, client));
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
  }
}

export default new ClientService();
