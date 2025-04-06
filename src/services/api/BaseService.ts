
import apiClient from './apiClient';
import { AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export class BaseService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // Helper method to handle API responses
  protected async handleResponse<T>(promise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await promise;
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        error: axiosError.response?.data as string || axiosError.message,
        status: axiosError.response?.status || 500,
        success: false
      };
    }
  }

  // Generic validation method to check if an object has required fields
  protected validateRequired<T>(data: T, requiredFields: (keyof T)[]): string | null {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return `Field ${String(field)} is required`;
      }
    }
    return null;
  }
  
  // Generic validation method for email format
  protected validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Invalid email format';
  }
}
