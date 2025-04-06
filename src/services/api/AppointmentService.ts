
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

  async getByCompany(companyId: number): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/${this.endpoint}/company/${companyId}`));
  }

  async getByBarber(userId: number): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/${this.endpoint}/barber/${userId}`));
  }

  async getByClient(clientId: number): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/${this.endpoint}/client/${clientId}`));
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

  async updateStatus(id: number, status: AppointmentStatusEnum): Promise<ApiResponse<Appointment>> {
    if (!Object.values(AppointmentStatusEnum).includes(status)) {
      return { error: 'Invalid appointment status', status: 400, success: false };
    }
    
    return this.handleResponse<Appointment>(apiClient.patch(`/${this.endpoint}/${id}/status`, { status }));
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
  }

  // Add service to appointment
  async addService(appointmentId: number, serviceAppointment: ServiceAppointment): Promise<ApiResponse<ServiceAppointment>> {
    const validationError = this.validateServiceAppointment(serviceAppointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<ServiceAppointment>(
      apiClient.post(`/${this.endpoint}/${appointmentId}/services`, serviceAppointment)
    );
  }

  // Remove service from appointment
  async removeService(appointmentId: number, serviceId: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(
      apiClient.delete(`/${this.endpoint}/${appointmentId}/services/${serviceId}`)
    );
  }

  // Add product to appointment
  async addProduct(appointmentId: number, productAppointment: ProductAppointment): Promise<ApiResponse<ProductAppointment>> {
    const validationError = this.validateProductAppointment(productAppointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<ProductAppointment>(
      apiClient.post(`/${this.endpoint}/${appointmentId}/products`, productAppointment)
    );
  }

  // Remove product from appointment
  async removeProduct(appointmentId: number, productId: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(
      apiClient.delete(`/${this.endpoint}/${appointmentId}/products/${productId}`)
    );
  }
  
  // Client side appointments
  async getClientAppointments(): Promise<ApiResponse<Appointment[]>> {
    return this.handleResponse<Appointment[]>(apiClient.get(`/client/appointment`));
  }
  
  async createClientAppointment(appointment: Appointment): Promise<ApiResponse<Appointment>> {
    const validationError = this.validateAppointment(appointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Appointment>(apiClient.post(`/client/appointment`, appointment));
  }
  
  async updateClientAppointment(id: number, appointment: Appointment): Promise<ApiResponse<Appointment>> {
    const validationError = this.validateAppointment(appointment);
    if (validationError) {
      return { error: validationError, status: 400, success: false };
    }
    
    return this.handleResponse<Appointment>(apiClient.put(`/client/appointment/${id}`, appointment));
  }
  
  async cancelClientAppointment(id: number): Promise<ApiResponse<void>> {
    return this.handleResponse<void>(apiClient.delete(`/client/appointment/${id}`));
  }
}

export default new AppointmentService();
