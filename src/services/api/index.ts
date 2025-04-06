
import apiClient from './apiClient';
import UserService from './UserService';
import CompanyService from './CompanyService';
import AppointmentService from './AppointmentService';
import ClientService from './ClientService';
import ServiceProductService from './ServiceProductService';
import AuthService from './AuthService';
import { BaseService, ApiResponse } from './BaseService';

export {
  apiClient,
  UserService,
  CompanyService,
  AppointmentService,
  ClientService,
  ServiceProductService,
  AuthService,
  BaseService,
  ApiResponse
};

// Re-export types
export * from './UserService';
export * from './CompanyService';
export * from './AppointmentService';
export * from './ClientService';
export * from './ServiceProductService';
export * from './AuthService';
