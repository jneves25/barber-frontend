
import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';
import { User } from './UserService';
import { Client } from './ClientService';

export interface LoginRequest {
  email: string;
  password: string;
  type: 'user' | 'client';
}

export interface AuthResponse {
  token: string;
  user?: User;
  client?: Client;
}

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterClientRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
}

export class AuthService extends BaseService {
  constructor() {
    super('auth');
  }

  validateLogin(loginRequest: LoginRequest): string | null {
    const requiredError = this.validateRequired(loginRequest, ['email', 'password', 'type']);
    if (requiredError) return requiredError;
    
    const emailError = this.validateEmail(loginRequest.email);
    if (emailError) return emailError;
    
    if (!['user', 'client'].includes(loginRequest.type)) {
      return 'Invalid login type';
    }
    
    return null;
  }

  validateRegisterUser(registerRequest: RegisterUserRequest): string | null {
    const requiredError = this.validateRequired(registerRequest, ['email', 'name', 'password']);
    if (requiredError) return requiredError;
    
    const emailError = this.validateEmail(registerRequest.email);
    if (emailError) return emailError;
    
    if (registerRequest.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    return null;
  }

  validateRegisterClient(registerRequest: RegisterClientRequest): string | null {
    const requiredError = this.validateRequired(registerRequest, ['email', 'name', 'password', 'phone']);
    if (requiredError) return requiredError;
    
    const emailError = this.validateEmail(registerRequest.email);
    if (emailError) return emailError;
    
    if (registerRequest.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    // Simple phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(registerRequest.phone.replace(/\D/g, ''))) {
      return 'Invalid phone format';
    }
    
    return null;
  }

  async login(loginRequest: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateLogin(loginRequest);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/${this.endpoint}/login`, loginRequest)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  }

  async registerUser(registerRequest: RegisterUserRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateRegisterUser(registerRequest);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/${this.endpoint}/register`, registerRequest)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  }

  async registerClient(registerRequest: RegisterClientRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateRegisterClient(registerRequest);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/client/auth/register`, registerRequest)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  }
  
  async loginClient(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    if (!credentials.email || !credentials.password) {
      return { error: 'Email and password are required', status: 400, success: false };
    }
    
    const emailError = this.validateEmail(credentials.email);
    if (emailError) return { error: emailError, status: 400, success: false };
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/client/auth/login`, credentials)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', 'client');
    }
    
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
  }

  async getCurrentUser(): Promise<ApiResponse<User | Client>> {
    return this.handleResponse<User | Client>(apiClient.get(`/${this.endpoint}/me`));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
  
  getUserType(): 'user' | 'client' | null {
    const userType = localStorage.getItem('user_type');
    if (userType === 'user' || userType === 'client') {
      return userType;
    }
    return null;
  }
}

export default new AuthService();
