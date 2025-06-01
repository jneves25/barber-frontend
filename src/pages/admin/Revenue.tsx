import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	BarChart as BarChartIcon,
	DollarSign,
	TrendingUp,
	Calendar,
	Users,
	FileText,
	FileSpreadsheet,
	Download,
	Printer,
	Loader2,
	CalendarIcon
} from 'lucide-react';
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
	LineChart,
	Line,
	AreaChart,
	Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
	RevenueService,
	RevenueData,
	BarberRevenueData,
	ServiceRevenueData,
	WeekdayRevenueData,
	HourlyRevenueData,
	YearlyComparisonData,
	AvgTicketData,
	BarberMonthlyData,
	ClientGrowthData
} from '@/services/api/RevenueService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';

// Cores para os gráficos - esquema elegante com azul e roxo
const COLORS = [
	'#3B82F6', // Azul vibrante
	'#8B5CF6', // Roxo médio
	'#06B6D4', // Azul ciano
	'#A855F7', // Roxo claro
	'#1E40AF', // Azul escuro
	'#7C3AED', // Roxo escuro
	'#0EA5E9', // Azul céu
	'#C084FC', // Roxo pastel
	'#1D4ED8', // Azul royal
	'#9333EA'  // Roxo vibrante
];

// Gradientes para gráficos de área
const GRADIENTS = {
	blue: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
	purple: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
	cyan: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
	lightPurple: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
	blueToPurple: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
	purpleToBlue: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
};

// Função para obter o primeiro dia do mês atual
const getFirstDayOfCurrentMonth = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
};

