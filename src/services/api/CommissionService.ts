import { BaseService, ApiResponse } from './BaseService';
import { User } from './UserService';
import apiClient from './apiClient';

export enum CommissionTypeEnum {
	GENERAL = 'GENERAL',
	SERVICE = 'SERVICE'
}

export enum CommissionModeEnum {
	FIXED = 'FIXED',
	PERCENTAGE = 'PERCENTAGE'
}

export interface CommissionRule {
	id: number;
	configId: number;
	serviceType: string;
	percentage: number;
}

export interface CommissionConfig {
	id: number;
	userId: number;
	companyId: number;
	commissionType: CommissionTypeEnum;
	commissionMode: CommissionModeEnum;
	commissionValue: number;
	createdAt: string;
	updatedAt: string;
	rules: CommissionRule[];
	user: User;
	company: {
		id: number;
		name: string;
		ownerId: number;
		settingsId: number;
		address: string;
		logo: string;
		backgroundImage: string;
		phone: string;
		whatsapp: string;
		email: string;
	};
}

export interface CreateCommissionConfig {
	userId: number;
	companyId: number;
	commissionType: CommissionTypeEnum;
	commissionMode: CommissionModeEnum;
	commissionValue?: number;
}

export interface CreateCommissionRule {
	configId: number;
	serviceType: string;
	percentage: number;
}

export class CommissionService extends BaseService {
	constructor() {
		super('commission');
	}

	// Validate commission config
	validateCommissionConfig(config: CreateCommissionConfig): string | null {
		const requiredError = this.validateRequired(config, ['userId', 'companyId', 'commissionType', 'commissionMode']);
		if (requiredError) return requiredError;

		return null;
	}

	// Validate commission rule
	validateCommissionRule(rule: CreateCommissionRule): string | null {
		const requiredError = this.validateRequired(rule, ['configId', 'serviceType', 'percentage']);
		if (requiredError) return requiredError;

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
			apiClient.get(`/commission`, { params: { companyId } })
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