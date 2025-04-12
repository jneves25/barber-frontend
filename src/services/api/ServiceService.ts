import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Service {
	id: number;
	name: string;
	description?: string;
	price: number;
	duration: number;
	companyId: number;
	active: boolean;
}

export interface CreateService {
	name: string;
	description?: string;
	price: number;
	duration: number;
	companyId: number;
	active?: boolean;
}

export class ServiceService extends BaseService {
	constructor() {
		super('service');
	}

	validateService(service: CreateService): string | null {
		const requiredError = this.validateRequired(service, ['name', 'price', 'duration', 'companyId']);
		if (requiredError) return requiredError;

		if (service.price < 0) {
			return 'Price must be greater than or equal to 0';
		}

		if (service.duration <= 0) {
			return 'Duration must be greater than 0';
		}

		return null;
	}

	async getAll(companyId: number): Promise<ApiResponse<Service[]>> {
		return this.handleResponse<Service[]>(
			apiClient.get(`/${this.endpoint}`, { params: { companyId } })
		);
	}

	async getById(id: number): Promise<ApiResponse<Service>> {
		return this.handleResponse<Service>(
			apiClient.get(`/${this.endpoint}/${id}`)
		);
	}

	async create(service: CreateService): Promise<ApiResponse<Service>> {
		const validationError = this.validateService(service);
		if (validationError) {
			return {
				error: validationError,
				status: 400,
				success: false
			};
		}

		return this.handleResponse<Service>(
			apiClient.post(`/${this.endpoint}`, service)
		);
	}

	async update(id: number, service: Partial<Service>): Promise<ApiResponse<Service>> {
		return this.handleResponse<Service>(
			apiClient.put(`/${this.endpoint}/${id}`, service)
		);
	}

	async delete(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(
			apiClient.delete(`/${this.endpoint}/${id}`)
		);
	}

	async toggleActive(id: number): Promise<ApiResponse<Service>> {
		return this.handleResponse<Service>(
			apiClient.patch(`/${this.endpoint}/${id}/toggle-active`)
		);
	}
}

export default new ServiceService(); 