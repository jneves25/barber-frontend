import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

export interface WorkingHours {
	id: number;
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
	update?: {
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
	};
}

export interface CompanySettings {
	id: number;
	companyId: number;
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
	workingHours: {
		update: WorkingHours;
	};
}

// Matching the backend CreateCompanySettings interface
export interface CreateCompanySettings {
	companyId: number;
	appointmentIntervalMinutes?: number;
	advanceNoticeDays?: number;
	preparationTimeMinutes?: number;
	sendReminderWhatsApp?: boolean;
	confirmAppointmentWhatsApp?: boolean;
	notifyBarberNewAppointments?: boolean;
	acceptedPaymentMethods?: string;
	commissionPercentage?: number;
	commissionPaymentFrequency?: string;
	allowEarlyPaymentOnline?: boolean;
	requireDepositConfirmation?: boolean;
	applyDiscountForCashPayment?: boolean;
	workingHoursId: number;
}

export class CompanySettingsService extends BaseService {
	constructor() {
		super('company-settings');
	}

	validateSettings(settings: Partial<CreateCompanySettings>, isUpdate: boolean = false): string | null {
		if (!isUpdate) {
			const requiredFields = ['companyId', 'workingHoursId'];
			for (const field of requiredFields) {
				if (!(field in settings)) {
					return `Campo ${field} é obrigatório`;
				}
			}
		}

		if (settings.appointmentIntervalMinutes && settings.appointmentIntervalMinutes <= 0) {
			return 'O intervalo entre agendamentos deve ser positivo';
		}

		if (settings.advanceNoticeDays && settings.advanceNoticeDays < 0) {
			return 'O aviso prévio não pode ser negativo';
		}

		if (settings.preparationTimeMinutes && settings.preparationTimeMinutes < 0) {
			return 'O tempo de preparação não pode ser negativo';
		}

		if (settings.commissionPercentage && (settings.commissionPercentage < 0 || settings.commissionPercentage > 100)) {
			return 'A porcentagem de comissão deve estar entre 0 e 100';
		}

		return null;
	}

	validateWorkingHours(workingHours: WorkingHours): string | null {
		const requiredFields = [
			'mondayOpen', 'mondayClose',
			'tuesdayOpen', 'tuesdayClose',
			'wednesdayOpen', 'wednesdayClose',
			'thursdayOpen', 'thursdayClose',
			'fridayOpen', 'fridayClose',
			'saturdayOpen', 'saturdayClose',
			'sundayOpen', 'sundayClose'
		];

		for (const field of requiredFields) {
			if (!(field in workingHours)) {
				return `Campo ${field} é obrigatório`;
			}
		}

		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

		for (const day of days) {
			const open = workingHours[`${day}Open` as keyof WorkingHours];
			const close = workingHours[`${day}Close` as keyof WorkingHours];

			if (!timeRegex.test(open as string) || !timeRegex.test(close as string)) {
				return `Formato de horário inválido para ${day}`;
			}
		}

		return null;
	}

	async createSettings(data: CreateCompanySettings): Promise<ApiResponse<CompanySettings>> {
		const validationError = this.validateSettings(data);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<CompanySettings>(
			apiClient.post(`/${this.endpoint}`, data)
		);
	}

	async getSettingsByCompanyId(companyId: number): Promise<ApiResponse<CompanySettings>> {
		return this.handleResponse<CompanySettings>(
			apiClient.get(`/${this.endpoint}/company/${companyId}`)
		);
	}

	async updateSettings(id: number, data: Partial<CreateCompanySettings>): Promise<ApiResponse<CompanySettings>> {
		const validationError = this.validateSettings(data, true);
		if (validationError) {
			return { error: validationError, status: 400, success: false };
		}

		return this.handleResponse<CompanySettings>(
			apiClient.put(`/${this.endpoint}/${id}`, data)
		);
	}

	async deleteSettings(id: number): Promise<ApiResponse<void>> {
		return this.handleResponse<void>(
			apiClient.delete(`/${this.endpoint}/${id}`)
		);
	}
}

export default new CompanySettingsService(); 