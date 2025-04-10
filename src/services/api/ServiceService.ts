import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Service {
	id?: number;
	name: string;
	price: number;
	duration: number;
	description: string;
	companyId: number;
}

export class ServiceService extends BaseService {
	constructor() {
		super(''); // Base endpoint will be set in specific methods
	}

	validateService(service: Service): string | null {
		const requiredError = this.validateRequired(service, [
			'name', 'price', 'duration', 'description', 'companyId'
		]);
		if (requiredError) return requiredError;

		if (service.price < 0) {
			return 'Price must be positive';
		}

		if (service.duration <= 0) {
			return 'Duration must be positive';
		}

		return null;
	}

	async getAllServices(companyId: number): Promise<ApiResponse<Service[]>> {
		const params = {
			companyId
		}
		return this.handleResponse<Service[]>(apiClient.get('/service', { params }));
	}

	async getServiceById(id: number): Promise<ApiResponse<Service>> {
		return this.handleResponse<Service>(apiClient.get(`/service/${id}`));
	}

	async createService(service: Service): Promise<ApiResponse<Service>> {
		const validationError = this.validateService(service);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Service>(apiClient.post('/service', service));
	}

	async updateService(id: number, service: Service): Promise<ApiResponse<Service>> {
		const validationError = this.validateService(service);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Service>(apiClient.put(`/service/${id}`, service));
	}

	async deleteService(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/service/${id}`));
	}
}

export default new ServiceService(); 