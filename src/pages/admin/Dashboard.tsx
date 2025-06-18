import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Scissors, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, CalendarIcon, Clock, CheckCircle, AlertTriangle, Percent, Package, Target, Clock2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { StatisticsService } from '@/services/api/StatisticsService';
import { toast } from '@/components/ui/use-toast';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
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
import goalService from '@/services/api/GoalService';

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
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

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
		startOfDay(new Date()),
		endOfDay(new Date())
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
	const [monthlyGoal, setMonthlyGoal] = useState(0); // Meta mensal será carregada do backend
	const [projectionData, setProjectionData] = useState({
		pendingAppointments: 0,
		totalPendingValue: 0,
		totalProjectedCommission: 0,
		netProjectedRevenue: 0,
		barberProjections: []
	});
	const [periodPendingAppointments, setPeriodPendingAppointments] = useState([]);
	const [periodPendingValue, setPeriodPendingValue] = useState(0);
	const [currentMonthStats, setCurrentMonthStats] = useState({
		revenue: { total: 0, trend: 0, previousTotal: 0 },
		commission: { total: 0, trend: 0, previousTotal: 0 },
		appointments: { total: 0, trend: 0, previousTotal: 0 },
	});
	const [currentMonthPendingCommission, setCurrentMonthPendingCommission] = useState(0);
	const [comissoesProjetadasValor, setComissoesProjetadasValor] = useState("R$ 0,00");

	const statisticsService = new StatisticsService();
	const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

	useEffect(() => {
		if (!companySelected?.id) return;

		const loadDashboardData = async () => {
			try {
				setIsLoading(true);

				// Formatar as datas para enviar ao backend
				const startDate = format(dateRange[0] || startOfDay(new Date()), 'yyyy-MM-dd');
				const endDate = format(dateRange[1] || endOfDay(new Date()), 'yyyy-MM-dd');

				console.log('[Dashboard] Buscando estatísticas:', {
					startDate,
					endDate,
					companyId: companySelected.id,
					userId: !isAdmin ? user?.id : undefined,
					dateRange
				});

				// Carregar estatísticas do dashboard com período personalizado
				const dashboardResponse = await statisticsService.getDashboardStats(
					companySelected.id,
					'custom',
					startDate,
					endDate,
					!isAdmin ? user?.id : undefined
				);

				console.log('[Dashboard] Resposta das estatísticas:', {
					success: dashboardResponse.success,
					data: dashboardResponse.data,
					period: { startDate, endDate }
				});

				if (dashboardResponse.success && dashboardResponse.data) {
					console.log('[Dashboard] Atualizando estatísticas:', {
						revenue: dashboardResponse.data.revenue,
						appointments: dashboardResponse.data.appointments
					});
					setStats(dashboardResponse.data);
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
				console.log('[Dashboard] Buscando comissões dos barbeiros:', {
					companyId: companySelected.id,
					period: 'custom',
					dateRange: {
						startDate,
						endDate
					}
				});

				const barberCommissionsResponse = await statisticsService.getBarberCommissions(
					companySelected.id,
					'custom',
					startDate,
					endDate
				);

				console.log('[Dashboard] Resposta das comissões:', {
					success: barberCommissionsResponse.success,
					data: barberCommissionsResponse.data
				});

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
						if (!stats.clients?.total) {
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

						// Para administradores, buscar agendamentos pendentes do período selecionado
						try {
							const allAppointmentsResponse = await AppointmentService.getAll(companySelected.id);

							if (allAppointmentsResponse?.success && allAppointmentsResponse.data) {
								const pendingApps = allAppointmentsResponse.data.filter(app => {
									if (app.status !== 'PENDING') return false;

									// Filtrar por período se definido
									if (startDate && endDate) {
										const appDate = format(new Date(app.scheduledTime), 'yyyy-MM-dd');
										return appDate >= startDate && appDate <= endDate;
									}

									return true;
								});

								// Calcular valor total dos agendamentos pendentes
								const periodPendingValue = pendingApps.reduce((sum, app) => sum + app.value, 0);
								setPeriodPendingValue(periodPendingValue);
								setPeriodPendingAppointments(pendingApps);

								// Atualizar projeção de dados
								setProjectionData({
									pendingAppointments: pendingApps.length,
									totalPendingValue: periodPendingValue,
									totalProjectedCommission: pendingApps.reduce((sum, app) => sum + (app.value * 0.2), 0), // 20% de comissão
									netProjectedRevenue: periodPendingValue,
									barberProjections: []
								});
							}
						} catch (error) {
							console.error('Erro ao buscar agendamentos pendentes:', error);
						}
					}
				}

				// Load goals if user is not admin
				if (!isAdmin && user?.id) {
					const currentDate = new Date();
					const currentMonth = currentDate.getMonth() + 1;
					const currentYear = currentDate.getFullYear();

					const goalsResponse = await goalService.getUserGoals(currentMonth, currentYear);

					if (goalsResponse.success && goalsResponse.data) {
						// Manter o formato original das metas
						setGoals([
							{ name: 'Faturamento', current: 'R$ 0,00' },
							{ name: 'Clientes', current: '0' },
							{ name: 'Agendamentos', current: '0' }
						]);
					}
				}
			} catch (error) {
				console.error('Erro ao carregar dados do dashboard:', error);
				toast({
					title: "Erro",
					description: "Erro ao carregar dados do dashboard",
					variant: "destructive"
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadDashboardData();
	}, [companySelected?.id, dateRange, user?.id, isAdmin, hasPermission]);

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

	// Carregar meta do usuário para o mês atual (apenas para usuários não-admin)
	useEffect(() => {
		if (!companySelected?.id || !user?.id || isAdmin) return;

		const loadUserGoal = async () => {
			try {
				const currentDate = new Date();
				const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
				const currentYear = currentDate.getFullYear();

				const response = await goalService.getUserGoals(currentMonth, currentYear);

				if (response.success && response.data && response.data.length > 0) {
					// Buscar a meta do usuário atual
					const userGoal = response.data.find(goal => goal.userId === user.id);
					if (userGoal) {
						setMonthlyGoal(userGoal.target);
					} else {
						// Se não encontrar meta específica, usar 0
						setMonthlyGoal(0);
					}
				} else {
					// Se não há metas, usar 0
					setMonthlyGoal(0);
				}
			} catch (error) {
				console.error('Erro ao carregar meta do usuário:', error);
				setMonthlyGoal(0);
			}
		};

		loadUserGoal();
	}, [companySelected?.id, user?.id, isAdmin]);

	// Efeito para calcular comissões projetadas
	useEffect(() => {
		const calcularComissoesProjetadas = async () => {
			try {
				// Filtra agendamentos pelo período selecionado
				const startDate = format(dateRange[0] || startOfDay(new Date()), 'yyyy-MM-dd');
				const endDate = format(dateRange[1] || endOfDay(new Date()), 'yyyy-MM-dd');

				// Filtra agendamentos do período
				const agendamentosDoPeriodo = periodPendingAppointments.filter(app => {
					const appDate = format(new Date(app.scheduledTime), 'yyyy-MM-dd');
					return appDate >= startDate && appDate <= endDate;
				});

				// Calcula comissões por barbeiro
				const comissoesProjetadas = await agendamentosDoPeriodo.reduce(async (totalPromise, agendamento) => {
					const total = await totalPromise;

					// Buscar configuração de comissão do barbeiro
					const commissionConfig = await statisticsService.getBarberCommissionConfig(
						companySelected.id,
						agendamento.user?.id || 0
					);

					// Calcula comissão para cada serviço do agendamento
					const comissaoAgendamento = await agendamento.services.reduce(async (sumPromise, servico) => {
						const sum = await sumPromise;
						const valorServico = servico.service.price * (servico.quantity || 1);
						let percentualComissao = 20; // Padrão caso não tenha configuração

						if (commissionConfig?.data) {
							if (commissionConfig.data.commissionType === 'SERVICES') {
								// Buscar regra específica para este serviço
								const serviceRule = commissionConfig.data.rules?.find(
									rule => rule.serviceId === servico.service.id
								);
								if (serviceRule) {
									percentualComissao = serviceRule.percentage;
								}
							} else if (commissionConfig.data.commissionType === 'GENERAL') {
								percentualComissao = commissionConfig.data.commissionValue;
							}
						}

						const comissaoServico = (valorServico * percentualComissao) / 100;
						
						console.log(`[Dashboard] Comissão calculada:`, {
							barbeiro: agendamento.user?.name,
							servico: servico.service.name,
							valor: valorServico,
							percentual: percentualComissao,
							comissao: comissaoServico,
							tipoComissao: commissionConfig?.data?.commissionType || 'PADRAO'
						});

						return sum + comissaoServico;
					}, Promise.resolve(0));

					return total + comissaoAgendamento;
				}, Promise.resolve(0));

				console.log('[Dashboard] Resumo comissões:', {
					periodo: { startDate, endDate },
					agendamentos: agendamentosDoPeriodo.length,
					total: comissoesProjetadas
				});

				setComissoesProjetadasValor(formatCurrency(comissoesProjetadas));
			} catch (error) {
				console.error('Erro ao calcular comissões projetadas:', error);
				setComissoesProjetadasValor("R$ 0,00");
			}
		};

		calcularComissoesProjetadas();
	}, [dateRange, periodPendingAppointments, companySelected.id]);

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
								{isAdmin ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
										<StatCard
											title="Receita no Período"
											value={formatCurrency(stats.revenue.total || 0)}
											description="Receita de agendamentos finalizados"
											icon={DollarSign}
											trend={getTrendDirection(stats.revenue.trend)}
											trendValue={formatTrend(stats.revenue.trend)}
											previousValue={stats.revenue.previousTotal}
										/>
										<StatCard
											title="Atendimentos no Período"
											value={stats.appointments.total}
											description="No período selecionado"
											icon={CalendarIcon}
											trend={getTrendDirection(stats.appointments.trend)}
											trendValue={formatTrend(stats.appointments.trend)}
											previousValue={stats.appointments.previousTotal}
										/>
										<StatCard
											title="Produtos Vendidos"
											value={productsSold.total || 0}
											description="No período selecionado"
											icon={Package}
											trend={getTrendDirection(productsSold.trend)}
											trendValue={formatTrend(productsSold.trend)}
											previousValue={productsSold.previousTotal || 0}
										/>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
										<StatCard
											title="Minha Receita no Período"
											value={formatCurrency(userStats.revenue.total)}
											description="No período selecionado"
											icon={DollarSign}
											trend={getTrendDirection(userStats.revenue.trend)}
											trendValue={formatTrend(userStats.revenue.trend)}
											previousValue={userStats.revenue.previousTotal}
										/>
										<StatCard
											title="Meus Atendimentos no Período"
											value={userStats.appointments.total}
											description="No período selecionado"
											icon={CalendarIcon}
											trend={getTrendDirection(userStats.appointments.trend)}
											trendValue={formatTrend(userStats.appointments.trend)}
											previousValue={userStats.appointments.previousTotal}
										/>
										<StatCard
											title="Minha Comissão no Período"
											value={formatCurrency(userStats.commission.total)}
											description="No período selecionado"
											icon={DollarSign}
											trend={getTrendDirection(userStats.commission.trend)}
											trendValue={formatTrend(userStats.commission.trend)}
											previousValue={userStats.commission.previousTotal}
										/>
										<StatCard
											title="Meus Produtos Vendidos"
											value={productsSold.total || 0}
											description="No período selecionado"
											icon={Package}
											trend={getTrendDirection(productsSold.trend)}
											trendValue={formatTrend(productsSold.trend)}
											previousValue={productsSold.previousTotal || 0}
										/>
									</div>
								)}

								{/* Conteúdo diferente para admin e usuário normal */}
								{isAdmin ? (
									<>
										{/* Dados Avançados para Admin */}
										<div className="space-y-6 mb-8">
											<Card className="shadow-md hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="text-lg text-gray-800">Projeção de Faturamento</CardTitle>
													<CardDescription>Previsão completa de receita do período selecionado</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
														<div className="bg-amber-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Agendamentos Pendentes</h3>
															<p className="text-2xl font-bold text-amber-700">
																{periodPendingAppointments.length}
															</p>
															<p className="text-xs text-gray-500 mt-1">No período selecionado</p>
														</div>

														<div className="bg-green-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Faturamento Previsto</h3>
															<p className="text-2xl font-bold text-green-700">
																{formatCurrency(periodPendingValue)}
															</p>
															<p className="text-xs text-gray-500 mt-1">De agendamentos pendentes</p>
														</div>

														<div className="bg-blue-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Comissões Projetadas</h3>
															<p className="text-2xl font-bold text-blue-700">
																{comissoesProjetadasValor}
															</p>
															<p className="text-xs text-gray-500 mt-1">No período selecionado</p>
														</div>

														<div className="bg-purple-50 p-4 rounded-lg">
															<h3 className="text-sm font-medium text-gray-700 mb-1">Receita Líquida Projetada</h3>
															<p className="text-2xl font-bold text-purple-700">
																{formatCurrency(periodPendingValue - parseFloat(comissoesProjetadasValor.replace('R$ ', '').replace(',', '.')))}
															</p>
															<p className="text-xs text-gray-500 mt-1">Faturamento Previsto - Comissões Projetadas</p>
														</div>
													</div>

													{/* Resumo visual da projeção completa */}
													<div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg border border-indigo-100">
														<h3 className="text-sm font-medium text-gray-700 mb-3">Resumo da Projeção Completa do Período</h3>
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
															<div className="text-center">
																<p className="text-xs text-gray-600 mb-1">Receita Finalizada</p>
																<p className="text-lg font-bold text-gray-800">{formatCurrency(stats.revenue.total)}</p>
																<p className="text-xs text-gray-500">
																	{(stats.revenue.total + periodPendingValue) > 0
																		? Math.round((stats.revenue.total / (stats.revenue.total + periodPendingValue)) * 100)
																		: 0}% do total
																</p>
															</div>
															<div className="text-center">
																<p className="text-xs text-gray-600 mb-1">Receita Pendente</p>
																<p className="text-lg font-bold text-amber-700">{formatCurrency(periodPendingValue)}</p>
																<p className="text-xs text-gray-500">
																	{(stats.revenue.total + periodPendingValue) > 0
																		? Math.round((periodPendingValue / (stats.revenue.total + periodPendingValue)) * 100)
																		: 0}% do total
																</p>
															</div>
															<div className="text-center">
																<p className="text-xs text-gray-600 mb-1">Total Projetado</p>
																<p className="text-lg font-bold text-indigo-700">{formatCurrency(stats.revenue.total + periodPendingValue)}</p>
																<p className="text-xs text-gray-500">Receita completa do período</p>
															</div>
														</div>

														{/* Barra de progresso visual */}
														<div className="mt-4">
															<div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
																<div className="h-full flex">
																	<div
																		className="bg-gradient-to-r from-green-400 to-green-600"
																		style={{
																			width: `${(stats.revenue.total + periodPendingValue) > 0
																				? (stats.revenue.total / (stats.revenue.total + periodPendingValue)) * 100
																				: 0}%`
																		}}
																		title={`Finalizada: ${formatCurrency(stats.revenue.total)}`}
																	></div>
																	<div
																		className="bg-gradient-to-r from-amber-400 to-amber-600"
																		style={{
																			width: `${(stats.revenue.total + periodPendingValue) > 0
																				? (periodPendingValue / (stats.revenue.total + periodPendingValue)) * 100
																				: 0}%`
																		}}
																		title={`Pendente: ${formatCurrency(periodPendingValue)}`}
																	></div>
																</div>
															</div>
															<div className="flex justify-between text-xs text-gray-600 mt-1">
																<span>Finalizada</span>
																<span>Pendente</span>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>


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
																		fill="url(#colorGradient)"
																		radius={[4, 4, 0, 0]}
																	/>
																	<defs>
																		<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
																			<stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
																			<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6} />
																		</linearGradient>
																	</defs>
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
																<h4 className="font-medium text-gray-800">Comissão Total do Período</h4>
															</div>
															<p className="text-2xl font-bold text-blue-700">
																{formatCurrency(userStats.commission.total + projectedCommission)}
															</p>
															<p className="text-sm text-gray-600 mt-1">Finalizadas + Pendentes</p>
															<div className="flex items-center mt-2">
																<span className="text-xs font-medium text-green-600">
																	Finalizadas: {formatCurrency(userStats.commission.total)}
																</span>
																<div className="ml-auto flex items-center">
																	<span className="text-xs font-medium text-blue-600">
																		Pendentes: {formatCurrency(projectedCommission)}
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
											<CardDescription>Progresso em relação à meta de faturamento do mês atual</CardDescription>
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
													<span className="text-gray-600">Faturamento acumulado (mês atual):</span>
													<span className="font-medium text-gray-800">{formatCurrency(userStats.revenue.total)}</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600">Meta de faturamento mensal:</span>
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
											<CardDescription>Comissões atuais e projetadas do mês atual</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div className="p-4 bg-green-50 rounded-lg">
													<div className="flex items-center mb-2">
														<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
														<h4 className="font-medium text-gray-800">Comissão Finalizada</h4>
													</div>
													<p className="text-2xl font-bold text-green-600">{formatCurrency(userStats.commission.total)}</p>
													<p className="text-sm text-gray-600 mt-1">No mês atual</p>
												</div>
												<div className="p-4 bg-blue-50 rounded-lg">
													<div className="flex items-center mb-2">
														<Target className="h-5 w-5 text-blue-500 mr-2" />
														<h4 className="font-medium text-gray-800">Comissão Total Projetada</h4>
													</div>
													<p className="text-2xl font-bold text-blue-600">
														{formatCurrency(userStats.commission.total + projectedCommission)}
													</p>
													<p className="text-sm text-gray-600 mt-1">Finalizadas + Pendentes</p>
												</div>
											</div>

											<div className="mt-6">
												<ProgressBar
													value={userStats.revenue.total}
													maxValue={monthlyGoal}
													label="Progresso de faturamento (mês atual)"
												/>

												<div className="mt-4">
													<ProgressBar
														value={userStats.revenue.total + pendingAppointments.reduce((sum, app) => sum + app.value, 0)}
														maxValue={monthlyGoal}
														label="Projeção com pendentes (mês atual)"
														color="blue"
													/>
												</div>
											</div>

											{/* Resumo visual das comissões */}
											<div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
												<h3 className="text-sm font-medium text-gray-700 mb-3">Resumo de Comissões do Mês</h3>
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div className="text-center">
														<p className="text-xs text-gray-600 mb-1">Comissão Finalizada</p>
														<p className="text-lg font-bold text-green-600">{formatCurrency(userStats.commission.total)}</p>
														<p className="text-xs text-gray-500">
															{(userStats.commission.total + projectedCommission) > 0
																? Math.round((userStats.commission.total / (userStats.commission.total + projectedCommission)) * 100)
																: 0}% do total
														</p>
													</div>
													<div className="text-center">
														<p className="text-xs text-gray-600 mb-1">Comissão Pendente</p>
														<p className="text-lg font-bold text-blue-600">{formatCurrency(projectedCommission)}</p>
														<p className="text-xs text-gray-500">
															{(userStats.commission.total + projectedCommission) > 0
																? Math.round((projectedCommission / (userStats.commission.total + projectedCommission)) * 100)
																: 0}% do total
														</p>
													</div>
													<div className="text-center">
														<p className="text-xs text-gray-600 mb-1">Total Projetado</p>
														<p className="text-lg font-bold text-indigo-700">
															{formatCurrency(userStats.commission.total + projectedCommission)}
														</p>
														<p className="text-xs text-gray-500">Comissão completa do mês</p>
													</div>
												</div>

												{/* Barra de progresso visual */}
												<div className="mt-4">
													<div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
														<div className="h-full flex">
															<div
																className="bg-gradient-to-r from-green-400 to-green-600"
																style={{
																	width: `${(userStats.commission.total + projectedCommission) > 0
																		? (userStats.commission.total / (userStats.commission.total + projectedCommission)) * 100
																		: 0}%`
																}}
																title={`Finalizada: ${formatCurrency(userStats.commission.total)}`}
															></div>
															<div
																className="bg-gradient-to-r from-blue-400 to-blue-600"
																style={{
																	width: `${(userStats.commission.total + projectedCommission) > 0
																		? (projectedCommission / (userStats.commission.total + projectedCommission)) * 100
																		: 0}%`
																}}
																title={`Pendente: ${formatCurrency(projectedCommission)}`}
															></div>
														</div>
													</div>
													<div className="flex justify-between text-xs text-gray-600 mt-1">
														<span>Finalizada</span>
														<span>Pendente</span>
													</div>
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
