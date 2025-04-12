import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Goal {
	id?: number;
	userId: number;
	companyId: number;
	month: number;
	year: number;
	target: number;
	user?: any;
	company?: any;
}

export class GoalService extends BaseService {
	constructor() {
		super('goal');
	}

	async create(goal: Goal): Promise<ApiResponse<Goal>> {
		return this.handleResponse<Goal>(apiClient.post(`/${this.endpoint}`, goal));
	}

	async update(id: number, goal: Partial<Goal>): Promise<ApiResponse<Goal>> {
		return this.handleResponse<Goal>(apiClient.put(`/${this.endpoint}/${id}`, goal));
	}

	async delete(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
	}

	async getAllByCompany(companyId: number): Promise<ApiResponse<Goal[]>> {
		return this.handleResponse<Goal[]>(apiClient.get(`/${this.endpoint}?companyId=${companyId}`));
	}

	async getUserGoals(): Promise<ApiResponse<Goal[]>> {
		return this.handleResponse<Goal[]>(apiClient.get(`/${this.endpoint}/user`));
	}

	async getById(id: number): Promise<ApiResponse<Goal>> {
		return this.handleResponse<Goal>(apiClient.get(`/${this.endpoint}/${id}`));
	}
}

export default new GoalService(); 