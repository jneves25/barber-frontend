import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface CommissionRule {
	id: number;
	configId: number;
	minValue: number;
	maxValue: number;
	percentage: number;
}

export interface CommissionConfig {
	id: number;
	userId: number;
	companyId: number;
	name: string;
	description?: string;
	rules?: CommissionRule[];
}

export interface CreateCommissionConfig {
	userId: number;
	companyId: number;
	name: string;
	description?: string;
}

export interface CreateCommissionRule {
	configId: number;
	minValue: number;
	maxValue: number;
	percentage: number;
}

export class CommissionService extends BaseService {
	constructor() {
		super('commission');
	}

	// Validate commission config
	validateCommissionConfig(config: CreateCommissionConfig): string | null {
		const requiredError = this.validateRequired(config, ['userId', 'companyId', 'name']);
		if (requiredError) return requiredError;

		return null;
	}

	// Validate commission rule
	validateCommissionRule(rule: CreateCommissionRule): string | null {
		const requiredError = this.validateRequired(rule, ['configId', 'minValue', 'maxValue', 'percentage']);
		if (requiredError) return requiredError;

		if (rule.minValue > rule.maxValue) {
			return 'Minimum value cannot be greater than maximum value';
		}

		if (rule.percentage < 0 || rule.percentage > 100) {
			return 'Percentage must be between 0 and 100';
		}

		return null;
	}

	// Commission Config Methods
	async createCommissionConfig(config: CreateCommissionConfig): Promise<ApiResponse<CommissionConfig>> {
		const validationError = this.validateCommissionConfig(config);
		if (validationError) {
			return {
				error: validationError,
				status: 400,
				success: false
			};
		}

		return this.handleResponse<CommissionConfig>(
			apiClient.post('/commission', config)
		);
	}

	async getCommissionConfigsByCompany(companyId: number): Promise<ApiResponse<CommissionConfig[]>> {
		return this.handleResponse<CommissionConfig[]>(
			apiClient.get(`/commission/company/${companyId}`)
		);
	}

	async getCommissionConfigByUserId(userId: number): Promise<ApiResponse<CommissionConfig>> {
		return this.handleResponse<CommissionConfig>(
			apiClient.get(`/commission/user/${userId}`)
		);
	}

	async updateCommissionConfig(id: number, config: Partial<CommissionConfig>): Promise<ApiResponse<CommissionConfig>> {
		return this.handleResponse<CommissionConfig>(
			apiClient.put(`/commission/${id}`, config)
		);
	}

	async deleteCommissionConfig(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(
			apiClient.delete(`/commission/${id}`)
		);
	}

	// Commission Rule Methods
	async createCommissionRule(rule: CreateCommissionRule): Promise<ApiResponse<CommissionRule>> {
		const validationError = this.validateCommissionRule(rule);
		if (validationError) {
			return {
				error: validationError,
				status: 400,
				success: false
			};
		}

		return this.handleResponse<CommissionRule>(
			apiClient.post('/rule', rule)
		);
	}

	async getCommissionRulesByConfig(configId: number): Promise<ApiResponse<CommissionRule[]>> {
		return this.handleResponse<CommissionRule[]>(
			apiClient.get(`/config/${configId}/rules`)
		);
	}

	async updateCommissionRule(id: number, rule: Partial<CommissionRule>): Promise<ApiResponse<CommissionRule>> {
		return this.handleResponse<CommissionRule>(
			apiClient.put(`/rule/${id}`, rule)
		);
	}

	async deleteCommissionRule(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(
			apiClient.delete(`/rule/${id}`)
		);
	}
}

export default new CommissionService(); 