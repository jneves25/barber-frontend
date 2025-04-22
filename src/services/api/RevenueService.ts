import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';

// Interfaces para os tipos de dados
export interface RevenueData {
	name: string;
	total: number;
}

export interface BarberRevenueData {
	id: number;
	name: string;
	revenue: number;
	percentage: number;
	color?: string;
}

export interface ServiceRevenueData {
	id: number;
	service: string;
	quantity: number;
	revenue: number;
	percentage: number;
}

export interface PaymentMethodData {
	name: string;
	value: number;
	percentage: number;
	color: string;
}

export interface WeekdayRevenueData {
	name: string;
	total: number;
}

export interface HourlyRevenueData {
	hour: string;
	total: number;
}

export interface YearlyComparisonData {
	name: string;
	[year: string]: number | string;
}

export interface AvgTicketData {
	id: number;
	name: string;
	avgTicket: number;
	maxTicket: number;
	minTicket: number;
}

export interface BarberMonthlyData {
	name: string;
	[barberName: string]: number | string;
}

export class RevenueService extends BaseService {
	constructor() {
		super('revenue');
	}

	// Faturamento mensal para o ano
	async getMonthlyRevenue(companyId: number, year?: number, period?: string): Promise<ApiResponse<RevenueData[]>> {
		return this.handleResponse<RevenueData[]>(
			apiClient.get(`/${this.endpoint}/monthly`, {
				params: {
					companyId,
					year,
					period
				}
			})
		);
	}

	// Faturamento por barbeiro
	async getBarberRevenue(companyId: number, period?: string, year?: number, month?: number): Promise<ApiResponse<BarberRevenueData[]>> {
		return this.handleResponse<BarberRevenueData[]>(
			apiClient.get(`/${this.endpoint}/barber`, {
				params: {
					companyId,
					period,
					year,
					month
				}
			})
		);
	}

	// Faturamento mensal por barbeiro
	async getBarberMonthlyRevenue(companyId: number, year?: number): Promise<ApiResponse<BarberMonthlyData[]>> {
		return this.handleResponse<BarberMonthlyData[]>(
			apiClient.get(`/${this.endpoint}/barber/monthly`, {
				params: {
					companyId,
					year
				}
			})
		);
	}

	// Faturamento por serviço
	async getServiceRevenue(companyId: number, userId?: number, period?: string, year?: number, month?: number): Promise<ApiResponse<ServiceRevenueData[]>> {
		return this.handleResponse<ServiceRevenueData[]>(
			apiClient.get(`/${this.endpoint}/service`, {
				params: {
					companyId,
					userId,
					period,
					year,
					month
				}
			})
		);
	}

	// Faturamento por forma de pagamento
	async getPaymentMethodRevenue(companyId: number, period?: string, year?: number, month?: number): Promise<ApiResponse<PaymentMethodData[]>> {
		return this.handleResponse<PaymentMethodData[]>(
			apiClient.get(`/${this.endpoint}/payment`, {
				params: {
					companyId,
					period,
					year,
					month
				}
			})
		);
	}

	// Faturamento por dia da semana
	async getWeekdayRevenue(companyId: number, period?: string, year?: number, month?: number): Promise<ApiResponse<WeekdayRevenueData[]>> {
		return this.handleResponse<WeekdayRevenueData[]>(
			apiClient.get(`/${this.endpoint}/weekday`, {
				params: {
					companyId,
					period,
					year,
					month
				}
			})
		);
	}

	// Faturamento por horário
	async getHourlyRevenue(companyId: number, period?: string, year?: number, month?: number): Promise<ApiResponse<HourlyRevenueData[]>> {
		return this.handleResponse<HourlyRevenueData[]>(
			apiClient.get(`/${this.endpoint}/hourly`, {
				params: {
					companyId,
					period,
					year,
					month
				}
			})
		);
	}

	// Comparativo ano a ano
	async getYearlyComparison(companyId: number, year?: number): Promise<ApiResponse<YearlyComparisonData[]>> {
		return this.handleResponse<YearlyComparisonData[]>(
			apiClient.get(`/${this.endpoint}/yearly-comparison`, {
				params: {
					companyId,
					year
				}
			})
		);
	}

	// Ticket médio por barbeiro
	async getAvgTicketByBarber(companyId: number, period?: string, year?: number, month?: number): Promise<ApiResponse<AvgTicketData[]>> {
		return this.handleResponse<AvgTicketData[]>(
			apiClient.get(`/${this.endpoint}/avg-ticket`, {
				params: {
					companyId,
					period,
					year,
					month
				}
			})
		);
	}

	// Faturamento do próprio usuário (para barbeiros)
	async getUserRevenue(companyId: number, year?: number): Promise<ApiResponse<RevenueData[]>> {
		return this.handleResponse<RevenueData[]>(
			apiClient.get(`/${this.endpoint}/user`, {
				params: {
					companyId,
					year
				}
			})
		);
	}

	// Método auxiliar para colorir dados
	public assignColors(data: BarberRevenueData[] | ServiceRevenueData[]): any[] {
		const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'];

		return data.map((item, index) => ({
			...item,
			color: COLORS[index % COLORS.length]
		}));
	}
} 