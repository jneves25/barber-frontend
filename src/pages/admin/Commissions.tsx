
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Scissors, BarChart, Eye, Settings, UserPlus, Percent, AlertCircle } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import CommissionSettings from '@/components/commission/CommissionSettings';
import ServiceCommissionForm from '@/components/commission/ServiceCommissionForm';
import UserService, { RoleEnum, User } from '@/services/api/UserService';
import CommissionService, {
	CommissionConfig,
	CommissionRule,
	CommissionTypeEnum,
	CommissionModeEnum,
	CreateCommissionRule
} from '@/services/api/CommissionService';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ServiceService, { Service } from '@/services/api/ServiceService';

interface CommissionData {
	id: number;
	services: number;
	revenue: number;
	commission: number;
	percentage: number;
	commissionType: 'geral' | 'por_servico';
	userId: number;
	user: User;
	configId?: number;
}

const DEFAULT_PERMISSIONS = {
	manageCompany: false,
	viewCompanys: false,
	addMember: false,
	managePermissions: false,
	viewPermissions: false,
	viewAllAppointments: false,
	manageAppointments: false,
	viewOwnAppointments: true,
	viewAllClients: false,
	manageClients: false,
	viewOwnClients: true,
	viewAllServices: true,
	manageServices: false,
	viewServices: true,
	viewAllProducts: false,
	manageProducts: false,
	viewProducts: false,
	viewAllBarbers: true,
	manageBarbers: false,
	viewAllCommissions: true,
	manageCommissions: false,
	viewOwnCommissions: true,
	viewAllGoals: false,
	manageGoals: false,
	viewOwnGoals: true,
	viewFullRevenue: false,
	viewOwnRevenue: true,
	manageSettings: false,
	viewUsers: true,
	manageUsers: false
};

