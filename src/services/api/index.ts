// Re-export all service types and instances
import AuthService, { AuthResponse, LoginRequest, RegisterUserRequest, RegisterClientRequest } from './AuthService';
import UserService, { User, RoleEnum, UserPermissions } from './UserService';
import ClientService, { Client } from './ClientService';
import CompanyService, { Company, CompanySettings, WorkingHours, CompanyMember } from './CompanyService';
import ServiceProductService, { Service, Product } from './ServiceProductService';
import AppointmentService, { Appointment, ServiceAppointment, ProductAppointment, AppointmentStatusEnum } from './AppointmentService';
import ServiceService from './ServiceService';
import ProductService from './ProductService';

// Fix re-export type issue by using 'export type'
export { AuthService, UserService, ClientService, CompanyService, ServiceProductService, AppointmentService, ServiceService, ProductService };
export type {
	AuthResponse,
	LoginRequest,
	RegisterUserRequest,
	RegisterClientRequest,
	User,
	RoleEnum,
	UserPermissions,
	Client,
	Company,
	CompanySettings,
	WorkingHours,
	CompanyMember,
	Service,
	Product,
	Appointment,
	ServiceAppointment,
	ProductAppointment,
	AppointmentStatusEnum
};
