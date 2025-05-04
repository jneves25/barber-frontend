import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface User {
	id: number;
	name: string;
	email: string;
	avatar?: string;
}

export interface CompanyMember {
	id?: number;
	companyId: number;
	userId: number;
	user: User;
}

export interface Company {
	id?: number;
	slug?: string;
	name: string;
	ownerId: number;
	address: string;
	logo?: string;
	backgroundImage?: string;
	phone?: string;
	whatsapp?: string;
	email?: string;
	owner?: User;
	members?: CompanyMember[];
	settings?: CompanySettings;
}

export interface CompanySettings {
	id?: number;
	companyId?: number;
	appointmentIntervalMinutes: number;
	advanceNoticeDays: number;
	preparationTimeMinutes: number;
	sendReminderWhatsApp: boolean;
	confirmAppointmentWhatsApp: boolean;
	notifyBarberNewAppointments: boolean;
	acceptedPaymentMethods: string;
	commissionPercentage: number;
	commissionPaymentFrequency: string;
	allowEarlyPaymentOnline: boolean;
	requireDepositConfirmation: boolean;
	applyDiscountForCashPayment: boolean;
	workingHoursId: number;
}

export interface WorkingHours {
	id?: number;
	mondayOpen: string;
	mondayClose: string;
	tuesdayOpen: string;
	tuesdayClose: string;
	wednesdayOpen: string;
	wednesdayClose: string;
	thursdayOpen: string;
	thursdayClose: string;
	fridayOpen: string;
	fridayClose: string;
	saturdayOpen: string;
	saturdayClose: string;
	sundayOpen: string;
	sundayClose: string;
}

export class CompanyService extends BaseService {
	constructor() {
		super('company');
	}

	validateCompany(company: Company): string | null {
		const requiredError = this.validateRequired(company, ['name', 'ownerId', 'address']);
		if (requiredError) return requiredError;

		if (company.email) {
			const emailError = this.validateEmail(company.email);
			if (emailError) return emailError;
		}

		return null;
	}

	validateSettings(settings: CompanySettings): string | null {
		return this.validateRequired(settings, [
			'appointmentIntervalMinutes',
			'commissionPercentage',
			'workingHoursId'
		]);
	}

	validateWorkingHours(hours: WorkingHours): string | null {
		// Validate time format (HH:MM)
		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		const timeFields = [
			'mondayOpen', 'mondayClose',
			'tuesdayOpen', 'tuesdayClose',
			'wednesdayOpen', 'wednesdayClose',
			'thursdayOpen', 'thursdayClose',
			'fridayOpen', 'fridayClose',
			'saturdayOpen', 'saturdayClose',
			'sundayOpen', 'sundayClose'
		] as (keyof WorkingHours)[];

		for (const field of timeFields) {
			// Fixed: Convert to string before testing with regex
			const value = hours[field];
			if (!timeRegex.test(String(value))) {
				return `Invalid time format for ${String(field)}. Use HH:MM format`;
			}
		}

		return null;
	}

	// Companies CRUD operations
	async create(company: Company): Promise<ApiResponse<Company>> {
		const validationError = this.validateCompany(company);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Company>(apiClient.post(`/${this.endpoint}`, company));
	}

	async update(id: number, company: Company): Promise<ApiResponse<Company>> {
		const validationError = this.validateCompany(company);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<Company>(apiClient.put(`/${this.endpoint}/${id}`, company));
	}

	async delete(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(apiClient.delete(`/${this.endpoint}/${id}`));
	}

	// Get companies by user info
	async getCompaniesByUserInfo(): Promise<ApiResponse<Company[]>> {
		return this.handleResponse<Company[]>(apiClient.get(`/${this.endpoint}/user`));
	}

	// Get company by ID
	async getById(id: number): Promise<ApiResponse<Company>> {
		return this.handleResponse<Company>(apiClient.get(`/${this.endpoint}/${id}`));
	}

	// Get company by slug (public)
	async getCompanyBySlug(slug: string): Promise<ApiResponse<Company>> {
		return this.handleResponse<Company>(apiClient.get(`/${this.endpoint}/slug/${slug}`));
	}

	// Company Settings
	async getSettings(companyId: number): Promise<ApiResponse<CompanySettings>> {
		return this.handleResponse<CompanySettings>(apiClient.get(`/${this.endpoint}/${companyId}/settings`));
	}

	async updateSettings(companyId: number, settings: CompanySettings): Promise<ApiResponse<CompanySettings>> {
		const validationError = this.validateSettings(settings);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<CompanySettings>(
			apiClient.put(`/${this.endpoint}/${companyId}/settings`, settings)
		);
	}

	// Working Hours
	async getWorkingHours(companyId: number): Promise<ApiResponse<WorkingHours>> {
		return this.handleResponse<WorkingHours>(apiClient.get(`/${this.endpoint}/${companyId}/working-hours`));
	}

	async updateWorkingHours(companyId: number, hours: WorkingHours): Promise<ApiResponse<WorkingHours>> {
		const validationError = this.validateWorkingHours(hours);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<WorkingHours>(
			apiClient.put(`/${this.endpoint}/${companyId}/working-hours`, hours)
		);
	}

	// Company Members
	async getMembers(companyId: number): Promise<ApiResponse<CompanyMember[]>> {
		return this.handleResponse<CompanyMember[]>(apiClient.get(`/${this.endpoint}/${companyId}/members`));
	}

	async addMember(companyId: number, userId: number): Promise<ApiResponse<CompanyMember>> {
		return this.handleResponse<CompanyMember>(
			apiClient.post(`/${this.endpoint}/${companyId}/members`, { userId })
		);
	}

	async removeMember(companyId: number, userId: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(
			apiClient.delete(`/${this.endpoint}/${companyId}/members/${userId}`)
		);
	}
}

export default new CompanyService();
