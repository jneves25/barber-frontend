import { BaseService, ApiResponse } from './BaseService';
import { Company } from './CompanyService';
import apiClient from './apiClient';

export enum RoleEnum {
	ADMIN = 'ADMIN',
	USER = 'USER',
	MANAGER = 'MANAGER'
}

export interface User {
	id?: number;
	email: string;
	name: string;
	password: string;
	companies?: Company[];
	role: RoleEnum;
	avatar?: string;
	permissions?: {
		manageCompany: boolean;
		viewCompanys: boolean;
		addMember: boolean;
		managePermissions: boolean;
		viewPermissions: boolean;
		viewAllAppointments: boolean;
		manageAppointments: boolean;
		viewOwnAppointments: boolean;
		viewAllClients: boolean;
		manageClients: boolean;
		viewOwnClients: boolean;
		viewAllServices: boolean;
		manageServices: boolean;
		viewServices: boolean;
		viewAllProducts: boolean;
		manageProducts: boolean;
		viewProducts: boolean;
		viewAllBarbers: boolean;
		manageBarbers: boolean;
		viewAllCommissions: boolean;
		manageCommissions: boolean;
		viewOwnCommissions: boolean;
		viewAllGoals: boolean;
		manageGoals: boolean;
		viewOwnGoals: boolean;
		viewFullRevenue: boolean;
		viewOwnRevenue: boolean;
		manageSettings: boolean;
		viewUsers: boolean;
		manageUsers: boolean;
	};
}

export interface UserPermissions {
	userId: number;
	manageCompany: boolean;
	viewCompanys: boolean;
	addMember: boolean;
	managePermissions: boolean;
	viewPermissions: boolean;
	viewAllAppointments: boolean;
	manageAppointments: boolean;
	viewOwnAppointments: boolean;
	viewAllClients: boolean;
	manageClients: boolean;
	viewOwnClients: boolean;
	viewAllServices: boolean;
	manageServices: boolean;
	viewServices: boolean;
	viewAllProducts: boolean;
	manageProducts: boolean;
	viewProducts: boolean;
	viewAllBarbers: boolean;
	manageBarbers: boolean;
	viewAllCommissions: boolean;
	manageCommissions: boolean;
	viewOwnCommissions: boolean;
	viewAllGoals: boolean;
	manageGoals: boolean;
	viewOwnGoals: boolean;
	viewFullRevenue: boolean;
	viewOwnRevenue: boolean;
	manageSettings: boolean;
	viewUsers: boolean;
	manageUsers: boolean;
}

export class UserService extends BaseService {
	constructor() {
		super('user');
	}

	// Validate user data
	validateUser(user: User): string | null {
		const requiredError = this.validateRequired(user, ['email', 'name']);
		if (requiredError) return requiredError;

		const emailError = this.validateEmail(user.email);
		if (emailError) return emailError;

		if (user.password && user.password.length < 6) {
			return "A senha deve ter pelo menos 6 caracteres";
		}

		return null;
	}

	// Get all users
	async getAll(): Promise<ApiResponse<User[]>> {
		return this.handleResponse<User[]>(apiClient.get(`/${this.endpoint}`));
	}

	// Get user info (current user)
	async getUserInfo(): Promise<ApiResponse<User>> {
		return this.handleResponse<User>(apiClient.get(`/${this.endpoint}/userInfo`));
	}

	// Get user by ID
	async getById(id: number): Promise<ApiResponse<User>> {
		return this.handleResponse<User>(apiClient.get(`/${this.endpoint}/${id}`));
	}

	// Create new user
	async create(user: User): Promise<ApiResponse<User>> {
		const validationError = this.validateUser(user);
		if (validationError) {
			return {
				error: validationError,
				status: 400,
				success: false
			};
		}

		return this.handleResponse<User>(apiClient.post(`/${this.endpoint}`, user));
	}

	// Update user
	async update(id: number, user: User): Promise<ApiResponse<User>> {
		const validationError = this.validateUser(user);
		if (validationError) {
			return {
				error: validationError,
				status: 400,
				success: false
			};
		}

		return this.handleResponse<User>(apiClient.put(`/${this.endpoint}/${id}`, user));
	}

	// Delete user
	async delete(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
	}

	// Get user permissions
	async getPermissions(userId: number): Promise<ApiResponse<UserPermissions>> {
		return this.handleResponse<UserPermissions>(apiClient.get(`/permission/${userId}`));
	}

	// Update user permissions
	async updatePermissions(userId: number, permissions: UserPermissions): Promise<ApiResponse<UserPermissions>> {
		return this.handleResponse<UserPermissions>(
			apiClient.put(`/permission/${userId}`, permissions)
		);
	}

	// Get users by company
	async getUsersByCompany(companyId: number): Promise<ApiResponse<User[]>> {
		return this.handleResponse<User[]>(apiClient.get(`/${this.endpoint}/company`, { params: { companyId } }));
	}
}

export default new UserService();
