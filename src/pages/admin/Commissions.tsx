import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, BarChart, Eye, Settings, UserPlus, Percent, Download, Loader2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import CommissionSettings from '@/components/commission/CommissionSettings';
import ServiceCommissionForm from '@/components/commission/ServiceCommissionForm';
import CommissionService, {
	CommissionConfig,
	CommissionRule,
	CommissionTypeEnum,
	CommissionModeEnum,
	CommissionRuleTypeEnum
} from '@/services/api/CommissionService';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ServiceService, { Service } from '@/services/api/ServiceService';

const AdminCommissions = () => {
	const { companySelected } = useAuth();
	const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
	const [serviceCommissions, setServiceCommissions] = useState<CommissionRule[]>([]);
	const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [totalStats, setTotalStats] = useState({
		totalRevenue: 0,
		totalCommissions: 0,
		totalBarbers: 0,
		averageCommissionRate: 0
	});
	const { toast } = useToast();
	const [services, setServices] = useState<Service[]>([]);
	const [period, setPeriod] = useState('daily');

	useEffect(() => {
		fetchServices();
		fetchCommissionData();
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
		const totalBarbers = commissionData.length;

		const totalCommissions = commissionData.reduce((sum, item) => {
			if (item.commissionMode === CommissionModeEnum.FIXED) {
				return sum + item.commissionValue;
			}
			return sum + (item.commissionValue / 100);
		}, 0);

		const averageCommissionRate = commissionData.reduce((sum, item) => {
			return sum + (item.commissionType === CommissionTypeEnum.GENERAL ? item.commissionValue : 0);
		}, 0) / (commissionData.filter(item => item.commissionType === CommissionTypeEnum.GENERAL).length || 1);

		const totalRevenue = 0;

		setTotalStats({
			totalRevenue,
			totalCommissions,
			totalBarbers,
			averageCommissionRate
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
				commissionMode: CommissionModeEnum.DIVERSE,
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

	const updateServiceCommission = async (barberId: number, serviceId: number, value: number, serviceType: CommissionRuleTypeEnum) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			// Busca a regra existente para este serviço
			const rulesResponse = await CommissionService.getCommissionRulesByConfig(commission.id);
			if (!rulesResponse.success) {
				throw new Error("Erro ao buscar regras de comissão");
			}

			// Procura a regra específica para este serviço
			const existingRule = rulesResponse.data.find(rule => rule.serviceId === serviceId);

			if (!existingRule) {
				toast({
					title: "Erro",
					description: "Regra de comissão não encontrada para este serviço",
					variant: "destructive"
				});
				return;
			}

			// Atualiza a regra existente
			await CommissionService.updateCommissionRule(existingRule.id, {
				configId: commission.id,
				serviceId: serviceId,
				serviceType: serviceType,
				percentage: value,
			});

			const message = serviceType === CommissionRuleTypeEnum.PERCENTAGE
				? `Comissão do serviço atualizada para ${value}%`
				: `Comissão do serviço atualizada para R$ ${value.toFixed(2)}`;

			toast({
				title: "Comissão atualizada",
				description: message
			});

			// Atualiza a lista de comissões do barbeiro
			const updatedRulesResponse = await CommissionService.getCommissionRulesByConfig(commission.id);
			if (updatedRulesResponse.success) {
				setServiceCommissions(updatedRulesResponse.data || []);
			}

			await fetchCommissionData();
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao atualizar comissão do serviço",
				variant: "destructive"
			});
		}
	};

	const updateBarberGeneralCommission = async (barberId: number, value: number) => {
		try {
			const commission = commissions.find(c => c.id === barberId);
			if (!commission) return;

			await CommissionService.updateCommissionConfig(commission.id, {
				commissionValue: value,
				commissionType: CommissionTypeEnum.GENERAL,
				userId: commission.userId,
				companyId: commission.companyId,
				commissionMode: CommissionModeEnum.DIVERSE
			});

			await fetchCommissionData();

			toast({
				title: "Comissão geral atualizada",
				description: `Comissão geral definida para ${value}% em todos os serviços`
			});
		} catch (error) {
			toast({
				title: "Erro",
				description: "Erro ao atualizar comissão geral",
				variant: "destructive"
			});
		}
	};

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
						<h1 className="text-2xl font-bold text-gray-800">Informações da Equipe e Comissões</h1>
						<p className="text-sm text-gray-500">Gerencie as comissões dos membros da sua equipe</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Card className="shadow-md">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
							<UserPlus className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalStats.totalBarbers}</div>
							<p className="text-xs text-muted-foreground">
								Profissionais com comissão configurada
							</p>
						</CardContent>
					</Card>

					<Card className="shadow-md">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Comissão Geral</CardTitle>
							<BarChart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{commissions.filter(c => c.commissionType === CommissionTypeEnum.GENERAL).length}
							</div>
							<p className="text-xs text-muted-foreground">
								Profissionais com comissão geral
							</p>
						</CardContent>
					</Card>

					<Card className="shadow-md">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Comissão por Serviço</CardTitle>
							<Scissors className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{commissions.filter(c => c.commissionType === CommissionTypeEnum.SERVICE).length}
							</div>
							<p className="text-xs text-muted-foreground">
								Profissionais com comissão por serviço
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
																? <span className="text-gray-800">Recebe <span className="font-semibold">{commission.commissionValue}%</span> em todos os serviços</span>
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
																		{commission.commissionType === CommissionTypeEnum.SERVICE ? (
																			<DropdownMenuItem
																				onClick={() => handleCommissionTypeChange(commission.id, CommissionTypeEnum.GENERAL)}
																				className="cursor-pointer"
																			>
																				Alterar para comissão geral
																			</DropdownMenuItem>
																		) : (
																			<DropdownMenuItem
																				onClick={() => handleCommissionTypeChange(commission.id, CommissionTypeEnum.SERVICE)}
																				className="cursor-pointer"
																			>
																				Alterar para comissão por serviço
																			</DropdownMenuItem>
																		)}
																		{commission.commissionType === CommissionTypeEnum.GENERAL && (
																			<DropdownMenuItem
																				onClick={() => handleOpenSettings(commission.id)}
																				className="cursor-pointer"
																			>
																				Configurar comissão
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

				<div className="flex space-x-2 mb-4">
					<Button
						variant={period === 'daily' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setPeriod('daily')}
						className={period === 'daily' ? 'bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium' : 'font-medium'}
					>
						Diário
					</Button>
					<Button
						variant={period === 'weekly' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setPeriod('weekly')}
						className={period === 'weekly' ? 'bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium' : 'font-medium'}
					>
						Semanal
					</Button>
					<Button
						variant={period === 'monthly' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setPeriod('monthly')}
						className={period === 'monthly' ? 'bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium' : 'font-medium'}
					>
						Mensal
					</Button>
				</div>

			</div>

			<CommissionSettings
				isOpen={isSettingsOpen}
				onOpenChange={setIsSettingsOpen}
				barber={selectedBarber ? commissions.find(c => c.id === selectedBarber) : null}
				onSave={updateBarberGeneralCommission}
			/>

			<ServiceCommissionForm
				isOpen={isServiceFormOpen}
				onOpenChange={setIsServiceFormOpen}
				barber={selectedBarber ? commissions.find(c => c.id === selectedBarber) : null}
				services={services}
				serviceCommissions={selectedBarber ? serviceCommissions : []}
				onSave={updateServiceCommission}
			/>

		</AdminLayout>
	);
};

export default AdminCommissions;