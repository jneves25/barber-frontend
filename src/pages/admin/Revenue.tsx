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
	PaymentMethodData,
	WeekdayRevenueData,
	HourlyRevenueData,
	YearlyComparisonData,
	AvgTicketData,
	BarberMonthlyData
} from '@/services/api/RevenueService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Cores para os gráficos
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444'];

// Função para obter o primeiro dia do mês atual
const getFirstDayOfCurrentMonth = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
};

const AdminRevenue = () => {
	const [period, setPeriod] = useState('year');
	const [reportTab, setReportTab] = useState('overview');
	const { user, companySelected } = useAuth();
	const isMobile = useIsMobile();
	const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

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
	const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
	const [avgTicketData, setAvgTicketData] = useState<AvgTicketData[]>([]);
	const [yearComparisonData, setYearComparisonData] = useState<YearlyComparisonData[]>([]);
	const [growthPercentage, setGrowthPercentage] = useState(15); // Default growth percentage
	const [ticketGrowth, setTicketGrowth] = useState(8); // Default ticket growth percentage

	const revenueService = new RevenueService();

	// Efeito para carregar dados da API
	useEffect(() => {
		if (!companySelected?.id) return;

		const currentYear = new Date().getFullYear();

		const loadData = async () => {
			setIsLoading(true);
			try {
				// Format dates for API
				const formattedStartDate = dateRange.startDate ? dateRange.startDate.toISOString() : undefined;
				const formattedEndDate = dateRange.endDate ? dateRange.endDate.toISOString() : undefined;

				// Carrega todos os dados necessários da API

				// 1. Faturamento mensal (gráfico principal)
				const revenueResponse = await revenueService.getMonthlyRevenue(
					companySelected.id,
					currentYear,
					period,
					formattedStartDate,
					formattedEndDate
				);

				if (revenueResponse.success && revenueResponse.data) {
					setRevenueData(revenueResponse.data);
				}

				// 2. Faturamento por barbeiro (gráfico de pizza)
				const barberResponse = await revenueService.getBarberRevenue(
					companySelected.id,
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (barberResponse.success && barberResponse.data) {
					// Adicionar cores aos dados
					const coloredData = revenueService.assignColors(barberResponse.data);
					setBarberRevenueData(coloredData);
				}

				// 3. Faturamento por serviço
				const serviceResponse = await revenueService.getServiceRevenue(
					companySelected.id,
					undefined, // sem usuário específico
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (serviceResponse.success && serviceResponse.data) {
					setServiceRevenueData(serviceResponse.data);
				}

				// 4. Faturamento por método de pagamento
				const paymentResponse = await revenueService.getPaymentMethodRevenue(
					companySelected.id,
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (paymentResponse.success && paymentResponse.data) {
					setPaymentMethodData(paymentResponse.data);
				}

				// 5. Faturamento por dia da semana
				const weekdayResponse = await revenueService.getWeekdayRevenue(
					companySelected.id,
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (weekdayResponse.success && weekdayResponse.data) {
					setWeekdayRevenueData(weekdayResponse.data);
				}

				// 6. Faturamento por hora
				const hourlyResponse = await revenueService.getHourlyRevenue(
					companySelected.id,
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (hourlyResponse.success && hourlyResponse.data) {
					setHourlyRevenueData(hourlyResponse.data);
				}

				// 7. Comparativo anual
				const yearlyResponse = await revenueService.getYearlyComparison(
					companySelected.id,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

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

				// 8. Ticket médio por barbeiro
				const ticketResponse = await revenueService.getAvgTicketByBarber(
					companySelected.id,
					period,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (ticketResponse.success && ticketResponse.data) {
					setAvgTicketData(ticketResponse.data);

					// Calculate ticket growth (simplified calculation)
					setTicketGrowth(8); // This would normally be calculated from historical data
				}

				// 9. Faturamento mensal por barbeiro (gráfico de linha)
				const barberMonthlyResponse = await revenueService.getBarberMonthlyRevenue(
					companySelected.id,
					currentYear,
					formattedStartDate,
					formattedEndDate
				);

				if (barberMonthlyResponse.success && barberMonthlyResponse.data) {
					setBarberMonthlyData(barberMonthlyResponse.data);
				}

				// Se o usuário for um barbeiro, carrega seus dados individuais
				if (user?.role === 'USER') {
					// Faturamento mensal do usuário
					const userRevenueResponse = await revenueService.getUserRevenue(
						companySelected.id,
						currentYear,
						formattedStartDate,
						formattedEndDate
					);

					if (userRevenueResponse.success && userRevenueResponse.data && user.name) {
						setBarberIndividualData({
							[user.name]: userRevenueResponse.data
						});
					}

					// Faturamento por serviço do usuário
					const userServiceResponse = await revenueService.getServiceRevenue(
						companySelected.id,
						user.id,
						period,
						currentYear,
						formattedStartDate,
						formattedEndDate
					);

					if (userServiceResponse.success && userServiceResponse.data && user.name) {
						setBarberServiceData({
							[user.name]: userServiceResponse.data
						});
					}
				}

			} catch (error) {
				console.error('Erro ao carregar dados de faturamento:', error);
				toast({
					title: "Erro",
					description: "Não foi possível carregar os dados de faturamento.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [companySelected?.id, period, user?.id, user?.name, user?.role, dateRange.startDate, dateRange.endDate]);

	const getUserData = () => {
		if (user?.role === 'USER' && user.name) {
			return {
				revenueData: barberIndividualData[user.name] || [],
				serviceData: barberServiceData[user.name] || []
			};
		}
		return { revenueData, serviceData: serviceRevenueData };
	};

	const userData = getUserData();

	const totalUserRevenue = userData.serviceData.reduce((sum, item) => sum + item.revenue, 0);

	const totalBarberRevenue = barberRevenueData.reduce((sum, item) => sum + item.revenue, 0);

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
						"flex items-center justify-center gap-2 text-sm font-medium",
						dateRange.startDate && dateRange.endDate ? "text-primary" : "text-muted-foreground"
					)}
				>
					<CalendarIcon className="h-4 w-4" />
					{dateRange.startDate && dateRange.endDate ? (
						<span>
							{format(dateRange.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.endDate, "dd/MM/yyyy", { locale: ptBR })}
						</span>
					) : (
						<span>Filtrar por período</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-4" align="start">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="startDate">Data Inicial</Label>
						<CalendarComponent
							mode="single"
							selected={dateRange.startDate}
							onSelect={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
							initialFocus
							locale={ptBR}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="endDate">Data Final</Label>
						<CalendarComponent
							mode="single"
							selected={dateRange.endDate}
							onSelect={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
							initialFocus
							locale={ptBR}
						/>
					</div>
					<div className="flex justify-between">
						<Button
							variant="outline"
							onClick={() => {
								setDateRange({ startDate: undefined, endDate: undefined });
								setIsDateFilterOpen(false);
							}}
						>
							Limpar
						</Button>
						<Button
							onClick={() => {
								if (!dateRange.startDate || !dateRange.endDate) {
									toast({
										title: "Atenção",
										description: "Selecione as duas datas para filtrar.",
										variant: "default",
									});
									return;
								}

								if (dateRange.startDate > dateRange.endDate) {
									toast({
										title: "Erro",
										description: "A data inicial não pode ser maior que a data final.",
										variant: "destructive",
									});
									return;
								}

								setIsDateFilterOpen(false);
							}}
						>
							Aplicar
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);

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
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip formatter={tooltipFormatter} />
											<Legend />
											<Bar dataKey="total" name="Faturamento (R$)" fill="#3B82F6" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
							<Card>
								<CardHeader>
									<CardTitle>Forma de Pagamento</CardTitle>
									<CardDescription>Distribuição por método de pagamento</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-80 flex items-center justify-center">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={paymentMethodData}
													cx="50%"
													cy="50%"
													labelLine={false}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
													nameKey="name"
													label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
												>
													{paymentMethodData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
													))}
												</Pie>
												<Tooltip formatter={(value: any) => {
													if (typeof value === 'number') {
														return [`R$ ${value.toFixed(2)}`, 'Valor'];
													}
													return [`R$ ${value}`, 'Valor'];
												}} />
											</PieChart>
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
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Bar dataKey="total" name="Faturamento (R$)" fill="#10B981" />
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
											<BarChart
												data={yearComparisonData}
												margin={{
													top: 20,
													right: 30,
													left: 20,
													bottom: 5,
												}}
											>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Legend />
												{yearComparisonData.length > 0 &&
													Object.keys(yearComparisonData[0])
														.filter(key => key !== 'name')
														.map((year, index) => (
															<Bar
																key={year}
																dataKey={year}
																name={`Ano ${year}`}
																fill={COLORS[index % COLORS.length]}
															/>
														))
												}
											</BarChart>
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
									<CardHeader className="flex flex-row items-center justify-between">
										<div>
											<CardTitle>Faturamento por Barbeiro</CardTitle>
											<CardDescription>Distribuição de receita por profissional</CardDescription>
										</div>
										<Users className="h-5 w-5 text-gray-500" />
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
														label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
													>
														{barberRevenueData.map((entry, index) => (
															<Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip formatter={(value: any) => {
														if (typeof value === 'number') {
															return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
														}
														return [`R$ ${value}`, 'Faturamento'];
													}} />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Detalhamento por Barbeiro</CardTitle>
										<CardDescription>Análise de receita por profissional</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Barbeiro</TableHead>
														<TableHead>Faturamento</TableHead>
														<TableHead>% do Total</TableHead>
														<TableHead>Distribuição</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{barberRevenueData.map(item => (
														<TableRow key={item.id}>
															<TableCell>{item.name}</TableCell>
															<TableCell>{formatCurrency(item.revenue)}</TableCell>
															<TableCell>{item.percentage}%</TableCell>
															<TableCell className="w-1/4">
																<div className="w-full bg-gray-200 rounded-full h-2.5">
																	<div
																		className="h-2.5 rounded-full"
																		style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#3B82F6' }}
																	></div>
																</div>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
												<tfoot className="bg-gray-50 font-semibold">
													<tr>
														<TableCell>Total</TableCell>
														<TableCell>{formatCurrency(totalBarberRevenue)}</TableCell>
														<TableCell>100%</TableCell>
														<TableCell></TableCell>
													</tr>
												</tfoot>
											</Table>
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Evolução Mensal por Barbeiro</CardTitle>
										<CardDescription>Faturamento mensal de cada profissional</CardDescription>
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
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip formatter={tooltipFormatter} />
													<Legend />
													{barberMonthlyData.length > 0 &&
														Object.keys(barberMonthlyData[0])
															.filter(key => key !== 'name')
															.map((barber, index) => (
																<Line
																	key={barber}
																	type="monotone"
																	dataKey={barber}
																	stroke={COLORS[index % COLORS.length]}
																	activeDot={index === 0 ? { r: 8 } : undefined}
																/>
															))
													}
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Ticket Médio por Barbeiro</CardTitle>
										<CardDescription>Valor médio por atendimento</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Barbeiro</TableHead>
														<TableHead>Ticket Médio</TableHead>
														<TableHead>Ticket Máximo</TableHead>
														<TableHead>Ticket Mínimo</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{avgTicketData.map(item => (
														<TableRow key={item.id}>
															<TableCell>{item.name}</TableCell>
															<TableCell>{formatCurrency(item.avgTicket)}</TableCell>
															<TableCell>{formatCurrency(item.maxTicket)}</TableCell>
															<TableCell>{formatCurrency(item.minTicket)}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					)}

					<TabsContent value="services">
						<Card>
							<CardHeader>
								<CardTitle>
									{user?.role === 'USER' ? 'Meu Faturamento por Serviço' : 'Faturamento por Serviço'}
								</CardTitle>
								<CardDescription>Análise de receita por tipo de serviço</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Serviço</TableHead>
												<TableHead>Quantidade</TableHead>
												<TableHead>Faturamento</TableHead>
												<TableHead>% do Total</TableHead>
												<TableHead>Distribuição</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{userData.serviceData.map(item => (
												<TableRow key={item.id}>
													<TableCell>{item.service}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>{formatCurrency(item.revenue)}</TableCell>
													<TableCell>{item.percentage}%</TableCell>
													<TableCell className="w-1/4">
														<div className="w-full bg-gray-200 rounded-full h-2.5">
															<div
																className="h-2.5 rounded-full bg-barber-500"
																style={{ width: `${item.percentage}%` }}
															></div>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
										<tfoot className="bg-gray-50 font-semibold">
											<tr>
												<TableCell>Total</TableCell>
												<TableCell>
													{userData.serviceData.reduce((sum, item) => sum + item.quantity, 0)}
												</TableCell>
												<TableCell>{formatCurrency(totalUserRevenue)}</TableCell>
												<TableCell>100%</TableCell>
												<TableCell></TableCell>
											</tr>
										</tfoot>
									</Table>
								</div>
							</CardContent>
						</Card>

						<div className="mt-4">
							<Card>
								<CardHeader>
									<CardTitle>
										{user?.role === 'USER' ? 'Distribuição dos Meus Serviços' : 'Distribuição de Serviços'}
									</CardTitle>
									<CardDescription>Proporção de cada serviço no faturamento total</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-80 flex items-center justify-center">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={userData.serviceData}
													cx="50%"
													cy="50%"
													labelLine={false}
													outerRadius={80}
													fill="#8884d8"
													dataKey="revenue"
													nameKey="service"
													label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
												>
													{userData.serviceData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
													))}
												</Pie>
												<Tooltip formatter={(value: any) => {
													if (typeof value === 'number') {
														return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
													}
													return [`R$ ${value}`, 'Faturamento'];
												}} />
											</PieChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="time">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle>Faturamento por Horário</CardTitle>
									<CardDescription>Análise de receita por hora do dia</CardDescription>
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
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="hour" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#93C5FD" />
											</AreaChart>
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
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip formatter={tooltipFormatter} />
												<Bar dataKey="total" name="Faturamento (R$)" fill="#10B981" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

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
				</Tabs>
			</div>
		</AdminLayout>
	);
};

export default AdminRevenue;
