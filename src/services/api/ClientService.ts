import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';
import { validatePhoneNumber, cleanPhoneNumber } from '@/utils/phone';

export interface Client {
	id?: number;
	name: string;
	email: string;
	phone: string;
	password?: string;
	createdAt?: string;
}

export interface ClientLoginRequest {
	email: string;
	password: string;
}

export interface ClientRegisterRequest {
	name: string;
	email: string;
	phone: string;
	password?: string;
}

export class ClientService extends BaseService {
	constructor() {
		super('client');
	}

	validateClient(client: Client): string | null {
		const requiredError = this.validateRequired(client, ['name', 'email', 'phone']);
		if (requiredError) return requiredError;

		const emailError = this.validateEmail(client.email);
		if (emailError) return emailError;

		if (client.password && client.password.length < 8) {
			return 'A senha deve ter pelo menos 8 caracteres';
		}

		// Validação de telefone melhorada
		const phoneError = validatePhoneNumber(client.phone);
		if (phoneError) return phoneError;

		return null;
	}

	// Client personal information (client-side endpoints)
	async getPersonalInfo(): Promise<ApiResponse<Client>> {
		return this.handleResponse<Client>(apiClient.get(`/${this.endpoint}/personal`));
	}

	async updatePersonalInfo(id: number, client: Client): Promise<ApiResponse<Client>> {
		const validationError = this.validateClient(client);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		// Limpa o telefone antes de enviar para o servidor
		const cleanedClient = {
			...client,
			phone: cleanPhoneNumber(client.phone)
		};

		return this.handleResponse<Client>(apiClient.put(`/${this.endpoint}/personal/${id}`, cleanedClient));
	}

	async deletePersonalAccount(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/personal/${id}`));
	}

	// Admin-side endpoints (require admin authentication)
	async getAll(companyId: number): Promise<ApiResponse<Client[]>> {
		return this.handleResponse<Client[]>(apiClient.get(`/${this.endpoint}`, { params: { companyId } }));
	}

	async getById(id: number): Promise<ApiResponse<Client>> {
		return this.handleResponse<Client>(apiClient.get(`/${this.endpoint}/${id}`));
	}

	async getByBarber(): Promise<ApiResponse<Client[]>> {
		return this.handleResponse<Client[]>(apiClient.get(`/${this.endpoint}/barber`));
	}

	// Client management methods
	async updateClient(id: number, client: Client): Promise<ApiResponse<Client>> {
		const validationError = this.validateClient(client);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		// Limpa o telefone antes de enviar para o servidor
		const cleanedClient = {
			...client,
			phone: cleanPhoneNumber(client.phone)
		};

		return this.handleResponse<Client>(apiClient.put(`/${this.endpoint}/${id}`, cleanedClient));
	}

	async createClient(client: Client, companyId: Number): Promise<ApiResponse<Client>> {
		const validationError = this.validateClient(client);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		// Limpa o telefone antes de enviar para o servidor
		const cleanedClient = {
			...client,
			phone: cleanPhoneNumber(client.phone)
		};

		return this.handleResponse<Client>(apiClient.post(`/${this.endpoint}`, cleanedClient, { params: { companyId } }));
	}

	async deleteClient(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
	}
}

export default new ClientService();
