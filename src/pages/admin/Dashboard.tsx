import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Scissors, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { StatisticsService } from '@/services/api/StatisticsService';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts';

// Componente de estatística
const StatCard = ({ title, value, description, icon, trend = null, trendValue = null }) => {
	const Icon = icon;
	const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : '';
	const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<div className="flex items-center pt-1">
					{trend && (
						<>
							<TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
							<span className={`text-xs ${trendColor}`}>{trendValue}</span>
						</>
					)}
					{description && (
						<span className="text-xs text-muted-foreground ml-auto">{description}</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

// Cores para os gráficos
const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'];

const Dashboard = () => {
	const { companySelected } = useAuth();
	const [periodFilter, setPeriodFilter] = useState('month');
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState({
		revenue: { total: 0, trend: 0 },
		clients: { total: 0, trend: 0 },
		appointments: { total: 0, trend: 0 },
		services: { total: 0, trend: 0 },
	});
	const [topServices, setTopServices] = useState([]);
	const [barberCommissions, setBarberCommissions] = useState([]);
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);
	const [goals, setGoals] = useState([
		{ name: 'Faturamento', goal: 'R$ 8.000,00', current: 'R$ 0,00', percentage: 0 },
		{ name: 'Clientes', goal: '80', current: '0', percentage: 0 },
		{ name: 'Agendamentos', goal: '250', current: '0', percentage: 0 }
	]);

	const statisticsService = new StatisticsService();

	useEffect(() => {
		if (!companySelected?.id) return;

		const loadDashboardData = async () => {
			setIsLoading(true);
			try {
				// Load dashboard statistics
				const dashboardStats = await statisticsService.getDashboardStats(
					companySelected.id,
					periodFilter as any
				);
				setStats(dashboardStats);

				// Load top services
				const topServicesResponse = await statisticsService.getTopServices(
					companySelected.id,
					periodFilter as any
				);

				if (topServicesResponse.success && topServicesResponse.data) {
					setTopServices(topServicesResponse.data);
				}

				// Load barber commissions
				const barberCommissionsResponse = await statisticsService.getBarberCommissions(
					companySelected.id,
					periodFilter as any
				);

				if (barberCommissionsResponse.success && barberCommissionsResponse.data) {
					setBarberCommissions(barberCommissionsResponse.data);
				}

				// Load upcoming appointments
				const appointmentsResponse = await statisticsService.getUpcomingAppointments(
					companySelected.id,
					5 // limit to 5 appointments
				);

				if (appointmentsResponse.success && appointmentsResponse.data) {
					setUpcomingAppointments(appointmentsResponse.data);
				}

				// Update goals with current data
				setGoals([
					{
						name: 'Faturamento',
						goal: 'R$ 8.000,00',
						current: `R$ ${dashboardStats.revenue.total.toFixed(2).replace('.', ',')}`,
						percentage: Math.min(Math.round((dashboardStats.revenue.total / 8000) * 100), 100)
					},
					{
						name: 'Clientes',
						goal: '80',
						current: dashboardStats.clients.total.toString(),
						percentage: Math.min(Math.round((dashboardStats.clients.total / 80) * 100), 100)
					},
					{
						name: 'Agendamentos',
						goal: '250',
						current: dashboardStats.appointments.total.toString(),
						percentage: Math.min(Math.round((dashboardStats.appointments.total / 250) * 100), 100)
					}
				]);

			} catch (error) {
				console.error('Error loading dashboard data:', error);
				toast({
					title: "Erro ao carregar dados",
					description: "Não foi possível carregar os dados do dashboard",
					variant: "destructive"
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadDashboardData();
	}, [companySelected?.id, periodFilter]);

	const formatCurrency = (value) => {
		return `R$ ${value.toFixed(2).replace('.', ',')}`;
	};

	const formatTrend = (value) => {
		return `${value.toFixed(1)}%`;
	};

	const getTrendDirection = (value) => {
		return value >= 0 ? 'up' : 'down';
	};

	const formatAppointmentDate = (dateString) => {
		const date = new Date(dateString);
		return format(date, 'dd/MM/yyyy', { locale: ptBR });
	};

	const formatAppointmentTime = (dateString) => {
		const date = new Date(dateString);
		return format(date, 'HH:mm', { locale: ptBR });
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex flex-col items-center justify-center h-full min-h-[300px]">
					<Loader2 className="h-12 w-12 text-barber-500 animate-spin mb-4" />
					<p className="text-lg text-gray-600">Carregando dados do dashboard...</p>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="grid gap-4 md:gap-6 mb-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
					<div>
						<select
							className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm"
							value={periodFilter}
							onChange={(e) => setPeriodFilter(e.target.value)}
						>
							<option value="week">Últimos 7 dias</option>
							<option value="month">Últimos 30 dias</option>
							<option value="quarter">Último trimestre</option>
							<option value="year">Este ano</option>
						</select>
					</div>
				</div>
			</div>

			{/* Cards de estatísticas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="Faturamento"
					value={formatCurrency(stats.revenue.total)}
					description="Esse período"
					icon={DollarSign}
					trend={getTrendDirection(stats.revenue.trend)}
					trendValue={formatTrend(stats.revenue.trend)}
				/>
				<StatCard
					title="Novos Clientes"
					value={stats.clients.total}
					description="Esse período"
					icon={Users}
					trend={getTrendDirection(stats.clients.trend)}
					trendValue={formatTrend(stats.clients.trend)}
				/>
				<StatCard
					title="Agendamentos"
					value={stats.appointments.total}
					description="Esse período"
					icon={Calendar}
					trend={getTrendDirection(stats.appointments.trend)}
					trendValue={formatTrend(stats.appointments.trend)}
				/>
				<StatCard
					title="Serviços realizados"
					value={stats.services.total}
					description="Esse período"
					icon={Scissors}
					trend={getTrendDirection(stats.services.trend)}
					trendValue={formatTrend(stats.services.trend)}
				/>
			</div>

			{/* Gráficos */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Faturamento por período</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							{topServices.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={topServices}
										margin={{
											top: 20,
											right: 30,
											left: 20,
											bottom: 5,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="service" />
										<YAxis />
										<Tooltip
											formatter={(value) => {
												if (typeof value === 'number') {
													return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
												}
												return [`R$ ${value}`, 'Faturamento'];
											}}
										/>
										<Legend />
										<Bar dataKey="revenue" name="Faturamento (R$)" fill="#8B4513" />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
									<BarChart3 className="h-10 w-10 text-gray-400" />
									<p className="text-gray-500 ml-2">Sem dados para exibir</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Serviços mais procurados</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							{topServices.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={topServices}
											cx="50%"
											cy="50%"
											labelLine={false}
											outerRadius={80}
											fill="#8884d8"
											dataKey="quantity"
											nameKey="service"
											label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
										>
											{topServices.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip formatter={(value) => {
											if (typeof value === 'number') {
												return [`${value} unidades`, 'Quantidade'];
											}
											return [`${value} unidades`, 'Quantidade'];
										}} />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
									<TrendingUp className="h-10 w-10 text-gray-400" />
									<p className="text-gray-500 ml-2">Sem dados para exibir</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Metas e Barbeiros */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Comissões por barbeiro</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{barberCommissions.length > 0 ? (
								barberCommissions.map((barber) => (
									<div key={barber.id} className="space-y-2">
										<div className="flex items-center">
											<span className="font-medium truncate">{barber.name}</span>
											<span className="ml-auto">{formatCurrency(barber.revenue)}</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2.5">
											<div
												className="bg-barber-500 h-2.5 rounded-full"
												style={{ width: `${barber.percentage}%` }}
											></div>
										</div>
									</div>
								))
							) : (
								<div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
									<Users className="h-10 w-10 text-gray-400" />
									<p className="text-gray-500 ml-2">Sem dados para exibir</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Metas do mês</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{goals.map((goal) => (
								<div key={goal.name} className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium">{goal.name}</span>
										<span className="text-gray-500 text-xs md:text-sm">
											{goal.current} / {goal.goal}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className="bg-barber-400 h-2.5 rounded-full"
											style={{ width: `${goal.percentage}%` }}
										></div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Próximos agendamentos */}
			<Card>
				<CardHeader>
					<CardTitle>Próximos agendamentos</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto -mx-4 sm:mx-0">
						<div className="inline-block min-w-full align-middle">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr>
										<th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
										<th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
										<th className="hidden sm:table-cell py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
										<th className="hidden md:table-cell py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
										<th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
										<th className="hidden sm:table-cell py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{upcomingAppointments.length > 0 ? (
										upcomingAppointments.map((appointment, index) => (
											<tr key={appointment.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
												<td className="py-3 px-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">{appointment.client.name}</div>
												</td>
												<td className="py-3 px-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{appointment.services.length > 0
															? appointment.services[0].service.name
															: "Sem serviço"
														}
														{appointment.services.length > 1 && ` +${appointment.services.length - 1}`}
													</div>
												</td>
												<td className="hidden sm:table-cell py-3 px-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{appointment.user.name}</div>
												</td>
												<td className="hidden md:table-cell py-3 px-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{formatAppointmentDate(appointment.scheduledTime)}</div>
												</td>
												<td className="py-3 px-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{formatAppointmentTime(appointment.scheduledTime)}</div>
												</td>
												<td className="hidden sm:table-cell py-3 px-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{formatCurrency(appointment.value)}</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={6} className="py-4 text-center text-sm text-gray-500">
												Não há agendamentos futuros
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>
		</AdminLayout>
	);
};

export default Dashboard;
