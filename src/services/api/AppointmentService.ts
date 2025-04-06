
import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export enum AppointmentStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export interface ServiceAppointment {
  id?: number;
  appointmentId?: number;
  serviceId: number;
  quantity: number;
}

export interface ProductAppointment {
  id?: number;
  appointmentId?: number;
  productId: number;
  quantity: number;
}

export interface Appointment {
  id?: number;
  clientId: number;
  userId: number;
  companyId: number;
  services: ServiceAppointment[];
  products: ProductAppointment[];
  value: number;
  status: AppointmentStatusEnum;
  createdAt?: string;
  completedAt?: string;
}

export class AppointmentService extends BaseService {
  constructor() {
    super('appointment');
  }

  validateAppointment(appointment: Appointment): string | null {
    const requiredError = this.validateRequired(appointment, [
      'clientId', 'userId', 'companyId', 'value', 'status'
    ]);
    
    if (requiredError) return requiredError;
    
    if (appointment.value < 0) {
      return 'Value must be positive';
    }
    
    if (!Object.values(AppointmentStatusEnum).includes(appointment.status)) {
      return 'Invalid appointment status';
    }
    
    return null;
  }

  validateServiceAppointment(serviceAppointment: ServiceAppointment): string | null {
    const requiredError = this.validateRequired(serviceAppointment, ['serviceId', 'quantity']);
    if (requiredError) return requiredError;
    
    if (serviceAppointment.quantity <= 0) {
      return 'Quantity must be positive';
    }
    
    return null;
  }

  validateProductAppointment(productAppointment: ProductAppointment): string | null {
    const requiredError = this.validateRequired(productAppointment, ['productId', 'quantity']);
    if (requiredError) return requiredError;
    
    if (productAppointment.quantity <= 0) {
      return 'Quantity must be positive';
    }
    
    return null;
  }

  // Admin side appointments
  async getAll(): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/${this.endpoint}`));
  }

  async getById(id: number): Promise<ApiResponse<Appointment>> {
    return this.handleResponse<Appointment>(apiClient.get(`/${this.endpoint}/${id}`));
  }

  async create(appointment: Appointment): Promise<ApiResponse<Appointment>> {
    const validationError = this.validateAppointment(appointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    // Validate services
    for (const service of appointment.services) {
      const serviceError = this.validateServiceAppointment(service);
      if (serviceError) {
        return { error: serviceError, status: 400, success: false };
      }
    }
    
    // Validate products
    for (const product of appointment.products) {
      const productError = this.validateProductAppointment(product);
      if (productError) {
        return { error: productError, status: 400, success: false };
      }
    }
    
    return this.handleResponse<Appointment>(apiClient.post(`/${this.endpoint}`, appointment));
  }

  async update(id: number, appointment: Appointment): Promise<ApiResponse<Appointment>> {
    const validationError = this.validateAppointment(appointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Appointment>(apiClient.put(`/${this.endpoint}/${id}`, appointment));
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
  }
  
  // Client side appointments
  async getClientAppointments(): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/client/appointment`));
  }
  
  async getClientAppointmentById(id: number): Promise<ApiResponse<Appointment>> {
    return this.handleResponse<Appointment>(apiClient.get(`/client/appointment/${id}`));
  }
  
  async createClientAppointment(appointment: Appointment): Promise<ApiResponse<Appointment>> {
    const validationError = this.validateAppointment(appointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Appointment>(apiClient.post(`/client/appointment`, appointment));
  }
  
  async cancelClientAppointment(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/client/appointment/${id}`));
  }
}

export default new AppointmentService();