const AdminRevenue = () => {
	const [period, setPeriod] = useState('year');
	const [reportTab, setReportTab] = useState('overview');
	const { user, companySelected } = useAuth();
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
	const isAdmin = user?.role === 'ADMIN';

	// Inicializa com o primeiro dia do mês atual até o dia atual
	const [dateRange, setDateRange] = useState<{
		startDate: Date | undefined;
		endDate: Date | undefined;
	}>({
		startDate: getFirstDayOfCurrentMonth(),
		endDate: new Date()
	});

	// Estados para os dados reais da API
	const [isLoading, setIsLoading] = useState(true);
	const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
	const [barberIndividualData, setBarberIndividualData] = useState<Record<string, RevenueData[]>>({});
	const [serviceRevenueData, setServiceRevenueData] = useState<ServiceRevenueData[]>([]);
	const [barberServiceData, setBarberServiceData] = useState<Record<string, ServiceRevenueData[]>>({});
	const [barberRevenueData, setBarberRevenueData] = useState<BarberRevenueData[]>([]);
	const [barberMonthlyData, setBarberMonthlyData] = useState<BarberMonthlyData[]>([]);
	const [weekdayRevenueData, setWeekdayRevenueData] = useState<WeekdayRevenueData[]>([]);
	const [hourlyRevenueData, setHourlyRevenueData] = useState<HourlyRevenueData[]>([]);
	const [clientGrowthData, setClientGrowthData] = useState<ClientGrowthData[]>([]);
	const [avgTicketData, setAvgTicketData] = useState<AvgTicketData[]>([]);
	const [yearComparisonData, setYearComparisonData] = useState<YearlyComparisonData[]>([]);
	const [growthPercentage, setGrowthPercentage] = useState(15);
	const [ticketGrowth, setTicketGrowth] = useState(8);

	const revenueService = new RevenueService();

	// Verificação de permissão - apenas ADMIN pode acessar
	useEffect(() => {
		if (!isAdmin) {
			sonnerToast.error('Você não tem permissão para acessar a área de faturamento. Apenas administradores podem visualizar relatórios financeiros.');
			navigate('/admin');
		}
	}, [isAdmin, navigate]);

	// Efeito para carregar dados da API
	useEffect(() => {
		if (!companySelected?.id || !isAdmin) return;

		const currentYear = new Date().getFullYear();

		const loadData = async () => {
			if (!isAdmin) return;

			setIsLoading(true);
			try {
				// Format dates for API
				const formattedStartDate = dateRange.startDate ? dateRange.startDate.toISOString() : undefined;
				const formattedEndDate = dateRange.endDate ? dateRange.endDate.toISOString() : undefined;

				// Carrega todos os dados necessários da API
				const [
					revenueResponse,
					barberResponse,
					serviceResponse,
					clientGrowthResponse,
					weekdayResponse,
					hourlyResponse,
					yearlyResponse,
					ticketResponse,
					barberMonthlyResponse
				] = await Promise.all([
					// 1. Faturamento mensal (gráfico principal)
					revenueService.getMonthlyRevenue(
						companySelected.id,
						currentYear,
						period,
						formattedStartDate,
						formattedEndDate
					),
					// 2. Faturamento por barbeiro (gráfico de pizza)
					revenueService.getBarberRevenue(
						companySelected.id,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 3. Faturamento por serviço
					revenueService.getServiceRevenue(
						companySelected.id,
						undefined,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 4. Crescimento de clientes novos
					revenueService.getClientGrowth(
						companySelected.id,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 5. Faturamento por dia da semana
					revenueService.getWeekdayRevenue(
						companySelected.id,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 6. Faturamento por hora
					revenueService.getHourlyRevenue(
						companySelected.id,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 7. Comparativo anual
					revenueService.getYearlyComparison(
						companySelected.id,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 8. Ticket médio por barbeiro
					revenueService.getAvgTicketByBarber(
						companySelected.id,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					),
					// 9. Faturamento mensal por barbeiro
					revenueService.getBarberMonthlyRevenue(
						companySelected.id,
						currentYear,
						formattedStartDate,
						formattedEndDate
					)
				]);

				if (revenueResponse.success && revenueResponse.data) {
					setRevenueData(revenueResponse.data);
				}

				if (barberResponse.success && barberResponse.data) {
					const coloredData = revenueService.assignColors(barberResponse.data);
					setBarberRevenueData(coloredData);
				}

				if (serviceResponse.success && serviceResponse.data) {
					setServiceRevenueData(serviceResponse.data);
				}

				if (clientGrowthResponse.success && clientGrowthResponse.data) {
					setClientGrowthData(clientGrowthResponse.data);
				} else {
					// Dados de fallback para demonstração
					const fallbackData: ClientGrowthData[] = [
						{ name: 'Jan', newClients: 15, totalClients: 15, growth: 0 },
						{ name: 'Fev', newClients: 23, totalClients: 38, growth: 153.3 },
						{ name: 'Mar', newClients: 18, totalClients: 56, growth: 47.4 },
						{ name: 'Abr', newClients: 31, totalClients: 87, growth: 55.4 },
						{ name: 'Mai', newClients: 27, totalClients: 114, growth: 31.0 },
						{ name: 'Jun', newClients: 35, totalClients: 149, growth: 30.7 },
						{ name: 'Jul', newClients: 29, totalClients: 178, growth: 19.5 },
						{ name: 'Ago', newClients: 42, totalClients: 220, growth: 23.6 },
						{ name: 'Set', newClients: 38, totalClients: 258, growth: 17.3 },
						{ name: 'Out', newClients: 33, totalClients: 291, growth: 12.8 },
						{ name: 'Nov', newClients: 45, totalClients: 336, growth: 15.5 },
						{ name: 'Dez', newClients: 52, totalClients: 388, growth: 15.5 }
					];
					setClientGrowthData(fallbackData);
				}

				if (weekdayResponse.success && weekdayResponse.data) {
					setWeekdayRevenueData(weekdayResponse.data);
				}

				if (hourlyResponse.success && hourlyResponse.data) {
					setHourlyRevenueData(hourlyResponse.data);
				}

				if (yearlyResponse.success && yearlyResponse.data) {
					setYearComparisonData(yearlyResponse.data);

					// Calculate growth percentage
					if (yearlyResponse.data.length > 0) {
						const currentYearStr = currentYear.toString();
						const prevYearStr = (currentYear - 1).toString();
						const lastEntry = yearlyResponse.data[yearlyResponse.data.length - 1];

						if (lastEntry[currentYearStr] && lastEntry[prevYearStr]) {
							const currentValue = Number(lastEntry[currentYearStr]);
							const prevValue = Number(lastEntry[prevYearStr]);

							if (prevValue > 0) {
								const growth = ((currentValue - prevValue) / prevValue) * 100;
								setGrowthPercentage(Math.round(growth));
							}
						}
					}
				}

				if (ticketResponse.success && ticketResponse.data) {
					setAvgTicketData(ticketResponse.data);
					setTicketGrowth(8); // This would normally be calculated from historical data
				}

				if (barberMonthlyResponse.success && barberMonthlyResponse.data) {
					setBarberMonthlyData(barberMonthlyResponse.data);
				}

				// Se o usuário for um barbeiro, carrega seus dados individuais
				if (user?.role === 'USER') {
					const [userRevenueResponse, userServiceResponse] = await Promise.all([
						revenueService.getUserRevenue(
							companySelected.id,
							currentYear,
							formattedStartDate,
							formattedEndDate
						),
						revenueService.getServiceRevenue(
							companySelected.id,
							user.id,
							period,
							currentYear,
							formattedStartDate,
							formattedEndDate
						)
					]);

					if (userRevenueResponse.success && userRevenueResponse.data && user.name) {
						setBarberIndividualData({
							[user.name]: userRevenueResponse.data
						});
					}

					if (userServiceResponse.success && userServiceResponse.data && user.name) {
						setBarberServiceData({
							[user.name]: userServiceResponse.data
						});
					}
				}

			} catch (error) {
				console.error('Erro ao carregar dados de faturamento:', error);
				sonnerToast.error('Erro ao carregar dados de faturamento');
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [companySelected?.id, period, user?.id, user?.name, user?.role, dateRange.startDate, dateRange.endDate, isAdmin]);

	const getUserData = () => {
		if (user?.role === 'USER' && user.name) {
			return {
				revenueData: barberIndividualData[user.name] || [],
				serviceData: barberServiceData[user.name] || []
			};
		}
		return { revenueData, serviceData: serviceRevenueData };
	};

	const formatCurrency = (value: number) => {
		return `R$ ${value.toFixed(2)}`;
	};

	const tooltipFormatter = (value: any) => {
		if (typeof value === 'number') {
			return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
		}
		return [`R$ ${value}`, 'Faturamento'];
	};

	const dateFilterButton = (
		<Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!dateRange.startDate && !dateRange.endDate && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{dateRange.startDate && dateRange.endDate ? (
						<>
							{format(dateRange.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.endDate, "dd/MM/yyyy", { locale: ptBR })}
						</>
					) : (
						<span>Selecionar período</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="flex">
					<div className="p-3">
						<Label>Data inicial</Label>
						<CalendarComponent
							mode="single"
							selected={dateRange.startDate}
							onSelect={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
							initialFocus
							locale={ptBR}
						/>
					</div>
					<div className="p-3">
						<Label>Data final</Label>
						<CalendarComponent
							mode="single"
							selected={dateRange.endDate}
							onSelect={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
							initialFocus
							locale={ptBR}
						/>
					</div>
				</div>
				<div className="p-3 border-t flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setDateRange({ startDate: undefined, endDate: undefined });
							setIsDateFilterOpen(false);
						}}
					>
						Limpar
					</Button>
					<Button
						size="sm"
						onClick={() => {
							setIsDateFilterOpen(false);
						}}
					>
						Aplicar
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);

	const userData = getUserData();

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex flex-col items-center justify-center h-full min-h-[300px]">
					<Loader2 className="h-12 w-12 text-barber-500 animate-spin mb-4" />
					<p className="text-lg text-gray-600">Carregando dados de faturamento...</p>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			{!isAdmin ? (
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Negado</h2>
						<p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
						<h1 className="text-2xl font-bold">
							{user?.role === 'USER' ? 'Meu Faturamento' : 'Faturamento'}
						</h1>
						<div className="flex flex-col sm:flex-row gap-2 mb-4">
							{dateFilterButton}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">
									{user?.role === 'USER' ? 'Meu Faturamento Total' : 'Faturamento Total'}
								</CardTitle>
								<DollarSign className="h-4 w-4 text-gray-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{user?.role === 'USER'
										? formatCurrency(userData.revenueData.reduce((sum, item) => sum + item.total, 0))
										: formatCurrency(revenueData.reduce((sum, item) => sum + item.total, 0))}
								</div>
								<p className="text-xs text-muted-foreground">
									+{growthPercentage}% comparado ao período anterior
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">Crescimento</CardTitle>
								<TrendingUp className="h-4 w-4 text-gray-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{growthPercentage}%</div>
								<p className="text-xs text-muted-foreground">
									Aumento em relação ao mês anterior
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">
									{user?.role === 'USER' ? 'Meu Ticket Médio' : 'Ticket Médio'}
								</CardTitle>
								<DollarSign className="h-4 w-4 text-gray-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{user?.role === 'USER' && user.name
										? formatCurrency(avgTicketData.find(item => item.name === user.name)?.avgTicket || 0)
										: formatCurrency(avgTicketData.reduce((sum, item) => sum + item.avgTicket, 0) / (avgTicketData.length || 1))}
								</div>
								<p className="text-xs text-muted-foreground">
									+{ticketGrowth}% comparado ao período anterior
								</p>
							</CardContent>
						</Card>
					</div>

					<Tabs value={reportTab} onValueChange={setReportTab} className="w-full">
						<TabsList className={`w-full mb-4 ${isMobile ? 'flex flex-wrap gap-1' : user?.role === 'USER' ? 'grid grid-cols-3' : 'grid grid-cols-4'}`}>
							<TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
							{user?.role !== 'USER' && <TabsTrigger value="barbers" className="text-xs sm:text-sm">Por Barbeiro</TabsTrigger>}
							<TabsTrigger value="services" className="text-xs sm:text-sm">Por Serviço</TabsTrigger>
							<TabsTrigger value="time" className="text-xs sm:text-sm">Por Período</TabsTrigger>
						</TabsList>

						<TabsContent value="overview">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between">
									<div>
										<CardTitle>
											{user?.role === 'USER' ? 'Análise do Meu Faturamento' : 'Análise de Faturamento'}
										</CardTitle>
										<CardDescription>
											{dateRange.startDate && dateRange.endDate ? (
												<span>
													{format(dateRange.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.endDate, "dd/MM/yyyy", { locale: ptBR })}
												</span>
											) : (
												<span>{`Faturamento do ano atual (${new Date().getFullYear()})`}</span>
											)}
										</CardDescription>
									</div>
									<BarChartIcon className="h-5 w-5 text-gray-500" />
								</CardHeader>
								<CardContent>
									<div className="h-80">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={userData.revenueData}
												margin={{
													top: 20,
													right: 30,
													left: 20,
													bottom: 5,
												}}
											>
												<defs>
													<linearGradient id="mainBarGradient" x1="0" y1="0" x2="0" y2="1">
														<stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
														<stop offset="100%" stopColor="#1E40AF" stopOpacity={0.8} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Legend />
												<Bar dataKey="total" name="Faturamento (R$)" fill="url(#mainBarGradient)" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Crescimento de Clientes Novos</CardTitle>
										<CardDescription>Evolução mensal de novos clientes</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="h-80">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart
													data={clientGrowthData}
													margin={{
														top: 20,
														right: 30,
														left: 20,
														bottom: 5,
													}}
												>
													<defs>
														<linearGradient id="clientGrowthGradient" x1="0" y1="0" x2="0" y2="1">
															<stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
															<stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip formatter={(value: any, name: string) => {
														if (name === 'Novos Clientes') {
															return [`${value} clientes`, 'Novos Clientes'];
														}
														return [`${value}%`, 'Crescimento'];
													}} />
													<Legend />
													<Bar dataKey="newClients" name="Novos Clientes" fill="url(#clientGrowthGradient)" />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Faturamento por Dia da Semana</CardTitle>
										<CardDescription>Análise de receita por dia da semana</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="h-80">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart
													data={weekdayRevenueData}
													margin={{
														top: 20,
														right: 30,
														left: 20,
														bottom: 5,
													}}
												>
													<defs>
														<linearGradient id="weekdayBarGradient" x1="0" y1="0" x2="0" y2="1">
															<stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
															<stop offset="100%" stopColor="#1E40AF" stopOpacity={0.8} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip formatter={tooltipFormatter} />
													<Bar dataKey="total" name="Faturamento (R$)" fill="url(#weekdayBarGradient)" />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Comparativo Anual</CardTitle>
										<CardDescription>Comparação com o ano anterior</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="h-80">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart
													data={yearComparisonData}
													margin={{
														top: 20,
														right: 30,
														left: 20,
														bottom: 5,
													}}
												>
													<defs>
														<linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
															<stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
															<stop offset="100%" stopColor="#A855F7" stopOpacity={1} />
														</linearGradient>
														<linearGradient id="blueLineGradient" x1="0" y1="0" x2="1" y2="0">
															<stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
															<stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip formatter={tooltipFormatter} />
													<Legend />
													{Object.keys(yearComparisonData[0] || {}).filter(key => key !== 'name').map((year, index) => (
														<Line
															key={year}
															type="monotone"
															dataKey={year}
															stroke={index === 0 ? "#3B82F6" : "#8B5CF6"}
															strokeWidth={3}
															name={`Ano ${year}`}
															dot={{ fill: index === 0 ? "#3B82F6" : "#8B5CF6", strokeWidth: 2, r: 4 }}
															activeDot={{ r: 6, stroke: index === 0 ? "#3B82F6" : "#8B5CF6", strokeWidth: 2 }}
														/>
													))}
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						{user?.role !== 'USER' && (
							<TabsContent value="barbers">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>Faturamento por Barbeiro</CardTitle>
											<CardDescription>Distribuição de receita entre os barbeiros</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="h-80 flex items-center justify-center">
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={barberRevenueData}
															cx="50%"
															cy="50%"
															labelLine={false}
															outerRadius={80}
															fill="#8884d8"
															dataKey="revenue"
															nameKey="name"
															label={({ name, percentage }) => `${name}: ${percentage}%`}
														>
															{barberRevenueData.map((entry, index) => (
																<Cell key={`cell-${index}`} fill={entry.color} />
															))}
														</Pie>
														<Tooltip formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Faturamento']} />
													</PieChart>
												</ResponsiveContainer>
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Ticket Médio por Barbeiro</CardTitle>
											<CardDescription>Valor médio por atendimento</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="h-80">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart
														data={avgTicketData}
														margin={{
															top: 20,
															right: 30,
															left: 20,
															bottom: 5,
														}}
													>
														<defs>
															<linearGradient id="ticketBarGradient" x1="0" y1="0" x2="0" y2="1">
																<stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
																<stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
															</linearGradient>
														</defs>
														<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
														<XAxis dataKey="name" />
														<YAxis />
														<Tooltip formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Ticket Médio']} />
														<Bar dataKey="avgTicket" name="Ticket Médio (R$)" fill="url(#ticketBarGradient)" />
													</BarChart>
												</ResponsiveContainer>
											</div>
										</CardContent>
									</Card>
								</div>

								<Card className="mt-4">
									<CardHeader>
										<CardTitle>Evolução Mensal por Barbeiro</CardTitle>
										<CardDescription>Acompanhamento do faturamento mensal de cada barbeiro</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="h-80">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart
													data={barberMonthlyData}
													margin={{
														top: 20,
														right: 30,
														left: 20,
														bottom: 5,
													}}
												>
													<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip formatter={tooltipFormatter} />
													<Legend />
													{Object.keys(barberMonthlyData[0] || {}).filter(key => key !== 'name').map((barber, index) => (
														<Line
															key={barber}
															type="monotone"
															dataKey={barber}
															stroke={COLORS[index % COLORS.length]}
															strokeWidth={3}
															name={barber}
															dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
															activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
														/>
													))}
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
						)}

						<TabsContent value="services">
							<Card>
								<CardHeader>
									<CardTitle>
										{user?.role === 'USER' ? 'Meus Serviços Mais Realizados' : 'Serviços Mais Realizados'}
									</CardTitle>
									<CardDescription>Análise de receita por tipo de serviço</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-80">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={userData.serviceData}
												margin={{
													top: 20,
													right: 30,
													left: 20,
													bottom: 5,
												}}
											>
												<defs>
													<linearGradient id="serviceBarGradient" x1="0" y1="0" x2="0" y2="1">
														<stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
														<stop offset="100%" stopColor="#1E40AF" stopOpacity={0.8} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
												<XAxis dataKey="service" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Legend />
												<Bar dataKey="revenue" name="Faturamento (R$)" fill="url(#serviceBarGradient)" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>

							<Card className="mt-4">
								<CardHeader>
									<CardTitle>Detalhamento dos Serviços</CardTitle>
									<CardDescription>Tabela com informações detalhadas dos serviços</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Serviço</TableHead>
												<TableHead>Quantidade</TableHead>
												<TableHead>Faturamento</TableHead>
												<TableHead>Participação</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{userData.serviceData.map((service, index) => (
												<TableRow key={index}>
													<TableCell className="font-medium">{service.service}</TableCell>
													<TableCell>{service.quantity}</TableCell>
													<TableCell>{formatCurrency(service.revenue)}</TableCell>
													<TableCell>{service.percentage}%</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="time">
							<Card>
								<CardHeader>
									<CardTitle>Faturamento por Horário</CardTitle>
									<CardDescription>Análise de receita por período do dia</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-80">
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart
												data={hourlyRevenueData}
												margin={{
													top: 20,
													right: 30,
													left: 20,
													bottom: 5,
												}}
											>
												<defs>
													<linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
														<stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
														<stop offset="100%" stopColor="#7C3AED" stopOpacity={0.2} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="hour" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Area
													type="monotone"
													dataKey="total"
													stroke="#8B5CF6"
													fill="url(#blueGradient)"
													fillOpacity={0.8}
													name="Faturamento (R$)"
												/>
											</AreaChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					<div className="mt-4 flex flex-wrap justify-end gap-2">
						<button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors text-xs sm:text-sm">
							<FileText className="h-4 w-4" />
							<span>Exportar PDF</span>
						</button>
						<button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors text-xs sm:text-sm">
							<Printer className="h-4 w-4" />
							<span>Imprimir</span>
						</button>
					</div>
				</div>
			)}
		</AdminLayout>
	);
};

export default AdminRevenue; 