
import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';
import { User } from './UserService';
import { Client } from './ClientService';

export interface LoginRequest {
  email: string;
  password: string;
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
    const requiredError = this.validateRequired(loginRequest, ['email', 'password']);
    if (requiredError) return requiredError;
    
    const emailError = this.validateEmail(loginRequest.email);
    if (emailError) return emailError;
    
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

  // User authentication (admin side)
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateLogin(credentials);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/${this.endpoint}/login`, credentials)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', 'user');
    }
    
    return response;
  }

  async register(registerRequest: RegisterUserRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateRegisterUser(registerRequest);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/${this.endpoint}/register`, registerRequest)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', 'user');
    }
    
    return response;
  }

  // Client authentication
  async loginClient(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const validationError = this.validateLogin(credentials);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    const response = await this.handleResponse<AuthResponse>(
      apiClient.post(`/client/auth/login`, credentials)
    );
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', 'client');
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
      localStorage.setItem('user_type', 'client');
    }
    
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.handleResponse<User>(apiClient.get(`/user/me`));
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
