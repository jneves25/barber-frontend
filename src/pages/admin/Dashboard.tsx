import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Scissors, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, CalendarIcon, Clock, CheckCircle, AlertTriangle, Percent } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { StatisticsService } from '@/services/api/StatisticsService';
import { toast } from '@/components/ui/use-toast';
import { format, startOfMonth, isToday, addDays, isTomorrow } from 'date-fns';
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
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componente de estatística
const StatCard = ({ title, value, description, icon, trend = null, trendValue = null }) => {
	const Icon = icon;
	const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : '';
	const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

	return (
		<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-gray-50 to-white">
				<CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
				<div className="p-2 rounded-full bg-white shadow-sm">
					<Icon className="h-4 w-4 text-barber-600" />
				</div>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="text-2xl font-bold text-gray-800">{value}</div>
				<div className="flex items-center pt-1">
					{trend && (
						<>
							<TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
							<span className={`text-xs font-medium ${trendColor}`}>{trendValue}</span>
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

// Componente para card de próximo agendamento
const AppointmentCard = ({ appointment, isFirst = false }) => {
	const appointmentDate = new Date(appointment.scheduledTime);
	const isToday = format(appointmentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
	const isTomorrow = format(appointmentDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');

	return (
		<Card className={`mb-3 border-l-4 ${isFirst ? 'border-l-barber-600' : 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
			<CardContent className="p-4 flex items-start">
				<div className="mr-4 mt-1">
					<div className={`p-2 rounded-full ${isFirst ? 'bg-barber-100' : 'bg-gray-100'}`}>
						{isFirst ? (
							<Clock className="h-5 w-5 text-barber-600" />
						) : (
							<Calendar className="h-5 w-5 text-gray-500" />
						)}
					</div>
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between mb-1">
						<h4 className="font-semibold text-gray-800">{appointment.client.name}</h4>
						<div>
							{isToday && <Badge className="bg-green-500 hover:bg-green-600">Hoje</Badge>}
							{isTomorrow && <Badge className="bg-blue-500 hover:bg-blue-600">Amanhã</Badge>}
							{!isToday && !isTomorrow && <Badge className="bg-gray-500 hover:bg-gray-600">{format(appointmentDate, 'dd/MM')}</Badge>}
						</div>
					</div>
					<div className="text-sm text-gray-600 mb-1">
						{appointment.services.length > 0
							? appointment.services[0].service.name
							: "Sem serviço"}
						{appointment.services.length > 1 && <span className="text-gray-500"> +{appointment.services.length - 1}</span>}
					</div>
					<div className="flex items-center justify-between text-xs">
						<span className="font-medium text-barber-600">{format(appointmentDate, 'HH:mm')}</span>
						<span className="font-medium">{`R$ ${appointment.value.toFixed(2).replace('.', ',')}`}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

// Cores para os gráficos com melhor contraste e harmonização
const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3', '#D2B48C', '#BC8F8F', '#F4A460'];

const Dashboard = () => {
	const { companySelected, user } = useAuth();
	const [dateRange, setDateRange] = useState<Date[]>([
		startOfMonth(new Date()),
		new Date()
	]);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState({
		revenue: { total: 0, trend: 0 },
		clients: { total: 0, trend: 0 },
		appointments: { total: 0, trend: 0 },
		services: { total: 0, trend: 0 },
		commission: { total: 0, trend: 0 },
	});
	const [userStats, setUserStats] = useState({
		revenue: { total: 0, trend: 0 },
		clients: { total: 0, trend: 0 },
		appointments: { total: 0, trend: 0 },
		commission: { total: 0, trend: 0 },
	});
	const [topServices, setTopServices] = useState([]);
	const [userTopServices, setUserTopServices] = useState([]);
	const [barberCommissions, setBarberCommissions] = useState([]);
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);
	const [userAppointments, setUserAppointments] = useState([]);
	const [goals, setGoals] = useState<{ name: string; current: string }[]>([
		{ name: 'Faturamento', current: 'R$ 0,00' },
		{ name: 'Clientes', current: '0' },
		{ name: 'Agendamentos', current: '0' }
	]);
	const [userCommission, setUserCommission] = useState(0);
	const [activeTab, setActiveTab] = useState("overview");

	const statisticsService = new StatisticsService();
	const isAdmin = user?.role === 'ADMIN';

	useEffect(() => {
		if (!companySelected?.id) return;

		const loadDashboardData = async () => {
			setIsLoading(true);
			try {
				// Preparar datas para o filtro
				const startDate = dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : null;
				const endDate = dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : null;

				// Load dashboard statistics with date range
				const dashboardStats = await statisticsService.getDashboardStats(
					companySelected.id,
					'custom',
					startDate,
					endDate
				);
				setStats({
					...dashboardStats,
					commission: stats.commission // Preserve existing commission data
				});

				// Load top services with date range
				const topServicesResponse = await statisticsService.getTopServices(
					companySelected.id,
					'custom',
					undefined,
					startDate,
					endDate
				);

				if (topServicesResponse.success && topServicesResponse.data) {
					setTopServices(topServicesResponse.data);
				}

				// Load barber commissions with date range
				const barberCommissionsResponse = await statisticsService.getBarberCommissions(
					companySelected.id,
					'custom',
					startDate,
					endDate
				);

				if (barberCommissionsResponse.success && barberCommissionsResponse.data) {
					setBarberCommissions(barberCommissionsResponse.data);

					// Calcular a comissão do usuário logado e seus dados individuais
					if (user?.id) {
						const userBarberData = barberCommissionsResponse.data.find(
							barber => barber.id === user.id
						);

						if (userBarberData) {
							// Calcular a comissão com base no faturamento do usuário
							const userRevenue = userBarberData.revenue || 0;
							setUserCommission(userRevenue);

							// Atualizar dados do usuário
							setUserStats({
								...userStats,
								revenue: {
									total: userRevenue,
									trend: dashboardStats.revenue.trend // Mantém a tendência geral
								}
							});
						}
					}
				}

				// Load user-specific top services if user is a barber with date range
				if (user?.id && user?.role === 'USER') {
					const userServicesResponse = await statisticsService.getTopServices(
						companySelected.id,
						'custom',
						user.id,
						startDate,
						endDate
					);

					if (userServicesResponse.success && userServicesResponse.data) {
						setUserTopServices(userServicesResponse.data);
					}
				} else {
					setUserTopServices(topServicesResponse.data || []);
				}

				// Load upcoming appointments
				const appointmentsResponse = await statisticsService.getUpcomingAppointments(
					companySelected.id,
					5 // limit to 5 appointments
				);

				if (appointmentsResponse.success && appointmentsResponse.data) {
					setUpcomingAppointments(appointmentsResponse.data);

					// Filtrar apenas os agendamentos do usuário se for um barbeiro
					if (user?.role === 'USER') {
						const filteredAppointments = appointmentsResponse.data.filter(
							appointment => appointment.userId === user.id
						);
						setUserAppointments(filteredAppointments);

						// Atualizar estatísticas do usuário com base nos agendamentos
						const uniqueClients = new Set(filteredAppointments.map(app => app.clientId));
						setUserStats(prev => ({
							...prev,
							clients: {
								total: uniqueClients.size,
								trend: dashboardStats.clients.trend
							},
							appointments: {
								total: filteredAppointments.length,
								trend: dashboardStats.appointments.trend
							}
						}));
					} else {
						setUserAppointments(appointmentsResponse.data);
					}
				}

				// Update goals with current data
				if (isAdmin) {
					setGoals([
						{
							name: 'Faturamento',
							current: `R$ ${dashboardStats.revenue.total.toFixed(2).replace('.', ',')}`,
						},
						{
							name: 'Clientes',
							current: dashboardStats.clients.total.toString(),
						},
						{
							name: 'Agendamentos',
							current: dashboardStats.appointments.total.toString(),
						}
					]);
				} else {
					// Dados personalizados para barbeiros
					const userRevenue = userStats.revenue.total;
					const userClients = userStats.clients.total;
					const userAppointmentsCount = userStats.appointments.total;

					setGoals([
						{
							name: 'Meu Faturamento',
							current: `R$ ${userRevenue.toFixed(2).replace('.', ',')}`,
						},
						{
							name: 'Meus Clientes',
							current: userClients.toString(),
						},
						{
							name: 'Meus Agendamentos',
							current: userAppointmentsCount.toString(),
						}
					]);
				}

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
	}, [companySelected?.id, dateRange, user?.id, user?.role]);

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

	// Format date range for display
	const formatDateRange = () => {
		if (!dateRange[0] || !dateRange[1]) return "Selecionar período";

		return `${format(dateRange[0], 'dd/MM/yyyy')} - ${format(dateRange[1], 'dd/MM/yyyy')}`;
	};

	// Custom tooltip para gráficos
	const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
					<p className="font-medium text-gray-800">{label}</p>
					{payload.map((entry, index) => (
						<p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
							{entry.name}: {entry.name.includes("Faturamento") ? formatCurrency(entry.value) : entry.value}
						</p>
					))}
				</div>
			);
		}
		return null;
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

	const renderAppointments = () => {
		const appointments = isAdmin ? upcomingAppointments : userAppointments;

		if (appointments.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<Calendar className="h-16 w-16 text-gray-300 mb-4" />
					<h3 className="text-lg font-medium text-gray-800 mb-2">Sem agendamentos</h3>
					<p className="text-gray-500 max-w-md">
						Você não possui agendamentos para os próximos dias.
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-1">
				{appointments.map((appointment, index) => (
					<AppointmentCard
						key={appointment.id}
						appointment={appointment}
						isFirst={index === 0}
					/>
				))}
			</div>
		);
	};

	return (
		<AdminLayout>
			<div className="pb-12">
				{/* Cabeçalho do Dashboard */}
				<div className="bg-gradient-to-r from-barber-50 to-white p-6 rounded-xl mb-6 shadow-sm">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-800">{isAdmin ? 'Dashboard Administrativo' : 'Meu Dashboard'}</h1>
							<p className="text-gray-600 mt-1">Visualize seus dados e próximos compromissos</p>
						</div>
						<div className="flex items-center">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-[280px] justify-start text-left font-normal",
											!dateRange && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formatDateRange()}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="end">
									<CalendarComponent
										initialFocus
										mode="range"
										defaultMonth={dateRange[0]}
										selected={{
											from: dateRange[0] || undefined,
											to: dateRange[1] || undefined,
										}}
										onSelect={(range) => {
											if (range?.from && range?.to) {
												setDateRange([range.from, range.to]);
											}
										}}
										numberOfMonths={2}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-12 gap-6">
					{/* Coluna principal */}
					<div className="col-span-12 lg:col-span-8">
						<Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
							<TabsList className="mb-4">
								<TabsTrigger value="overview">Visão Geral</TabsTrigger>
								<TabsTrigger value="appointments">Próximos Agendamentos</TabsTrigger>
							</TabsList>

							<TabsContent value="overview">
								{/* Cards de estatísticas */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
									<StatCard
										title={isAdmin ? "Receita Total" : "Minha Receita"}
										value={formatCurrency(isAdmin ? stats.revenue.total : userStats.revenue.total)}
										description="Esse período"
										icon={DollarSign}
										trend={getTrendDirection(stats.revenue.trend)}
										trendValue={formatTrend(stats.revenue.trend)}
									/>
									<StatCard
										title={isAdmin ? "Atendimentos" : "Meus Atendimentos"}
										value={isAdmin ? stats.appointments.total : userStats.appointments.total}
										description="Esse período"
										icon={CalendarIcon}
										trend={getTrendDirection(stats.appointments.trend)}
										trendValue={formatTrend(stats.appointments.trend)}
									/>
									<StatCard
										title={isAdmin ? "Comissão Total" : "Minha Comissão"}
										value={formatCurrency(isAdmin ? stats.commission.total : userStats.commission.total)}
										description="Esse período"
										icon={Percent}
										trend={getTrendDirection(stats.commission.trend)}
										trendValue={formatTrend(stats.commission.trend)}
									/>
								</div>

								{/* Gráficos */}
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
									<Card className="shadow-md hover:shadow-lg transition-shadow">
										<CardHeader>
											<CardTitle className="text-lg text-gray-800">{isAdmin ? "Faturamento por período" : "Meu Faturamento por Serviço"}</CardTitle>
											<CardDescription>Distribução de receita por serviço</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="h-72">
												{(isAdmin ? topServices : userTopServices).length > 0 ? (
													<ResponsiveContainer width="100%" height="100%">
														<BarChart
															data={isAdmin ? topServices : userTopServices}
															margin={{
																top: 20,
																right: 30,
																left: 20,
																bottom: 5,
															}}
														>
															<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
															<XAxis
																dataKey="service"
																tick={{ fill: '#6b7280', fontSize: 11 }}
																axisLine={{ stroke: '#e5e7eb' }}
															/>
															<YAxis
																tick={{ fill: '#6b7280', fontSize: 11 }}
																axisLine={{ stroke: '#e5e7eb' }}
															/>
															<Tooltip content={<CustomTooltip />} />
															<Legend wrapperStyle={{ paddingTop: 10 }} />
															<Bar
																dataKey="revenue"
																name="Faturamento (R$)"
																fill="#8B4513"
																radius={[4, 4, 0, 0]}
															/>
														</BarChart>
													</ResponsiveContainer>
												) : (
													<div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md">
														<BarChart3 className="h-10 w-10 text-gray-400 mb-2" />
														<p className="text-gray-500">Sem dados para exibir</p>
													</div>
												)}
											</div>
										</CardContent>
									</Card>

									<Card className="shadow-md hover:shadow-lg transition-shadow">
										<CardHeader>
											<CardTitle className="text-lg text-gray-800">{isAdmin ? "Serviços mais procurados" : "Meus Serviços Mais Realizados"}</CardTitle>
											<CardDescription>Distribuição por quantidade de serviços</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="h-72">
												{(isAdmin ? topServices : userTopServices).length > 0 ? (
													<ResponsiveContainer width="100%" height="100%">
														<PieChart>
															<Pie
																data={isAdmin ? topServices : userTopServices}
																cx="50%"
																cy="50%"
																labelLine={true}
																outerRadius={90}
																fill="#8884d8"
																dataKey="quantity"
																nameKey="service"
																label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
															>
																{(isAdmin ? topServices : userTopServices).map((entry, index) => (
																	<Cell
																		key={`cell-${index}`}
																		fill={COLORS[index % COLORS.length]}
																		stroke="#fff"
																		strokeWidth={1}
																	/>
																))}
															</Pie>
															<Tooltip content={<CustomTooltip />} />
														</PieChart>
													</ResponsiveContainer>
												) : (
													<div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md">
														<TrendingUp className="h-10 w-10 text-gray-400 mb-2" />
														<p className="text-gray-500">Sem dados para exibir</p>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Metas e Barbeiros */}
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
									{isAdmin && (
										<Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
											<CardHeader>
												<CardTitle className="text-lg text-gray-800">Comissões por barbeiro</CardTitle>
												<CardDescription>Desempenho por profissional no período</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													{barberCommissions.length > 0 ? (
														barberCommissions.map((barber) => (
															<div key={barber.id} className="space-y-2">
																<div className="flex items-center">
																	<span className="font-medium truncate text-gray-800">{barber.name}</span>
																	<span className="ml-auto font-medium text-barber-700">{formatCurrency(barber.revenue)}</span>
																</div>
																<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
																	<div
																		className="bg-gradient-to-r from-barber-400 to-barber-600 h-2.5 rounded-full"
																		style={{ width: `${barber.percentage}%` }}
																	></div>
																</div>
															</div>
														))
													) : (
														<div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md">
															<Users className="h-10 w-10 text-gray-400 mb-2" />
															<p className="text-gray-500">Sem dados para exibir</p>
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									)}

									<Card className={`${isAdmin ? "" : "lg:col-span-full"} shadow-md hover:shadow-lg transition-shadow`}>
										<CardHeader>
											<CardTitle className="text-lg text-gray-800">{isAdmin ? "Dados do período" : "Meus Dados"}</CardTitle>
											<CardDescription>Resumo dos principais indicadores</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-6">
												{goals.map((goal) => (
													<div key={goal.name} className="space-y-2 bg-gray-50 p-3 rounded-lg">
														<div className="flex items-center justify-between text-sm">
															<span className="font-medium text-gray-700">{goal.name}</span>
															<span className="text-barber-700 font-semibold text-md">
																{goal.current}
															</span>
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="appointments">
								<div className="bg-white p-6 rounded-lg shadow-md">
									<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
										<Calendar className="h-5 w-5 mr-2 text-barber-600" />
										{isAdmin ? "Próximos Agendamentos" : "Meus Próximos Agendamentos"}
									</h3>
									{renderAppointments()}
								</div>
							</TabsContent>
						</Tabs>
					</div>

					{/* Coluna lateral - Próximos agendamentos */}
					<div className="col-span-12 lg:col-span-4">
						<Card className="shadow-md overflow-hidden h-full">
							<CardHeader className="bg-barber-50 border-b">
								<CardTitle className="text-lg text-gray-800 flex items-center">
									<Calendar className="h-5 w-5 mr-2 text-barber-600" />
									{isAdmin ? "Próximos Agendamentos" : "Meus Próximos Agendamentos"}
								</CardTitle>
								<CardDescription>Compromissos agendados para os próximos dias</CardDescription>
							</CardHeader>
							<CardContent className="p-4">
								<div className="py-2">
									{renderAppointments()}
								</div>
								<div className="flex justify-center mt-4">
									<Button
										variant="outline"
										className="w-full"
										onClick={() => setActiveTab("appointments")}
									>
										Ver todos os agendamentos
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default Dashboard;
