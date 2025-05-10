import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface Goal {
	id?: number;
	userId: number;
	companyId: number;
	month: number;
	year: number;
	target: number;
	user?: {
		id: number;
		name: string;
	};
	company?: {
		id: number;
		name: string;
	};
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

	async getAllByCompany(companyId: number, month: number, year: number): Promise<ApiResponse<Goal[]>> {
		return this.handleResponse<Goal[]>(apiClient.get(`/${this.endpoint}`, {
			params: { companyId, month, year }
		}));
	}

	async getUserGoals(month: number, year: number): Promise<ApiResponse<Goal[]>> {
		return this.handleResponse<Goal[]>(apiClient.get(`/${this.endpoint}/user`, {
			params: { month, year }
		}));
	}

	async getById(id: number): Promise<ApiResponse<Goal>> {
		return this.handleResponse<Goal>(apiClient.get(`/${this.endpoint}/${id}`));
	}

	// Get the current progress for a specific goal
	async getGoalProgress(goalId: number): Promise<ApiResponse<number>> {
		return this.handleResponse<number>(apiClient.get(`/${this.endpoint}/${goalId}/progress`));
	}

	// Get progress for multiple goals at once
	async getGoalsProgress(goalIds: number[], startDate?: string, endDate?: string): Promise<ApiResponse<Record<number, number>>> {
		return this.handleResponse<Record<number, number>>(
			apiClient.post(`/${this.endpoint}/progress`, {
				goalIds,
				startDate,
				endDate
			})
		);
	}
}

export default new GoalService(); 
