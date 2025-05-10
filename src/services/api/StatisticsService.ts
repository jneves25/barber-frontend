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

	async getDashboardStats(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		startDate?: string | null,
		endDate?: string | null
	): Promise<DashboardStats> {
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
			const revenueResponse = await this.revenueService.getMonthlyRevenue(
				companyId,
				currentYear,
				period,
				startDate,
				endDate
			);

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
				let periodStartDate: Date;
				let periodEndDate: Date | null = null;

				if (period === 'custom' && startDate && endDate) {
					periodStartDate = new Date(startDate);
					periodEndDate = new Date(endDate);
					// Set end date to end of day
					periodEndDate.setHours(23, 59, 59, 999);
				} else {
					periodStartDate = this.getPeriodStartDate(period as 'week' | 'month' | 'quarter' | 'year');
				}

				// Current period appointments
				const currentPeriodAppointments = appointmentsResponse.data.filter(
					appointment => {
						const appointmentDate = new Date(appointment.scheduledTime);
						if (periodEndDate) {
							return appointmentDate >= periodStartDate && appointmentDate <= periodEndDate;
						}
						return appointmentDate >= periodStartDate;
					}
				);

				stats.appointments.total = currentPeriodAppointments.length;

				// Count completed services in appointments
				stats.services.total = currentPeriodAppointments.reduce(
					(sum, appointment) => sum + appointment.services.length,
					0
				);

				// Previous period for trend calculation
				let prevPeriodStartDate: Date;
				let prevPeriodEndDate: Date;

				if (period === 'custom' && startDate && endDate) {
					// For custom period, calculate an equivalent previous period
					const start = new Date(startDate);
					const end = new Date(endDate);
					const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

					prevPeriodEndDate = new Date(start);
					prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);

					prevPeriodStartDate = new Date(prevPeriodEndDate);
					prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - dayDiff);
				} else {
					prevPeriodStartDate = this.getPreviousPeriodStartDate(period as 'week' | 'month' | 'quarter' | 'year');
					prevPeriodEndDate = periodStartDate;
				}

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
				let periodStartDate: Date;
				let periodEndDate: Date | null = null;

				if (period === 'custom' && startDate && endDate) {
					periodStartDate = new Date(startDate);
					periodEndDate = new Date(endDate);
					// Set end date to end of day
					periodEndDate.setHours(23, 59, 59, 999);
				} else {
					periodStartDate = this.getPeriodStartDate(period as 'week' | 'month' | 'quarter' | 'year');
				}

				// Get unique client IDs from appointments in the current period
				const clientsWithRecentAppointments = new Set();

				appointmentsResponse.data?.forEach(appointment => {
					const appointmentDate = new Date(appointment.scheduledTime);
					if (periodEndDate) {
						if (appointmentDate >= periodStartDate && appointmentDate <= periodEndDate) {
							clientsWithRecentAppointments.add(appointment.clientId);
						}
					} else if (appointmentDate >= periodStartDate) {
						clientsWithRecentAppointments.add(appointment.clientId);
					}
				});

				stats.clients.total = clientsWithRecentAppointments.size;

				// Previous period for trend calculation
				let prevPeriodStartDate: Date;
				let prevPeriodEndDate: Date;

				if (period === 'custom' && startDate && endDate) {
					// For custom period, calculate an equivalent previous period
					const start = new Date(startDate);
					const end = new Date(endDate);
					const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

					prevPeriodEndDate = new Date(start);
					prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);

					prevPeriodStartDate = new Date(prevPeriodEndDate);
					prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - dayDiff);
				} else {
					prevPeriodStartDate = this.getPreviousPeriodStartDate(period as 'week' | 'month' | 'quarter' | 'year');
					prevPeriodEndDate = periodStartDate;
				}

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
	async getTopServices(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		userId?: number,
		startDate?: string | null,
		endDate?: string | null
	): Promise<ApiResponse<any[]>> {
		const currentYear = new Date().getFullYear();
		const serviceRevenueResponse = await this.revenueService.getServiceRevenue(
			companyId,
			userId,
			period,
			currentYear,
			startDate,
			endDate
		);

		return serviceRevenueResponse;
	}

	// Get barber commissions
	async getBarberCommissions(
		companyId: number,
		period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom' = 'month',
		startDate?: string | null,
		endDate?: string | null
	): Promise<ApiResponse<any[]>> {
		const currentYear = new Date().getFullYear();
		const barberRevenueResponse = await this.revenueService.getBarberRevenue(
			companyId,
			period,
			currentYear,
			startDate,
			endDate
		);

		return barberRevenueResponse;
	}
} 