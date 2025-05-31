import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Scissors, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, CalendarIcon, Clock, CheckCircle, AlertTriangle, Percent, Package, Target, Clock2 } from 'lucide-react';
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
	Cell,
	RadialBarChart,
	RadialBar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentService from '@/services/api/AppointmentService';
import { formatCurrency } from '@/utils/currency';

// Componente de estatística
const StatCard = ({ title, value, description, icon, trend = null, trendValue = null, previousValue = null }) => {
	const Icon = icon;
	const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : '';
	const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

	const formatPrevious = (prev) => {
		if (prev === null || prev === undefined || isNaN(prev)) return null;

		// Se o valor atual já for formatado como moeda (começa com R$), o anterior também deve ser
		if (typeof value === 'string' && value.startsWith('R$')) {
			// Usar o formato de moeda global
			return `Anterior: R$ ${Number(prev).toFixed(2).replace('.', ',')}`;
		}

		// Se for um número, exibir formatado
		return `Anterior: ${prev}`;
	};

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
				<div className="flex items-center justify-between pt-1">
					{trend && (
						<div className="flex flex-col">
							<div className="flex items-center">
								<TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
								<span className={`text-xs font-medium ${trendColor}`}>{trendValue}</span>
							</div>
							{previousValue !== null && (
								<span className="text-xs text-gray-500">{formatPrevious(previousValue)}</span>
							)}
						</div>
					)}
					{description && (
						<span className="text-xs text-muted-foreground">{description}</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

// Componente para card de próximo agendamento
const AppointmentCard = ({ appointment, isFirst = false }) => {
	const { hasPermission } = useAuth();
	const canManageAppointments = hasPermission('manageAppointments');
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

// Componente de ProgressBar para mostrar progresso das metas
const ProgressBar = ({ value, maxValue, label, color = 'barber' }) => {
	const percentage = Math.min(Math.round((value / maxValue) * 100), 100);
	const colorClass = color === 'barber' ? 'from-barber-400 to-barber-600' : 'from-blue-400 to-blue-600';

	return (
		<div className="w-full space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium text-gray-700">{label}</span>
				<span className="font-semibold text-gray-800">{percentage}%</span>
			</div>
			<div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
				<div
					className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 ease-in-out`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

// Componente de Gráfico Circular para mostrar progresso
const CircularProgressChart = ({ value, maxValue, title, subtitle }) => {
	const percentage = Math.min(Math.round((value / maxValue) * 100), 100);

	// Implementação alternativa sem usar RadialBarChart
	return (
		<div className="relative">
			<div className="flex justify-center">
				<div className="relative h-48 w-48">
					{/* Círculo de fundo */}
					<div className="absolute inset-0 rounded-full bg-gray-100"></div>

					{/* Círculo de progresso com gradiente - usando clip para criar o arco */}
					<div
						className="absolute inset-0 rounded-full bg-gradient-to-r from-barber-400 to-barber-600"
						style={{
							clipPath: `polygon(50% 50%, 50% 0%, ${percentage <= 25
								? `${50 + percentage * 2}% ${50 - percentage * 2}%`
								: percentage <= 50
									? '100% 0%, 100% ' + (percentage - 25) * 4 + '%'
									: percentage <= 75
										? '100% 0%, 100% 100%, ' + (100 - (percentage - 50) * 4) + '% 100%'
										: '100% 0%, 100% 100%, 0% 100%, 0% ' + (100 - (percentage - 75) * 4) + '%'
								})`
						}}
					></div>

					{/* Círculo interno para criar efeito donut */}
					<div className="absolute inset-[15%] rounded-full bg-white flex items-center justify-center">
						<div className="text-center">
							<p className="text-3xl font-bold text-gray-800">{percentage}%</p>
							<p className="text-xs text-gray-600">{subtitle}</p>
						</div>
					</div>
				</div>
			</div>
			<div className="text-center mt-2">
				<h3 className="font-medium text-gray-800">{title}</h3>
			</div>
		</div>
	);
};

const Dashboard = () => {
	const { companySelected, user, hasPermission } = useAuth();
	const [dateRange, setDateRange] = useState<Date[]>([
		startOfMonth(new Date()),
		new Date()
	]);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState({
		revenue: { total: 0, trend: 0, previousTotal: 0 },
		clients: { total: 0, trend: 0, previousTotal: 0 },
		appointments: { total: 0, trend: 0, previousTotal: 0 },
		services: { total: 0, trend: 0, previousTotal: 0 },
		commission: { total: 0, trend: 0, previousTotal: 0 },
		productsSold: { total: 0, trend: 0, previousTotal: 0 },
	});
	const [userStats, setUserStats] = useState({
		revenue: { total: 0, trend: 0, previousTotal: 0 },
		clients: { total: 0, trend: 0, previousTotal: 0 },
		appointments: { total: 0, trend: 0, previousTotal: 0 },
		commission: { total: 0, trend: 0, previousTotal: 0 },
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
	const [productsSold, setProductsSold] = useState({
		total: 0,
		trend: 0,
		previousTotal: 0
	});
	const [pendingAppointments, setPendingAppointments] = useState([]);
	const [projectedCommission, setProjectedCommission] = useState(0);
	const [monthlyGoal, setMonthlyGoal] = useState(2000); // Meta mensal default - poderia vir do backend
	const [projectionData, setProjectionData] = useState({
		pendingAppointments: 0,
		totalPendingValue: 0,
		totalProjectedCommission: 0,
		netProjectedRevenue: 0,
		barberProjections: []
	});

	const statisticsService = new StatisticsService();
	const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

	useEffect(() => {
		if (!companySelected?.id) return;

		const loadDashboardData = async () => {
			setIsLoading(true);
			try {
				// Preparar datas para o filtro
				const startDate = dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : null;
				const endDate = dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : null;

				// Load dashboard statistics with date range
				const dashboardStatsResponse = await statisticsService.getDashboardStats(
					companySelected.id,
					'custom',
					startDate,
					endDate,
					!isAdmin ? user?.id : undefined // Passa o ID do usuário se não for admin
				);

				if (dashboardStatsResponse.success && dashboardStatsResponse.data) {
					setStats(dashboardStatsResponse.data);
				}

				// Load top services with date range
				const topServicesResponse = await statisticsService.getTopServices(
					companySelected.id,
					'custom',
					undefined, // userId undefined para trazer todos os serviços
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

					// Calcular estatísticas baseadas nas comissões
					if (isAdmin) {
						// Para administradores, calcular o total de atendimentos somando todos os barbeiros
						const totalAppointments = barberCommissionsResponse.data.reduce(
							(sum, barber) => sum + (barber.appointmentCount || 0), 0
						);

						// Atualizar estatísticas de atendimentos
						setStats(prev => ({
							...prev,
							appointments: {
								...prev.appointments,
								total: totalAppointments > 0 ? totalAppointments : prev.appointments.total
							}
						}));

						// Calcula clientes únicos se não vier do backend
						if (!dashboardStatsResponse.data?.clients?.total) {
							// Estima o número de clientes como 70% do número de atendimentos
							// Este é apenas um valor estimado, pois não temos dados reais de clientes únicos
							const estimatedClients = Math.round(totalAppointments * 0.7);
							setStats(prev => ({
								...prev,
								clients: {
									...prev.clients,
									total: estimatedClients > 0 ? estimatedClients : prev.clients.total
								}
							}));
						}
					}

					// Calcular a comissão do usuário logado e seus dados individuais
					if (user?.id) {
						const userBarberData = barberCommissionsResponse.data.find(
							barber => barber.id === user.id
						);

						if (userBarberData) {
							// Atualizar comissão do usuário e estatísticas
							setUserCommission(userBarberData.totalCommission || 0);

							// Atualizar dados do usuário com base no período selecionado
							setUserStats(prev => ({
								...prev,
								commission: {
									total: userBarberData.totalCommission || 0,
									trend: stats.commission.trend || 0,
									previousTotal: stats.commission.previousTotal || 0
								},
								revenue: {
									total: userBarberData.revenue || 0,
									trend: stats.revenue.trend || 0,
									previousTotal: stats.revenue.previousTotal || 0
								},
								appointments: {
									total: userBarberData.appointmentCount || 0,
									trend: stats.appointments.trend || 0,
									previousTotal: stats.appointments.previousTotal || 0
								},
								// Para clients, podemos obter do dashboardStats filtrando pelo usuário
								clients: {
									total: dashboardStatsResponse.data?.clients?.total || prev.clients.total,
									trend: dashboardStatsResponse.data?.clients?.trend || 0,
									previousTotal: dashboardStatsResponse.data?.clients?.previousTotal || 0
								}
							}));
						}
					}
				}

				// Load user-specific top services if user is a barber with date range
				if (user?.id && user?.role === 'USER') {
					const userServicesResponse = await statisticsService.getTopServices(
						companySelected.id,
						'custom',
						user.id, // Passando userId para filtrar por barbeiro específico
						startDate,
						endDate
					);

					if (userServicesResponse.success && userServicesResponse.data) {
						setUserTopServices(userServicesResponse.data);
					}
				} else {
					setUserTopServices(topServicesResponse.data || []);
				}

				// Load upcoming appointments - SEMPRE do dia atual, independente do filtro de período
				let appointmentsResponse;
				const canViewAllAppointments = hasPermission('viewAllAppointments');

				// Formatar a data atual como YYYY-MM-DD para o backend
				const currentDate = format(new Date(), 'yyyy-MM-dd');

				if (canViewAllAppointments) {
					appointmentsResponse = await AppointmentService.getAll(companySelected.id, currentDate);
				} else {
					appointmentsResponse = await AppointmentService.getByBarber(companySelected.id, currentDate);
				}

				if (appointmentsResponse?.success && appointmentsResponse.data) {
					// Se o usuário pode ver todos os agendamentos, armazena todos para a visão administrativa
					if (canViewAllAppointments) {
						setUpcomingAppointments(appointmentsResponse.data.slice(0, 5)); // Limita a 5 agendamentos
					}

					// Para usuários normais ou visão personalizada de administradores
					if (user?.role === 'USER' || !canViewAllAppointments) {
						// Se não pode ver todos, usa exatamente o que veio da API (já filtrado por barbeiro)
						// Caso contrário (admin vendo seus próprios), filtra da lista completa
						const filteredAppointments = !canViewAllAppointments
							? appointmentsResponse.data
							: appointmentsResponse.data.filter(appointment => appointment.userId === user.id);

						setUserAppointments(filteredAppointments.slice(0, 5)); // Limita a 5 agendamentos
					} else {
						setUserAppointments([]);
					}

					// Se for usuário normal, buscar todos os agendamentos (não apenas hoje)
					// para calcular pendentes e projeção de comissão
					if (user?.role === 'USER') {
						const allAppointmentsResponse = await AppointmentService.getByBarber(companySelected.id);

						if (allAppointmentsResponse?.success && allAppointmentsResponse.data) {
							// Filtrar apenas os agendamentos pendentes
							const pendingApps = allAppointmentsResponse.data.filter(
								app => app.status === 'PENDING'
							);

							setPendingAppointments(pendingApps);

							// Não calculamos mais a projeção aqui, pois agora usamos a API /statistics/projections
							// que tem a lógica correta de comissão

							/*
							// Calcular projeção de comissão baseada nos agendamentos pendentes
							// e na configuração de comissão do usuário
							const pendingValue = pendingApps.reduce((sum, app) => sum + app.value, 0);

							// Buscar a comissão do usuário para calcular a projeção
							const userBarber = barberCommissionsResponse?.data?.find(
								barber => barber.id === user.id
							);

							// Se temos o usuário e sua configuração de comissão
							if (userBarber) {
								// Calcular a porcentagem média de comissão com base na receita e comissão atual
								const commissionPercentage = userBarber.revenue > 0
									? userBarber.totalCommission / userBarber.revenue
									: 0.2; // Default 20%

								// Aplicar a mesma porcentagem aos agendamentos pendentes
								const projectedValue = pendingValue * commissionPercentage;
								setProjectedCommission(projectedValue);
							}
							*/
						}
					}
				}

				// Update goals with current data
				if (isAdmin) {
					console.log('Atualizando metas de administrador:', {
						revenue: dashboardStatsResponse.data?.revenue.total || 0,
						appointments: stats.appointments.total,
						clients: dashboardStatsResponse.data?.clients.total || 0
					});

					setGoals([
						{
							name: 'Faturamento',
							current: `R$ ${(dashboardStatsResponse.data?.revenue.total || 0).toFixed(2).replace('.', ',')}`,
						},
						{
							name: 'Atendimentos',
							current: (stats.appointments.total || 0).toString(),
						},
						{
							name: 'Clientes',
							current: (dashboardStatsResponse.data?.clients.total || 0).toString(),
						}
					]);
				} else {
					// Dados personalizados para barbeiros
					const userRevenue = userStats.revenue.total;
					const userAppointmentsCount = userStats.appointments.total;
					const userClients = userStats.clients.total;

					console.log('Atualizando metas de barbeiro:', {
						revenue: userRevenue,
						appointments: userAppointmentsCount,
						clients: userClients
					});

					setGoals([
						{
							name: 'Meu Faturamento',
							current: `R$ ${userRevenue.toFixed(2).replace('.', ',')}`,
						},
						{
							name: 'Meus Atendimentos',
							current: userAppointmentsCount.toString(),
						},
						{
							name: 'Meus Clientes',
							current: userClients.toString(),
						}
					]);
				}

				// Se for admin/manager, buscar produtos vendidos no período
				if (isAdmin) {
					// Usar os dados de produtos vendidos diretamente do dashboard
					if (dashboardStatsResponse.success && dashboardStatsResponse.data?.productsSold) {
						console.log('PRODUTOS VENDIDOS DO DASHBOARD (ADMIN):', {
							data: dashboardStatsResponse.data.productsSold,
							total: dashboardStatsResponse.data.productsSold.total,
							trend: dashboardStatsResponse.data.productsSold.trend,
							período: { inicio: startDate, fim: endDate }
						});
						setProductsSold({
							total: dashboardStatsResponse.data.productsSold.total || 0,
							trend: dashboardStatsResponse.data.productsSold.trend || 0,
							previousTotal: dashboardStatsResponse.data.productsSold.previousTotal || 0
						});
					}
				} else {
					// Se for usuário normal, os produtos vendidos já estarão filtrados por usuário no dashboard stats
					if (dashboardStatsResponse.success && dashboardStatsResponse.data?.productsSold) {
						console.log('PRODUTOS VENDIDOS DO DASHBOARD (USER):', {
							data: dashboardStatsResponse.data.productsSold,
							total: dashboardStatsResponse.data.productsSold.total,
							trend: dashboardStatsResponse.data.productsSold.trend,
							userId: user?.id,
							período: { inicio: startDate, fim: endDate }
						});
						setProductsSold({
							total: dashboardStatsResponse.data.productsSold.total || 0,
							trend: dashboardStatsResponse.data.productsSold.trend || 0,
							previousTotal: dashboardStatsResponse.data.productsSold.previousTotal || 0
						});
					}
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
	}, [companySelected?.id, dateRange, user?.id, user?.role, hasPermission]);

	useEffect(() => {
		if (!companySelected?.id) return;

		const loadProjections = async () => {
			try {
				const projectionsResponse = await statisticsService.getProjections(companySelected.id);

				if (projectionsResponse.success && projectionsResponse.data) {
					setProjectionData(projectionsResponse.data);

					// Para usuários normais, usar os dados da API para a projeção individual
					if (!isAdmin && user?.id) {
						// Encontrar a projeção específica para este usuário
						const userProjection = projectionsResponse.data.barberProjections.find(
							barber => barber.id === user.id
						);

						if (userProjection) {
							console.log('Projeção de comissão carregada da API:', userProjection);
							// Atualizar a projeção de comissão com o valor calculado pelo backend
							setProjectedCommission(userProjection.projectedCommission);

							// Também atualizar a lista de agendamentos pendentes para manter consistência
							const pendingApps = await AppointmentService.getByBarber(companySelected.id);
							if (pendingApps?.success && pendingApps.data) {
								const filteredPendingApps = pendingApps.data.filter(
									app => app.status === 'PENDING'
								);
								setPendingAppointments(filteredPendingApps);
							}
						}
					}
				}
			} catch (error) {
				console.error('Erro ao carregar projeções:', error);
			}
		};

		// Carregar projeções para todos os usuários (admin e normais)
		loadProjections();
	}, [companySelected?.id, isAdmin, user?.id]);

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
							<p className="text-gray-600 mt-1">
								{dateRange[0] && dateRange[1]
									? `Dados de ${format(dateRange[0], 'dd/MM/yyyy')} a ${format(dateRange[1], 'dd/MM/yyyy')}`
									: 'Visualize seus dados e próximos compromissos'}
							</p>
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
								<TabsTrigger value="appointments">Agendamentos de Hoje</TabsTrigger>
								{!isAdmin && <TabsTrigger value="goals">Minhas Metas</TabsTrigger>}
							</TabsList>

							<TabsContent value="overview">
								{/* Cards de estatísticas */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
									<StatCard
										title={isAdmin ? "Receita no Período" : "Minha Receita no Período"}
										value={formatCurrency(isAdmin ? stats.revenue.total : userStats.revenue.total)}
										description="No período selecionado"
										icon={DollarSign}
										trend={getTrendDirection(isAdmin ? stats.revenue.trend : userStats.revenue.trend)}
										trendValue={formatTrend(isAdmin ? stats.revenue.trend : userStats.revenue.trend)}
										previousValue={isAdmin ? stats.revenue.previousTotal : userStats.revenue.previousTotal}
									/>
									<StatCard
										title={isAdmin ? "Atendimentos no Período" : "Meus Atendimentos no Período"}
										value={isAdmin ? stats.appointments.total : userStats.appointments.total}
										description="No período selecionado"
										icon={CalendarIcon}
										trend={getTrendDirection(isAdmin ? stats.appointments.trend : userStats.appointments.trend)}
										trendValue={formatTrend(isAdmin ? stats.appointments.trend : userStats.appointments.trend)}
										previousValue={isAdmin ? stats.appointments.previousTotal : userStats.appointments.previousTotal}
									/>
									{!isAdmin && (
										<StatCard
											title="Minha Comissão no Período"
											value={formatCurrency(userStats.commission.total)}
											description="No período selecionado"
											icon={DollarSign}
											trend={getTrendDirection(userStats.commission.trend)}
											trendValue={formatTrend(userStats.commission.trend)}
											previousValue={userStats.commission.previousTotal}
										/>
									)}
									<StatCard
										title={isAdmin ? "Produtos Vendidos" : "Meus Produtos Vendidos"}
										value={productsSold.total || 0}
										description="No período selecionado"
										icon={Package}
										trend={getTrendDirection(productsSold.trend)}
										trendValue={formatTrend(productsSold.trend)}
										previousValue={productsSold.previousTotal || 0}
									/>
								</div>

								{/* Conteúdo diferente para admin e usuário normal */}
								{isAdmin ? (
									<>
										{/* Dados Avançados para Admin */}
										<div className="space-y-6 mb-8">
											<Card className="shadow-md hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="text-lg text-gray-800">Projeção de Faturamento</CardTitle>
													<CardDescription>Previsão de receita com base em agendamentos pendentes</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
														<div className="bg-amber-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Agendamentos Pendentes</h3>
															<p className="text-2xl font-bold text-amber-700">
																{projectionData.pendingAppointments}
															</p>
															<p className="text-xs text-gray-500 mt-1">Total de todos os barbeiros</p>
														</div>

														<div className="bg-green-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Faturamento Previsto</h3>
															<p className="text-2xl font-bold text-green-700">
																{formatCurrency(projectionData.totalPendingValue)}
															</p>
															<p className="text-xs text-gray-500 mt-1">De agendamentos pendentes</p>
														</div>

														<div className="bg-blue-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Comissões Projetadas</h3>
															<p className="text-2xl font-bold text-blue-700">
																{formatCurrency(projectionData.totalProjectedCommission)}
															</p>
															<p className="text-xs text-gray-500 mt-1">Estimativa para barbeiros</p>
														</div>

														<div className="bg-purple-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Receita Líquida Projetada</h3>
															<p className="text-2xl font-bold text-purple-700">
																{formatCurrency(projectionData.netProjectedRevenue)}
															</p>
															<p className="text-xs text-gray-500 mt-1">Após pagamento de comissões</p>
														</div>
													</div>

													<div className="mt-6">
														<h3 className="text-sm font-medium text-gray-700 mb-4">Projeção por Barbeiro</h3>
														<div className="space-y-5">
															{projectionData.barberProjections.map((barber) => (
																<div key={barber.id} className="space-y-2">
																	<div className="flex items-center justify-between">
																		<div className="flex items-center">
																			<span className="font-medium text-gray-800 mr-2">{barber.name}</span>
																			<Badge variant="outline" className="text-xs">
																				{barber.pendingAppointments} agendamentos
																			</Badge>
																		</div>
																		<div className="flex items-center space-x-3">
																			<div className="text-right">
																				<span className="text-xs text-gray-500 block">Faturamento</span>
																				<span className="text-sm font-medium text-gray-700">{formatCurrency(barber.pendingValue)}</span>
																			</div>
																			<div className="text-right">
																				<span className="text-xs text-gray-500 block">Comissão ({barber.commissionPercentage}%)</span>
																				<span className="text-sm font-medium text-green-600">{formatCurrency(barber.projectedCommission)}</span>
																			</div>
																		</div>
																	</div>
																	<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
																		<div
																			className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
																			style={{ width: `${Math.min((barber.pendingValue / stats.revenue.total) * 100, 100)}%` }}
																		></div>
																	</div>
																</div>
															))}
														</div>
													</div>
												</CardContent>
											</Card>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<Card className="shadow-md hover:shadow-lg transition-shadow">
													<CardHeader>
														<CardTitle className="text-lg text-gray-800">Análise de Produtividade</CardTitle>
														<CardDescription>Comparativo de eficiência dos barbeiros</CardDescription>
													</CardHeader>
													<CardContent>
														<div className="space-y-5">
															{barberCommissions.map((barber) => {
																// Cálculos de produtividade
																const efficiency = barber.appointmentCount > 0
																	? barber.revenue / barber.appointmentCount
																	: 0;
																const avgEfficiency = barberCommissions.reduce((sum, b) =>
																	b.appointmentCount > 0 ? sum + (b.revenue / b.appointmentCount) : sum, 0
																) / barberCommissions.filter(b => b.appointmentCount > 0).length;

																const efficiencyPercentage = avgEfficiency > 0
																	? (efficiency / avgEfficiency) * 100
																	: 0;

																return (
																	<div key={barber.id} className="space-y-2">
																		<div className="flex items-center justify-between">
																			<span className="font-medium text-gray-800">{barber.name}</span>
																			<div className="flex items-center">
																				<span className="text-sm font-medium text-gray-700">
																					{formatCurrency(efficiency)} / atendimento
																				</span>
																				<span className={`ml-2 text-xs font-medium ${efficiency > avgEfficiency ? 'text-green-600' : 'text-amber-600'
																					}`}>
																					{efficiency > avgEfficiency ? '+' : ''}
																					{Math.round(efficiencyPercentage - 100)}%
																				</span>
																			</div>
																		</div>
																		<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
																			<div
																				className={`h-full rounded-full ${efficiency > avgEfficiency
																					? 'bg-gradient-to-r from-green-400 to-green-600'
																					: 'bg-gradient-to-r from-amber-400 to-amber-600'
																					}`}
																				style={{ width: `${Math.min(efficiencyPercentage, 200)}%` }}
																			></div>
																		</div>
																	</div>
																);
															})}
														</div>
													</CardContent>
												</Card>

												<Card className="shadow-md hover:shadow-lg transition-shadow">
													<CardHeader>
														<CardTitle className="text-lg text-gray-800">Metas e Desempenho</CardTitle>
														<CardDescription>Progresso das metas da empresa</CardDescription>
													</CardHeader>
													<CardContent>
														<div className="space-y-6">
															<div>
																<div className="flex items-center justify-between mb-2">
																	<h3 className="text-sm font-medium text-gray-700">Meta de Faturamento Mensal</h3>
																	<span className="text-sm font-medium text-gray-700">
																		{formatCurrency(stats.revenue.total)} / {formatCurrency(monthlyGoal * 5)}
																	</span>
																</div>
																<ProgressBar
																	value={stats.revenue.total}
																	maxValue={monthlyGoal * 5}
																	label="Progresso atual"
																/>
																<div className="mt-1 flex justify-between text-xs text-gray-500">
																	<span>Atual: {Math.round((stats.revenue.total / (monthlyGoal * 5)) * 100)}%</span>
																	<span>Restante: {formatCurrency(Math.max((monthlyGoal * 5) - stats.revenue.total, 0))}</span>
																</div>
															</div>

															<div>
																<div className="flex items-center justify-between mb-2">
																	<h3 className="text-sm font-medium text-gray-700">Meta + Agendamentos Pendentes</h3>
																	<span className="text-sm font-medium text-gray-700">
																		{formatCurrency(stats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0))} / {formatCurrency(monthlyGoal * 5)}
																	</span>
																</div>
																<ProgressBar
																	value={stats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0)}
																	maxValue={monthlyGoal * 5}
																	label="Projeção"
																	color="blue"
																/>
															</div>
														</div>
													</CardContent>
												</Card>
											</div>
										</div>

										{/* Metas e Barbeiros - mantido apenas o sumário de comissões */}
										<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
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

											<Card className="shadow-md hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="text-lg text-gray-800">Dados do período</CardTitle>
													<CardDescription>Resumo dos principais indicadores</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="space-y-6">
														{goals.map((goal) => (
															<div key={goal.name} className="space-y-2 bg-gray-50 p-3 rounded-lg">
																<div className="flex items-center justify-between text-sm">
																	<span className="font-medium text-gray-700">{goal.name}</span>
																	<span className="text-barber-700 font-semibold text-md">
																		{goal.current || "0"}
																	</span>
																</div>
															</div>
														))}
													</div>
												</CardContent>
											</Card>
										</div>
									</>
								) : (
									<>
										{/* Gráficos para usuários normais */}
										<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
											<Card className="shadow-md hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="text-lg text-gray-800">Meu Faturamento por Serviço</CardTitle>
													<CardDescription>Distribuição de receita por serviço</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="h-72">
														{userTopServices.length > 0 ? (
															<ResponsiveContainer width="100%" height="100%">
																<BarChart
																	data={userTopServices}
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
													<CardTitle className="text-lg text-gray-800">Meus Serviços Mais Realizados</CardTitle>
													<CardDescription>Distribuição por quantidade de serviços</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="h-72">
														{userTopServices.length > 0 ? (
															<ResponsiveContainer width="100%" height="100%">
																<PieChart>
																	<Pie
																		data={userTopServices}
																		cx="50%"
																		cy="50%"
																		labelLine={true}
																		outerRadius={90}
																		fill="#8884d8"
																		dataKey="quantity"
																		nameKey="service"
																		label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
																	>
																		{userTopServices.map((entry, index) => (
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

										{/* Visão Financeira para usuários normais */}
										<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
											<Card className="lg:col-span-3 shadow-md hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="text-lg text-gray-800">Visão Financeira</CardTitle>
													<CardDescription>Resumo dos ganhos atuais e futuros</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div className="bg-amber-50 rounded-lg p-4">
															<div className="flex items-center mb-2">
																<Clock2 className="h-5 w-5 text-amber-600 mr-2" />
																<h4 className="font-medium text-gray-800">Agendamentos Pendentes</h4>
															</div>
															<p className="text-2xl font-bold text-amber-700">{pendingAppointments.length}</p>
															<p className="text-sm text-gray-600 mt-1">
																{pendingAppointments.length === 1
																	? "1 agendamento a realizar"
																	: `${pendingAppointments.length} agendamentos a realizar`}
															</p>
															<div className="mt-2">
																{pendingAppointments.length > 0 && (
																	<span className="text-xs text-gray-600">
																		Próximo: {pendingAppointments[0]?.client?.name} - {format(new Date(pendingAppointments[0]?.scheduledTime), 'dd/MM/yyyy HH:mm')}
																	</span>
																)}
															</div>
														</div>
														<div className="bg-blue-50 rounded-lg p-4">
															<div className="flex items-center mb-2">
																<Target className="h-5 w-5 text-blue-600 mr-2" />
																<h4 className="font-medium text-gray-800">Projeção de Comissão</h4>
															</div>
															<p className="text-2xl font-bold text-blue-700">{formatCurrency(projectedCommission)}</p>
															<p className="text-sm text-gray-600 mt-1">Comissão dos agendamentos pendentes</p>
															<div className="flex items-center mt-2">
																<span className="text-xs font-medium text-blue-600">
																	+{formatCurrency(projectedCommission)} potencial
																</span>
																<div className="ml-auto flex items-center">
																	<TrendingUp className="h-3.5 w-3.5 text-blue-600 mr-1" />
																	<span className="text-xs font-medium text-blue-600">
																		{projectedCommission > 0 && userStats.commission.total > 0
																			? `+${Math.round((projectedCommission / userStats.commission.total) * 100)}%`
																			: "+0%"}
																	</span>
																</div>
															</div>
														</div>
													</div>
													<div className="mt-4 p-4 bg-gray-50 rounded-lg">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center">
																<DollarSign className="h-4 w-4 text-green-600 mr-1" />
																<span className="font-medium text-gray-800">Faturamento Total</span>
															</div>
															<span className="font-medium text-gray-800">
																{formatCurrency(userStats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0))}
															</span>
														</div>
														<div className="flex items-center justify-between text-xs text-gray-600">
															<span>Atual: {formatCurrency(userStats.revenue.total)}</span>
															<span>Pendente: {formatCurrency(pendingAppointments.reduce((sum, app) => sum + app.value, 0))}</span>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>
									</>
								)}
							</TabsContent>

							<TabsContent value="appointments">
								<Card className="shadow-md hover:shadow-lg transition-shadow">
									<CardHeader>
										<CardTitle className="text-lg text-gray-800">
											{isAdmin ? "Próximos Agendamentos" : "Meus Próximos Agendamentos"}
										</CardTitle>
										<CardDescription>
											Agendamentos para hoje ({format(new Date(), 'dd/MM/yyyy')})
										</CardDescription>
									</CardHeader>
									<CardContent>
										{renderAppointments()}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="goals">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
									<Card className="shadow-md hover:shadow-lg transition-shadow">
										<CardHeader>
											<CardTitle className="text-lg text-gray-800">Meta de Faturamento Mensal</CardTitle>
											<CardDescription>Progresso em relação à meta de faturamento</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
												<div className="w-full md:w-1/2">
													<CircularProgressChart
														value={userStats.revenue.total}
														maxValue={monthlyGoal}
														title="Progresso atual"
														subtitle="da meta mensal"
													/>
												</div>
												<div className="w-full md:w-1/2">
													<CircularProgressChart
														value={userStats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0)}
														maxValue={monthlyGoal}
														title="Projeção"
														subtitle="com pendentes"
													/>
												</div>
											</div>

											<div className="mt-6 space-y-3">
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">Faturamento acumulado:</span>
													<span className="font-medium text-gray-800">{formatCurrency(userStats.revenue.total)}</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">Meta de faturamento:</span>
													<span className="font-medium text-gray-800">{formatCurrency(monthlyGoal)}</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">Pendente para alcançar a meta:</span>
													<span className="font-medium text-gray-800">{formatCurrency(Math.max(monthlyGoal - userStats.revenue.total, 0))}</span>
												</div>
											</div>
										</CardContent>
									</Card>

									<Card className="shadow-md hover:shadow-lg transition-shadow">
										<CardHeader>
											<CardTitle className="text-lg text-gray-800">Comissões</CardTitle>
											<CardDescription>Comissões atuais e projetadas</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div className="p-4 bg-green-50 rounded-lg">
													<div className="flex items-center mb-2">
														<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
														<h4 className="font-medium text-gray-800">Comissão Acumulada</h4>
													</div>
													<p className="text-2xl font-bold text-green-600">{formatCurrency(userStats.commission.total)}</p>
													<p className="text-sm text-gray-600 mt-1">No período selecionado</p>
												</div>
												<div className="p-4 bg-blue-50 rounded-lg">
													<div className="flex items-center mb-2">
														<Clock className="h-5 w-5 text-blue-500 mr-2" />
														<h4 className="font-medium text-gray-800">Comissão Projetada</h4>
													</div>
													<p className="text-2xl font-bold text-blue-600">{formatCurrency(projectedCommission)}</p>
													<p className="text-sm text-gray-600 mt-1">De agendamentos pendentes</p>
												</div>
											</div>

											<div className="mt-6">
												<ProgressBar
													value={userStats.revenue.total}
													maxValue={monthlyGoal}
													label="Progresso de faturamento"
												/>

												<div className="mt-4">
													<ProgressBar
														value={userStats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0)}
														maxValue={monthlyGoal}
														label="Projeção com pendentes"
														color="blue"
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								<Card className="shadow-md hover:shadow-lg transition-shadow">
									<CardHeader>
										<CardTitle className="text-lg text-gray-800">Detalhes dos Agendamentos Pendentes</CardTitle>
										<CardDescription>Agendamentos que ainda serão realizados</CardDescription>
									</CardHeader>
									<CardContent>
										{pendingAppointments.length > 0 ? (
											<div className="space-y-4">
												{pendingAppointments.slice(0, 5).map((appointment) => (
													<div key={appointment.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
														<div className="flex items-center justify-between mb-1">
															<span className="font-medium text-gray-800">{appointment.client?.name}</span>
															<span className="text-sm text-barber-600 font-medium">
																{formatCurrency(appointment.value)}
															</span>
														</div>
														<div className="flex items-center justify-between text-sm text-gray-600">
															<div className="flex items-center">
																<CalendarIcon className="h-3.5 w-3.5 mr-1" />
																<span>{format(new Date(appointment.scheduledTime), 'dd/MM/yyyy')}</span>
																<Clock className="h-3.5 w-3.5 ml-2 mr-1" />
																<span>{format(new Date(appointment.scheduledTime), 'HH:mm')}</span>
															</div>
															<span>
																{appointment.services.length} serviço{appointment.services.length !== 1 ? 's' : ''}
															</span>
														</div>
													</div>
												))}
												{pendingAppointments.length > 5 && (
													<div className="text-center mt-2">
														<p className="text-sm text-gray-600">
															+{pendingAppointments.length - 5} outros agendamentos pendentes
														</p>
													</div>
												)}
											</div>
										) : (
											<div className="flex flex-col items-center justify-center py-8">
												<Calendar className="h-12 w-12 text-gray-300 mb-2" />
												<h3 className="text-lg font-medium text-gray-700">Sem agendamentos pendentes</h3>
												<p className="text-gray-500 text-sm mt-1">
													Você não possui agendamentos futuros no momento.
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>

					{/* Coluna lateral - Próximos agendamentos */}
					<div className="col-span-12 lg:col-span-4">
						<Card className="shadow-md overflow-hidden h-full">
							<CardHeader className="bg-barber-50 border-b">
								<CardTitle className="text-lg text-gray-800 flex items-center">
									<Calendar className="h-5 w-5 mr-2 text-barber-600" />
									{isAdmin ? "Agendamentos de Hoje" : "Meus Agendamentos de Hoje"}
								</CardTitle>
								<CardDescription>Compromissos agendados para hoje</CardDescription>
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
										Ver todos os agendamentos de hoje
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
