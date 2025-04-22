import { BaseService, ApiResponse } from './BaseService';
import apiClient from './apiClient';
import { RevenueService } from './RevenueService';
import { AppointmentService } from './AppointmentService';
import { ClientService } from './ClientService';
import { ServiceService } from './ServiceService';

export interface DashboardStats {
	revenue: {
		total: number;
		trend: number;
	};
	clients: {
		total: number;
		trend: number;
	};
	appointments: {
		total: number;
		trend: number;
	};
	services: {
		total: number;
		trend: number;
	};
}

export class StatisticsService {
	private revenueService: RevenueService;
	private appointmentService: AppointmentService;
	private clientService: ClientService;
	private serviceService: ServiceService;

	constructor() {
		this.revenueService = new RevenueService();
		this.appointmentService = new AppointmentService();
		this.clientService = new ClientService();
		this.serviceService = new ServiceService();
	}

	async getDashboardStats(companyId: number, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DashboardStats> {
		// Get the current date and year
		const now = new Date();
		const currentYear = now.getFullYear();

		// Default stats with zero values
		const stats: DashboardStats = {
			revenue: { total: 0, trend: 0 },
			clients: { total: 0, trend: 0 },
			appointments: { total: 0, trend: 0 },
			services: { total: 0, trend: 0 },
		};

		try {
			// Get revenue data
			const revenueResponse = await this.revenueService.getMonthlyRevenue(companyId, currentYear, period);

			if (revenueResponse.success && revenueResponse.data) {
				// Sum up all revenue for the period
				stats.revenue.total = revenueResponse.data.reduce((sum, item) => sum + item.total, 0);

				// Calculate trend (last 2 months comparison)
				if (revenueResponse.data.length >= 2) {
					const lastMonth = revenueResponse.data[revenueResponse.data.length - 1].total;
					const prevMonth = revenueResponse.data[revenueResponse.data.length - 2].total;

					if (prevMonth > 0) {
						stats.revenue.trend = ((lastMonth - prevMonth) / prevMonth) * 100;
					}
				}
			}

			// Get appointments data
			const appointmentsResponse = await this.appointmentService.getAll(companyId);

			if (appointmentsResponse.success && appointmentsResponse.data) {
				// Filter appointments by period
				const periodStartDate = this.getPeriodStartDate(period);

				// Current period appointments
				const currentPeriodAppointments = appointmentsResponse.data.filter(
					appointment => new Date(appointment.scheduledTime) >= periodStartDate
				);

				stats.appointments.total = currentPeriodAppointments.length;

				// Count completed services in appointments
				stats.services.total = currentPeriodAppointments.reduce(
					(sum, appointment) => sum + appointment.services.length,
					0
				);

				// Previous period for trend calculation
				const prevPeriodStartDate = this.getPreviousPeriodStartDate(period);
				const prevPeriodEndDate = periodStartDate;

				const prevPeriodAppointments = appointmentsResponse.data.filter(
					appointment => {
						const date = new Date(appointment.scheduledTime);
						return date >= prevPeriodStartDate && date < prevPeriodEndDate;
					}
				);

				// Calculate trends
				const prevPeriodCount = prevPeriodAppointments.length;
				if (prevPeriodCount > 0) {
					stats.appointments.trend = ((stats.appointments.total - prevPeriodCount) / prevPeriodCount) * 100;
				}

				const prevPeriodServices = prevPeriodAppointments.reduce(
					(sum, appointment) => sum + appointment.services.length,
					0
				);

				if (prevPeriodServices > 0) {
					stats.services.trend = ((stats.services.total - prevPeriodServices) / prevPeriodServices) * 100;
				}
			}

			// Get clients data
			const clientsResponse = await this.clientService.getAll(companyId);

			if (clientsResponse.success && clientsResponse.data) {
				// Count clients that have appointments in the current period
				const periodStartDate = this.getPeriodStartDate(period);

				// Get unique client IDs from appointments in the current period
				const clientsWithRecentAppointments = new Set();

				appointmentsResponse.data?.forEach(appointment => {
					if (new Date(appointment.scheduledTime) >= periodStartDate) {
						clientsWithRecentAppointments.add(appointment.clientId);
					}
				});

				stats.clients.total = clientsWithRecentAppointments.size;

				// Previous period for trend calculation
				const prevPeriodStartDate = this.getPreviousPeriodStartDate(period);
				const prevPeriodEndDate = periodStartDate;

				const clientsWithPrevAppointments = new Set();

				appointmentsResponse.data?.forEach(appointment => {
					const date = new Date(appointment.scheduledTime);
					if (date >= prevPeriodStartDate && date < prevPeriodEndDate) {
						clientsWithPrevAppointments.add(appointment.clientId);
					}
				});

				// Calculate trends
				const prevPeriodClients = clientsWithPrevAppointments.size;
				if (prevPeriodClients > 0) {
					stats.clients.trend = ((stats.clients.total - prevPeriodClients) / prevPeriodClients) * 100;
				}
			}

			return stats;
		} catch (error) {
			console.error('Error fetching dashboard statistics:', error);
			return stats;
		}
	}

	// Helper method to get start date for the current period
	private getPeriodStartDate(period: 'week' | 'month' | 'quarter' | 'year'): Date {
		const now = new Date();
		const startDate = new Date(now);

		switch (period) {
			case 'week':
				startDate.setDate(now.getDate() - 7);
				break;
			case 'month':
				startDate.setMonth(now.getMonth() - 1);
				break;
			case 'quarter':
				startDate.setMonth(now.getMonth() - 3);
				break;
			case 'year':
				startDate.setFullYear(now.getFullYear() - 1);
				break;
		}

		return startDate;
	}

	// Helper method to get start date for the previous period
	private getPreviousPeriodStartDate(period: 'week' | 'month' | 'quarter' | 'year'): Date {
		const now = new Date();
		const startDate = new Date(now);

		switch (period) {
			case 'week':
				startDate.setDate(now.getDate() - 14);
				break;
			case 'month':
				startDate.setMonth(now.getMonth() - 2);
				break;
			case 'quarter':
				startDate.setMonth(now.getMonth() - 6);
				break;
			case 'year':
				startDate.setFullYear(now.getFullYear() - 2);
				break;
		}

		return startDate;
	}

	// Get upcoming appointments for dashboard
	async getUpcomingAppointments(companyId: number, limit: number = 5): Promise<ApiResponse<any[]>> {
		const appointmentsResponse = await this.appointmentService.getAll(companyId);

		if (appointmentsResponse.success && appointmentsResponse.data) {
			// Filter upcoming appointments (scheduled time is in the future)
			const now = new Date();
			const upcomingAppointments = appointmentsResponse.data
				.filter(appointment => new Date(appointment.scheduledTime) >= now)
				.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
				.slice(0, limit);

			return {
				success: true,
				data: upcomingAppointments,
				status: 200
			};
		}

		return appointmentsResponse;
	}

	// Get top services for dashboard
	async getTopServices(companyId: number, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<any[]>> {
		const currentYear = new Date().getFullYear();
		const serviceRevenueResponse = await this.revenueService.getServiceRevenue(companyId, undefined, period, currentYear);

		return serviceRevenueResponse;
	}

	// Get barber commissions
	async getBarberCommissions(companyId: number, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<any[]>> {
		const currentYear = new Date().getFullYear();
		const barberRevenueResponse = await this.revenueService.getBarberRevenue(companyId, period, currentYear);

		return barberRevenueResponse;
	}
} 