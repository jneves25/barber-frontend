import apiClient from './apiClient';
import { ApiResponse } from './BaseService';

export interface DashboardStats {
	revenue: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	clients: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	appointments: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	services: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	commission: {
		total: number;
		trend: number;
		previousTotal: number;
	};
	productsSold: {
		total: number;
		trend: number;
		previousTotal: number;
	};
}

export interface TopService {
	id: number;
	name: string;
	count: number;
	revenue: number;
	service: string;
	quantity: number;
}

export interface BarberCommission {
	userId: number;
	id: number;
	name: string;
	totalCommission: number;
	appointmentCount: number;
	revenue: number;
	percentage: number;
}

export interface Appointment {
	id: number;
	clientId: number;
	userId: number;
	companyId: number;
	scheduledTime: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	client: {
		id: number;
		name: string;
		email: string;
		phone: string;
	};
	user: {
		id: number;
		name: string;
	};
	services: Array<{
		id: number;
		name: string;
		price: number;
	}>;
}

export class StatisticsService {
	/**
	 * Obter estatísticas do dashboard
	 */
	async getDashboardStats(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'year' | 'custom' = 'month',
		startDate?: string,
		endDate?: string,
		userId?: number
	): Promise<ApiResponse<DashboardStats>> {
		const params: any = { period };

		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;
		if (userId) params.userId = userId;

		console.log('Parâmetros da consulta de estatísticas:', {
			companyId,
			period,
			...params
		});

		const response = await apiClient.get<{ success: boolean; data: DashboardStats; status: number }>(
			`/statistics/dashboard/${companyId}`,
			{ params }
		);

		console.log('Resposta bruta de estatísticas:', response.data);

		// Se não temos dados de atendimentos mas temos receita
		if (response.data?.success && response.data.data) {
			if (response.data.data.revenue.total > 0 &&
				(!response.data.data.appointments || response.data.data.appointments.total === 0)) {
				console.log('Corrigindo estatísticas: há receita mas nenhum atendimento');
				response.data.data.appointments = {
					...response.data.data.appointments,
					total: 1,
					trend: 0,
					previousTotal: 0
				};
			}
		}

		return response.data;
	}

	/**
	 * Obter próximos agendamentos
	 */
	async getUpcomingAppointments(companyId: number, limit: number = 5): Promise<ApiResponse<Appointment[]>> {
		const response = await apiClient.get<{ success: boolean; data: Appointment[]; status: number }>(
			`/statistics/appointments/upcoming/${companyId}`,
			{ params: { limit } }
		);

		return response.data;
	}

	/**
	 * Obter principais serviços
	 */
	async getTopServices(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'year' | 'custom' = 'month',
		userId?: number,
		startDate?: string,
		endDate?: string
	): Promise<ApiResponse<TopService[]>> {
		const params: any = { period };

		if (userId) params.userId = userId;
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		const response = await apiClient.get<{ success: boolean; data: TopService[]; status: number }>(
			`/statistics/services/top/${companyId}`,
			{ params }
		);

		return response.data;
	}

	/**
	 * Obter comissões dos barbeiros
	 */
	async getBarberCommissions(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'year' | 'custom' = 'month',
		startDate?: string,
		endDate?: string
	): Promise<ApiResponse<BarberCommission[]>> {
		const params: any = { period };

		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		console.log('Parâmetros da consulta de comissões:', {
			companyId,
			period,
			...params
		});

		const response = await apiClient.get<{ success: boolean; data: BarberCommission[]; status: number }>(
			`/statistics/commissions/barber/${companyId}`,
			{ params }
		);

		console.log('Resposta bruta de comissões:', response.data);

		// Corrigir dados inconsistentes: se há receita mas nenhum atendimento
		if (response.data?.success && response.data.data) {
			response.data.data = response.data.data.map(barber => {
				if (barber.revenue > 0 && (!barber.appointmentCount || barber.appointmentCount === 0)) {
					console.log(`Corrigindo dados do barbeiro ${barber.name}: tem receita (${barber.revenue}) mas nenhum atendimento`);
					return {
						...barber,
						appointmentCount: 1
					};
				}
				return barber;
			});
		}

		return response.data;
	}

	// Busca agendamentos de um barbeiro específico
	async getBarberAppointments(companyId: number, startDate?: string, endDate?: string): Promise<ApiResponse<Appointment[]>> {
		const params: any = {};

		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		const response = await apiClient.get<{ success: boolean; data: Appointment[]; status: number }>(
			`/statistics/appointments/barber/${companyId}`,
			{ params }
		);

		return response.data;
	}

	/**
	 * Obter projeções de faturamento da empresa
	 * @param companyId ID da empresa
	 * @returns Projeções de faturamento da empresa
	 */
	async getProjections(companyId: number): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get(`/statistics/projections/${companyId}`);

			if (response.data && response.data.success) {
				return {
					success: true,
					data: response.data.data,
					status: response.status
				};
			}

			return {
				success: false,
				error: response.data.message || 'Erro ao obter projeções de faturamento',
				status: response.status
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message || 'Erro ao obter projeções de faturamento',
				status: 500
			};
		}
	}
} 