const AdminCommissions = () => {
	const { companySelected } = useAuth();
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(new Date());
	const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
	const [serviceCommissions, setServiceCommissions] = useState<CommissionRule[]>([]);
	const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalStats, setTotalStats] = useState({
		totalRevenue: 0,
		totalCommissions: 0,
		totalServices: 0,
		averageCommission: 0
	});
	const [newUser, setNewUser] = useState({
		name: '',
		email: '',
		password: '',
		role: RoleEnum.USER
	});
	const { toast } = useToast();
	const [services, setServices] = useState<Service[]>([]);

	// Fetch initial data
	useEffect(() => {
		fetchCommissionData();
	}, [startDate, endDate]);

	// Add new useEffect to fetch services
	useEffect(() => {
		fetchServices();
	}, [companySelected.id]);

	const fetchCommissionData = async () => {
		try {
			setIsLoading(true);
			const response = await CommissionService.getCommissionConfigsByCompany(companySelected.id);

			if (response.success && response.data) {
				setCommissions(response.data);
				calculateTotalStats(response.data);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao carregar dados das comissões",
				variant: "destructive"
			});
		} finally {
			setIsLoading(false);
		}
	};

	const calculateTotalStats = (commissionData: CommissionConfig[]) => {
		const totalRevenue = 0; // Implementar cálculo baseado nos dados reais
		const totalCommissions = commissionData.reduce((sum, item) => {
			if (item.commissionMode === CommissionModeEnum.FIXED) {
				return sum + item.commissionValue;
			}
			return sum + (totalRevenue * (item.commissionValue / 100));
		}, 0);
		const totalServices = commissionData.reduce((sum, item) => sum + item.rules.length, 0);
		const averageCommission = totalCommissions / totalRevenue * 100 || 0;

		setTotalStats({
			totalRevenue,
			totalCommissions,
			totalServices,
			averageCommission
		});
	};

	const handleCommissionTypeChange = async (barberId: number, type: CommissionTypeEnum) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			await CommissionService.updateCommissionConfig(commission.id, {
				commissionType: type,
				userId: commission.userId,
				companyId: commission.companyId,
				commissionMode: CommissionModeEnum.PERCENTAGE,
				commissionValue: type === CommissionTypeEnum.GENERAL ? 40 : 0
			});

			await fetchCommissionData();

			toast({
				title: "Tipo de comissão alterado",
				description: type === CommissionTypeEnum.GENERAL
					? "Alterado para comissão geral. Configure a porcentagem desejada."
					: "Alterado para comissão por serviço. Configure as porcentagens para cada serviço."
			});

			if (type === CommissionTypeEnum.GENERAL) {
				handleOpenSettings(barberId);
			} else {
				handleOpenServiceForm(barberId);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao alterar tipo de comissão",
				variant: "destructive"
			});
		}
	};

	const handleOpenSettings = async (barberId: number) => {
		const commission = commissions.find(c => c.id === barberId);
		if (commission) {
			setSelectedBarber(barberId);
			setIsSettingsOpen(true);
		}
	};

	const handleOpenServiceForm = async (barberId: number) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			const rulesResponse = await CommissionService.getCommissionRulesByConfig(commission.id);
			if (rulesResponse.success) {
				setServiceCommissions(rulesResponse.data || []);
				setSelectedBarber(barberId);
				setIsServiceFormOpen(true);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao carregar regras de comissão",
				variant: "destructive"
			});
		}
	};

	const updateServiceCommission = async (barberId: number, serviceId: string, percentage: number) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			const rule: CreateCommissionRule = {
				configId: commission.id,
				serviceType: serviceId.toString(), // Converter para string conforme esperado pelo backend
				percentage
			};

			await CommissionService.createCommissionRule(rule);

			toast({
				title: "Comissão atualizada",
				description: `Comissão do serviço atualizada para ${percentage}%`
			});

			await fetchCommissionData();
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao atualizar comissão do serviço",
				variant: "destructive"
			});
		}
	};

	const updateBarberGeneralCommission = async (barberId: number, value: number, mode: CommissionModeEnum) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			await CommissionService.updateCommissionConfig(commission.id, {
				commissionValue: value,
				commissionType: CommissionTypeEnum.GENERAL,
				userId: commission.userId,
				companyId: commission.companyId,
				commissionMode: mode
			});

			await fetchCommissionData();

			toast({
				title: "Comissão geral atualizada",
				description: mode === CommissionModeEnum.FIXED
					? `Comissão geral definida para R$ ${value.toFixed(2)} em todos os serviços`
					: `Comissão geral definida para ${value}% em todos os serviços`
			});
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao atualizar comissão geral",
				variant: "destructive"
			});
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewUser(prev => ({ ...prev, [name]: value }));
		setError(null);
	};

	const handleRoleChange = (value: string) => {
		setNewUser(prev => ({
			...prev,
			role: value === 'MANAGER' ? RoleEnum.MANAGER : RoleEnum.USER
		}));
	};

	const validateUserForm = () => {
		if (!newUser.name) {
			setError("O nome é obrigatório");
			return false;
		}
		if (!newUser.email) {
			setError("O email é obrigatório");
			return false;
		}
		if (!newUser.password) {
			setError("A senha é obrigatória");
			return false;
		}
		if (newUser.password.length < 6) {
			setError("A senha deve ter pelo menos 6 caracteres");
			return false;
		}
		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newUser.email)) {
			setError("Email inválido");
			return false;
		}
		return true;
	};

	const handleCreateUser = async () => {
		if (!validateUserForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const response = await UserService.create({
				...newUser,
				id: 0,
				permissions: DEFAULT_PERMISSIONS
			});

			if (response.success && response.data) {
				// Create commission configuration with default values
				await CommissionService.createCommissionConfig({
					userId: response.data.id,
					companyId: companySelected.id,
					commissionType: CommissionTypeEnum.GENERAL,
					commissionMode: CommissionModeEnum.PERCENTAGE,
					commissionValue: 40 // Default percentage
				});

				toast({
					title: "Sucesso",
					description: `${newUser.name} adicionado à equipe com sucesso`
				});

				setIsUserModalOpen(false);
				setNewUser({
					name: '',
					email: '',
					password: '',
					role: RoleEnum.USER
				});

				await fetchCommissionData();
			} else {
				setError(response.error || "Erro ao criar usuário");
			}
		} catch (error) {
			setError("Erro ao criar usuário");
		} finally {
			setIsLoading(false);
		}
	};

	// Add function to fetch services
	const fetchServices = async () => {
		try {
			const response = await ServiceService.getAll(companySelected.id);
			if (response.success && response.data) {
				setServices(response.data);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao carregar serviços",
				variant: "destructive"
			});
		}
	};

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Comissões da Equipe</h1>
						<p className="text-sm text-gray-500">Gerencie as comissões dos membros da sua equipe</p>
					</div>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
						<div className="flex items-center space-x-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"justify-start text-left font-normal",
											!startDate && "text-muted-foreground"
										)}
									>
										<Calendar className="mr-2 h-4 w-4" />
										{startDate ? format(startDate, 'dd/MM/yyyy') : <span>Data inicial</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<CalendarComponent
										mode="single"
										selected={startDate}
										onSelect={setStartDate}
										initialFocus
										className="p-3 pointer-events-auto"
									/>
								</PopoverContent>
							</Popover>

							<span>até</span>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"justify-start text-left font-normal",
											!endDate && "text-muted-foreground"
										)}
									>
										<Calendar className="mr-2 h-4 w-4" />
										{endDate ? format(endDate, 'dd/MM/yyyy') : <span>Data final</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<CalendarComponent
										mode="single"
										selected={endDate}
										onSelect={setEndDate}
										initialFocus
										className="p-3 pointer-events-auto"
									/>
								</PopoverContent>
							</Popover>
						</div>

						<Button onClick={() => setIsUserModalOpen(true)} className="bg-barber-500 hover:bg-barber-600 transition-all">
							<UserPlus className="h-4 w-4 mr-2" />
							Novo Membro
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
					<Card className="bg-white border-l-4 border-barber-500">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
							<DollarSign className="h-4 w-4 text-barber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">R$ {totalStats.totalRevenue.toFixed(2)}</div>
							<p className="text-xs text-muted-foreground">
								+{totalStats.averageCommission.toFixed(2)}% comparado ao período anterior
							</p>
						</CardContent>
					</Card>
					<Card className="bg-white border-l-4 border-green-500">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
							<DollarSign className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">R$ {totalStats.totalCommissions.toFixed(2)}</div>
							<p className="text-xs text-muted-foreground">
								{totalStats.averageCommission.toFixed(2)}% do faturamento total
							</p>
						</CardContent>
					</Card>
					<Card className="bg-white border-l-4 border-blue-500">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
							<Scissors className="h-4 w-4 text-blue-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalStats.totalServices}</div>
							<p className="text-xs text-muted-foreground">
								+{totalStats.averageCommission.toFixed(2)}% comparado ao período anterior
							</p>
						</CardContent>
					</Card>
					<Card className="bg-white border-l-4 border-amber-500">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">% Média Comissão</CardTitle>
							<BarChart className="h-4 w-4 text-amber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalStats.averageCommission.toFixed(2)}%</div>
							<p className="text-xs text-muted-foreground">
								Configurável por membro e serviço
							</p>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-white shadow-sm">
					<CardHeader className="bg-gray-50 rounded-t-lg">
						<CardTitle className="flex items-center gap-2">
							<Percent className="h-5 w-5 text-barber-500" />
							Comissões da Equipe
						</CardTitle>
						<CardDescription>
							Dados do período selecionado: {startDate && format(startDate, 'dd/MM/yyyy')} até {endDate && format(endDate, 'dd/MM/yyyy')}
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="overflow-x-auto -mx-4 sm:mx-0">
							<div className="inline-block min-w-full align-middle">
								<Table>
									<TableHeader className="bg-gray-50">
										<TableRow>
											<TableHead>Profissional</TableHead>
											<TableHead>Tipo de Comissão</TableHead>
											<TableHead>Valor/Regras</TableHead>
											<TableHead className="text-right">Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{commissions.length === 0 ? (
											<TableRow>
												<TableCell colSpan={4} className="text-center py-8 text-gray-500">
													<div className="flex flex-col items-center gap-2">
														<Percent className="h-8 w-8 text-gray-400" />
														<p>Nenhum membro com comissão configurada</p>
														<Button 
															variant="outline" 
															size="sm" 
															className="mt-2"
															onClick={() => setIsUserModalOpen(true)}
														>
															<UserPlus className="h-4 w-4 mr-2" />
															Adicionar Membro
														</Button>
													</div>
												</TableCell>
											</TableRow>
										) : (
											commissions.map(commission => (
												<TableRow key={commission.id} className="hover:bg-gray-50 transition-colors">
													<TableCell className="font-medium">{commission.user.name}</TableCell>
													<TableCell>
														<div className="flex items-center">
															<span className={cn(
																"px-2 py-1 rounded-full text-xs font-medium",
																commission.commissionType === CommissionTypeEnum.GENERAL
																	? "bg-green-100 text-green-800"
																	: "bg-blue-100 text-blue-800"
															)}>
																{commission.commissionType === CommissionTypeEnum.GENERAL ? 'Geral' : 'Por serviço'}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<div className="text-sm">
															{commission.commissionType === CommissionTypeEnum.GENERAL
																? commission.commissionMode === CommissionModeEnum.FIXED
																	? <span className="text-gray-800">Recebe <span className="font-semibold">R$ {commission.commissionValue.toFixed(2)}</span> em todos os serviços</span>
																	: <span className="text-gray-800">Recebe <span className="font-semibold">{commission.commissionValue}%</span> em todos os serviços</span>
																: <span className="text-gray-800">
																	<span className="font-semibold">{commission.rules.length}</span> serviços configurados
																</span>
															}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex justify-end space-x-2">
															{commission.commissionType === CommissionTypeEnum.SERVICE && (
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 w-8 p-0"
																	title="Configurar Comissões por Serviço"
																	onClick={() => handleOpenServiceForm(commission.id)}
																>
																	<Eye className="h-4 w-4 text-blue-500" />
																</Button>
															)}
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="h-8 w-8 p-0"
																	>
																		<Settings className="h-4 w-4 text-gray-500" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end" className="w-56">
																	<DropdownMenuGroup>
																		<DropdownMenuItem
																			onClick={() => handleCommissionTypeChange(commission.id, CommissionTypeEnum.GENERAL)}
																			className="cursor-pointer"
																		>
																			Definir comissão geral
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => handleCommissionTypeChange(commission.id, CommissionTypeEnum.SERVICE)}
																			className="cursor-pointer"
																		>
																			Definir comissão por serviço
																		</DropdownMenuItem>
																		{commission.commissionType === CommissionTypeEnum.GENERAL && (
																			<DropdownMenuItem 
																				onClick={() => handleOpenSettings(commission.id)}
																				className="cursor-pointer"
																			>
																				Configurar porcentagem geral
																			</DropdownMenuItem>
																		)}
																	</DropdownMenuGroup>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="bg-gray-50 p-4 rounded-lg mt-8 border border-gray-200">
					<h3 className="text-lg font-medium mb-2">Como funcionam as comissões?</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-white p-4 rounded-lg border border-gray-200">
							<h4 className="flex items-center gap-2 text-barber-500 font-medium mb-2">
								<Percent className="h-4 w-4" />
								Comissão Geral
							</h4>
							<p className="text-sm text-gray-600">É uma porcentagem única aplicada a todos os serviços realizados pelo profissional. 
							Por exemplo, se configurado como 30%, o profissional receberá 30% do valor de qualquer serviço que realizar.</p>
						</div>
						<div className="bg-white p-4 rounded-lg border border-gray-200">
							<h4 className="flex items-center gap-2 text-blue-500 font-medium mb-2">
								<Scissors className="h-4 w-4" />
								Comissão por Serviço
							</h4>
							<p className="text-sm text-gray-600">Permite definir porcentagens diferentes para cada tipo de serviço. 
							Por exemplo, 20% para cortes, 30% para químicas, etc. Ideal para incentivar serviços específicos.</p>
						</div>
					</div>
				</div>
			</div>

			{/* Dialog para configuração de comissão geral */}
			<CommissionSettings
				isOpen={isSettingsOpen}
				onOpenChange={setIsSettingsOpen}
				barber={selectedBarber ? commissions.find(c => c.id === selectedBarber) : null}
				onSave={updateBarberGeneralCommission}
			/>

			{/* Dialog para visualização e edição de comissões por serviço */}
			<ServiceCommissionForm
				isOpen={isServiceFormOpen}
				onOpenChange={setIsServiceFormOpen}
				barber={selectedBarber ? commissions.find(c => c.id === selectedBarber) : null}
				services={services}
				serviceCommissions={selectedBarber ? serviceCommissions : []}
				onSave={updateServiceCommission}
			/>

			{/* Dialog para cadastro de novo usuário */}
			<Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Adicionar Novo Membro</DialogTitle>
						<DialogDescription>
							Preencha os dados para cadastrar um novo membro à equipe.
						</DialogDescription>
					</DialogHeader>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Nome
							</Label>
							<Input
								id="name"
								name="name"
								value={newUser.name}
								onChange={handleInputChange}
								className="col-span-3"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={newUser.email}
								onChange={handleInputChange}
								className="col-span-3"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="password" className="text-right">
								Senha
							</Label>
							<Input
								id="password"
								name="password"
								type="password"
								value={newUser.password}
								onChange={handleInputChange}
								className="col-span-3"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="role" className="text-right">
								Função
							</Label>
							<Select
								onValueChange={handleRoleChange}
								defaultValue={newUser.role === RoleEnum.MANAGER ? 'MANAGER' : 'USER'}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Selecione a função" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USER">Funcionário</SelectItem>
									<SelectItem value="MANAGER">Gerência</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
							Cancelar
						</Button>
						<Button 
							onClick={handleCreateUser} 
							disabled={isLoading}
							className="bg-barber-500 hover:bg-barber-600"
						>
							{isLoading ? 'Cadastrando...' : 'Cadastrar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AdminLayout>
	);
};

export default AdminCommissions;
