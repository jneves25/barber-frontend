import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Edit, Trash2, Check, DollarSign, Loader2, Plus, ShoppingBag, Users, UserRound } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import OrderEditModal from '@/components/appointment/OrderEditModal';
import AppointmentCreateModal from '@/components/appointment/AppointmentCreateModal';
import AppointmentService, { Appointment, AppointmentStatusEnum } from '@/services/api/AppointmentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const AdminAppointments = () => {
	// Estado para data selecionada
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
	const { user, companySelected, hasPermission } = useAuth();
	const navigate = useNavigate();

	// Estado para o modal de edição de comanda
	const [orderModalOpen, setOrderModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

	// Estado para o modal de criação de agendamento
	const [createModalOpen, setCreateModalOpen] = useState(false);

	// Estado para agendamentos
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState<number | null>(null);

	// Estado para o diálogo de cancelamento
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const [selectedAppointmentToCancel, setSelectedAppointmentToCancel] = useState<Appointment | null>(null);

	// Estado para filtro de visualização (todos/apenas meus)
	const [viewMode, setViewMode] = useState<'all' | 'own'>('all');

	// Verifica se o usuário tem permissão para visualizar todos os agendamentos
	const canViewAllAppointments = hasPermission('viewAllAppointments');
	// Verifica se o usuário tem permissão para visualizar seus próprios agendamentos
	const canViewOwnAppointments = hasPermission('viewOwnAppointments');
	// Verifica se o usuário tem permissão para gerenciar agendamentos
	const canManageAppointments = hasPermission('manageAppointments');
	// O usuário tem acesso à tela se tiver pelo menos uma das permissões
	const hasAccessToAppointments = canViewAllAppointments || canViewOwnAppointments;

	// Verificações de permissões para criação de agendamentos
	const canViewAllClients = hasPermission('viewAllClients');
	const canViewOwnClients = hasPermission('viewOwnClients');
	const canViewAllUsers = hasPermission('viewUsers');
	const hasAccessToClients = canViewAllClients || canViewOwnClients;
	const hasAccessToUsers = canViewAllUsers || true; // Usuário sempre pode ver a si mesmo

	// Determina se pode criar agendamentos baseado nas permissões necessárias
	const canCreateAppointments = canManageAppointments && hasAccessToClients && hasAccessToUsers;

	// Determina o modo de visualização de clientes e usuários para o modal
	const clientViewMode = canViewAllClients ? 'all' : 'own';
	const userViewMode = canViewAllUsers ? 'all' : 'own';

	// Se o usuário não tem permissão para ver todos, define o modo como 'own' por padrão
	useEffect(() => {
		if (!canViewAllAppointments) {
			setViewMode('own');
		}
	}, [canViewAllAppointments]);

	// Redirecionamento se não tiver nenhuma permissão
	useEffect(() => {
		if (!hasAccessToAppointments) {
			toast.error('Você não tem permissão para acessar a agenda.');
			navigate('/admin');
		}
	}, [hasAccessToAppointments]);

	// Fetch appointments on component mount or when selected date changes
	useEffect(() => {
		if (hasAccessToAppointments) {
			fetchAppointments();
		}
	}, [selectedDate, hasAccessToAppointments]);

	const fetchAppointments = async () => {
		if (!selectedDate || !hasAccessToAppointments) return;

		setIsLoading(true);
		try {
			const formattedDate = format(selectedDate, 'yyyy-MM-dd');

			// Usar rota de agendamentos por barbeiro se o usuário não tiver permissão para ver todos
			let response;
			if (canViewAllAppointments) {
				response = await AppointmentService.getAll(companySelected.id, formattedDate);
			} else {
				response = await AppointmentService.getByBarber(companySelected.id, formattedDate);
			}

			if (response.success && response.data) {
				setAppointments(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar agendamentos');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	// Filtrar agendamentos com base nas permissões e modo de visualização
	const filteredAppointments = (() => {
		// Se não tem permissão para visualizar todos, já estamos recebendo apenas os próprios agendamentos da API
		if (!canViewAllAppointments) {
			return appointments;
		}

		// Se tem permissão para visualizar todos E está no modo 'all', mostra todos
		if (viewMode === 'all') {
			return appointments;
		}

		// Caso contrário (viewMode === 'own'), filtra apenas os agendamentos do usuário logado
		return appointments.filter(app => app.userId === Number(user?.id));
	})();

	// Handler para abrir o modal de edição de comanda
	const handleOpenOrderModal = (appointment: Appointment) => {
		setSelectedAppointment(appointment);
		setOrderModalOpen(true);
	};

	// Handler para salvar a comanda editada
	const handleSaveOrder = async (appointment: Appointment) => {
		try {
			const response = await AppointmentService.update(appointment.id!, appointment);

			if (response.success && response.data) {
				setAppointments(prev =>
					prev.map(app => app.id === appointment.id ? response.data! : app)
				);
				toast.success('Comanda atualizada com sucesso!');
			} else {
				toast.error(response.error || 'Erro ao atualizar comanda');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		}
	};

	// Handler para completar um agendamento
	const handleCompleteService = async (id: number) => {
		try {
			const response = await AppointmentService.updateStatus(id, AppointmentStatusEnum.COMPLETED);

			if (response.success) {
				setAppointments(prev =>
					prev.map(app => app.id === id ? response.data! : app)
				);
				toast.success('Serviço finalizado com sucesso!');
			} else {
				toast.error(response.error || 'Erro ao finalizar serviço');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		}
	};

	// Handler para abrir o diálogo de cancelamento
	const handleOpenCancelDialog = (appointment: Appointment) => {
		setSelectedAppointmentToCancel(appointment);
		setIsCancelDialogOpen(true);
	};

	// Handler para cancelar o agendamento
	const handleCancelAppointment = async () => {
		if (!selectedAppointmentToCancel) return;

		try {
			const response = await AppointmentService.updateStatus(selectedAppointmentToCancel.id, AppointmentStatusEnum.CANCELED);

			if (response.success) {
				setAppointments(prev => prev.map(app => app.id === selectedAppointmentToCancel.id ? { ...app, status: AppointmentStatusEnum.CANCELED } : app));
				toast.success('Agendamento cancelado com sucesso!');
			} else {
				toast.error(response.error || 'Erro ao cancelar agendamento');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsCancelDialogOpen(false);
			setSelectedAppointmentToCancel(null);
		}
	};

	// Add this new handler function alongside the other handlers
	const handleReactivateAppointment = async (appointment: Appointment) => {
		try {
			const response = await AppointmentService.updateStatus(appointment.id!, AppointmentStatusEnum.PENDING);

			if (response.success) {
				setAppointments(prev =>
					prev.map(app => app.id === appointment.id ? { ...app, status: AppointmentStatusEnum.PENDING } : app)
				);
				toast.success('Agendamento reativado com sucesso!');
			} else {
				toast.error(response.error || 'Erro ao reativar agendamento');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		}
	};

	const getDayStats = () => {
		const filterDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

		// Filtrar por data, considerando as permissões do usuário
		const todayApps = (() => {
			// Primeiro filtrar pela data selecionada
			const dateFilteredApps = appointments.filter(app => {
				const appDate = app.scheduledTime ? new Date(app.scheduledTime).toISOString().split('T')[0] : '';
				return appDate === filterDate;
			});

			// Se não tem permissão para ver todos, já estamos recebendo apenas os próprios agendamentos
			if (!canViewAllAppointments) {
				return dateFilteredApps;
			}

			// Se tem permissão para ver todos e está no modo 'all', retorna todos
			if (viewMode === 'all') {
				return dateFilteredApps;
			}

			// Se está no modo 'own', filtra para mostrar apenas os agendamentos do usuário
			return dateFilteredApps.filter(app => app.userId === Number(user?.id));
		})();

		const pendingApps = todayApps.filter(app => app.status === AppointmentStatusEnum.PENDING).length;
		const completedApps = todayApps.filter(app => app.status === AppointmentStatusEnum.COMPLETED).length;
		const canceledApps = todayApps.filter(app => app.status === AppointmentStatusEnum.CANCELED).length;

		const totalValue = todayApps
			.filter(app => app.status === AppointmentStatusEnum.COMPLETED)
			.reduce((sum, app) => sum + app.value, 0);

		return {
			total: todayApps.length,
			pending: pendingApps,
			completed: completedApps,
			canceled: canceledApps,
			totalValue
		};
	};

	const countTotalProductItems = (products: any[]) => {
		if (!products || products.length === 0) return 0;
		return products.reduce((total, product) => total + product.quantity, 0);
	};

	const stats = getDayStats();

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl font-bold">
						{canViewAllAppointments && viewMode === 'all' ? 'Agenda' : 'Minha Agenda'}
					</h1>
					<div className="flex flex-col sm:flex-row gap-2">
						{/* Botões de filtro - Apenas visíveis se o usuário pode ver todos */}
						{canViewAllAppointments && (
							<div className="flex bg-slate-100 rounded-md p-0.5">
								<Button
									variant={viewMode === 'all' ? 'default' : 'ghost'}
									className={cn(
										"flex-1 rounded-md text-xs h-8 px-3",
										viewMode === 'all' ? "bg-[#1776D2] text-white" : "text-slate-500"
									)}
									onClick={() => setViewMode('all')}
								>
									<Users className="h-3.5 w-3.5 mr-2" />
									Todos
								</Button>
								<Button
									variant={viewMode === 'own' ? 'default' : 'ghost'}
									className={cn(
										"flex-1 rounded-md text-xs h-8 px-3",
										viewMode === 'own' ? "bg-[#1776D2] text-white" : "text-slate-500"
									)}
									onClick={() => setViewMode('own')}
								>
									<UserRound className="h-3.5 w-3.5 mr-2" />
									Meus
								</Button>
							</div>
						)}

						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="w-full sm:w-auto flex items-center justify-between gap-2"
								>
									<CalendarIcon className="h-4 w-4" />
									{selectedDate ? (
										format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
									) : (
										"Selecionar data"
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={setSelectedDate}
									initialFocus
									className="p-3 pointer-events-auto"
								/>
							</PopoverContent>
						</Popover>
						{/* Botão de novo agendamento - Apenas visível se o usuário pode gerenciar agendamentos */}
						{canCreateAppointments && (
							<Button
								variant="default"
								className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
								onClick={() => setCreateModalOpen(true)}
							>
								<Plus className="h-4 w-4 mr-2" />
								Novo Agendamento
							</Button>
						)}
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>
							{canViewAllAppointments && viewMode === 'all' ? 'Agendamentos' : 'Meus Agendamentos'}
						</CardTitle>
						<CardDescription>
							{selectedDate
								? `Visualizando agendamentos para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
								: canViewAllAppointments && viewMode === 'all'
									? "Visualize e gerencie todos os agendamentos da barbearia."
									: "Visualize e gerencie seus agendamentos."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
							</div>
						) : (
							<div className="overflow-x-auto">
								<div className="inline-block min-w-full align-middle">
									{filteredAppointments.length > 0 ? (
										<table className="min-w-full divide-y divide-gray-200">
											<thead>
												<tr>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviços</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
													{/* Só mostra coluna de barbeiro quando estiver visualizando todos */}
													{canViewAllAppointments && viewMode === 'all' && (
														<th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
													)}
													<th className="hidden sm:table-cell px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
													{canManageAppointments && (
														<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
													)}
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{filteredAppointments.map(appointment => {
													const isCompleted = appointment.status === AppointmentStatusEnum.COMPLETED;
													const isCanceled = appointment.status === AppointmentStatusEnum.CANCELED;
													const isPending = appointment.status === AppointmentStatusEnum.PENDING;
													const hasProducts = appointment.products && appointment.products.length > 0;

													return (
														<tr key={appointment.id} className="hover:bg-gray-50">
															<td className="px-3 py-3 whitespace-nowrap">
																<div className="text-sm font-medium text-gray-900">{appointment.client.name}</div>
															</td>
															<td className="px-3 py-3">
																<div className="text-sm text-gray-900 max-w-[200px] truncate">
																	{appointment.services && appointment.services.length > 0
																		? appointment.services.map(service => {
																			const quantity = service.quantity > 1 ? ` (${service.quantity}x)` : '';
																			return `${service.service.name}${quantity}`;
																		}).join(', ')
																		: 'Nenhum serviço'
																	}
																</div>
															</td>
															<td className="px-3 py-3">
																{hasProducts ? (
																	<TooltipProvider>
																		<Tooltip>
																			<TooltipTrigger asChild>
																				<div className="flex items-center text-sm text-gray-900 cursor-pointer">
																					<ShoppingBag className="h-4 w-4 mr-1 text-blue-500" />
																					<span>{countTotalProductItems(appointment.products)} produtos</span>
																				</div>
																			</TooltipTrigger>
																			<TooltipContent className="max-w-[300px] p-3">
																				<h4 className="font-semibold mb-1">Produtos:</h4>
																				<ul className="list-disc pl-5 space-y-1">
																					{appointment.products.map((product, idx) => (
																						<li key={idx}>
																							{product.product.name}
																							<span className="text-gray-500">
																								{product.quantity > 1 ? ` (${product.quantity}x)` : ''} -
																								R$ {(product.product.price * product.quantity).toFixed(2)}
																							</span>
																						</li>
																					))}
																				</ul>
																			</TooltipContent>
																		</Tooltip>
																	</TooltipProvider>
																) : (
																	<span className="text-sm text-gray-500">Nenhum produto</span>
																)}
															</td>
															{/* Só mostra a coluna de barbeiro quando está visualizando todos */}
															{canViewAllAppointments && viewMode === 'all' && (
																<td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
																	<div className="text-sm text-gray-900">{appointment.user.name}</div>
																</td>
															)}
															<td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
																<div className="flex justify-center">
																	<div className={cn(
																		"text-sm font-medium py-1 rounded-full flex items-center justify-center w-16",
																		isCompleted && "bg-green-100 text-green-800",
																		isPending && "bg-yellow-100 text-yellow-800",
																		isCanceled && "bg-red-100 text-red-800"
																	)}>
																		<Clock className="h-3 w-3 mr-1" />
																		{appointment.scheduledTime ? format(new Date(appointment.scheduledTime), 'HH:mm') : '-'}
																	</div>
																</div>
															</td>
															<td className="px-3 py-3 whitespace-nowrap">
																<div className="text-sm text-gray-900">R$ {appointment.value.toFixed(2)}</div>
															</td>
															<td className="px-3 py-3 whitespace-nowrap">
																<div>
																	{isPending && (
																		<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>
																	)}
																	{isCompleted && (
																		<Badge className="bg-green-100 text-green-800 hover:bg-green-200">Finalizado</Badge>
																	)}
																	{isCanceled && (
																		<Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelado</Badge>
																	)}
																</div>
															</td>
															{/* Coluna de ações - Apenas visível se o usuário pode gerenciar agendamentos */}
															{canManageAppointments && (
																<td className="px-3 py-3 whitespace-nowrap">
																	<div className="flex space-x-2">
																		{isPending && (
																			<TooltipProvider>
																				<Tooltip>
																					<TooltipTrigger asChild>
																						<button
																							onClick={() => handleOpenOrderModal(appointment)}
																							className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																						>
																							<Edit className="h-4 w-4" />
																						</button>
																					</TooltipTrigger>
																					<TooltipContent>
																						<p>Editar comanda</p>
																					</TooltipContent>
																				</Tooltip>
																			</TooltipProvider>
																		)}

																		{!isCanceled && !isCompleted && (
																			<>
																				<TooltipProvider>
																					<Tooltip>
																						<TooltipTrigger asChild>
																							<button
																								onClick={() => handleCompleteService(appointment.id!)}
																								className="p-1 text-green-500 hover:text-green-700 transition-colors"
																							>
																								<Check className="h-4 w-4" />
																							</button>
																						</TooltipTrigger>
																						<TooltipContent>
																							<p>Finalizar serviço</p>
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>

																				<TooltipProvider>
																					<Tooltip>
																						<TooltipTrigger asChild>
																							<button
																								onClick={() => {
																									if (appointment.status)
																										handleOpenCancelDialog(appointment);
																								}}
																								className="p-1 text-red-500 hover:text-red-700 transition-colors"
																								disabled={isDeleting === appointment.id}
																							>
																								{isDeleting === appointment.id ? (
																									<Loader2 className="h-4 w-4 animate-spin" />
																								) : (
																									<Trash2 className="h-4 w-4" />
																								)}
																							</button>
																						</TooltipTrigger>
																						<TooltipContent>
																							<p>Cancelar</p>
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>
																			</>
																		)}

																		{isCanceled && (
																			<TooltipProvider>
																				<Tooltip>
																					<TooltipTrigger asChild>
																						<button
																							onClick={() => handleReactivateAppointment(appointment)}
																							className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																						>
																							<Clock className="h-4 w-4" />
																						</button>
																					</TooltipTrigger>
																					<TooltipContent>
																						<p>Reativar</p>
																					</TooltipContent>
																				</Tooltip>
																			</TooltipProvider>
																		)}
																	</div>
																</td>
															)}
														</tr>
													);
												})}
											</tbody>
										</table>
									) : (
										<div className="text-center py-12">
											<h3 className="text-lg font-medium text-gray-500 mb-2">
												Nenhum agendamento encontrado
											</h3>
											<p className="text-gray-400">
												Não há agendamentos para esta data.
											</p>
										</div>
									)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								{canViewAllAppointments && viewMode === 'all' ? 'Agendamentos Hoje' : 'Meus Agendamentos Hoje'}
							</CardTitle>
							<CalendarIcon className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.total}</div>
							<p className="text-xs text-gray-500 mt-1">
								<span className="text-yellow-500">{stats.pending} pendentes</span> •
								<span className="text-green-500"> {stats.completed} finalizados</span>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Agendamentos Pendentes</CardTitle>
							<Clock className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.pending}</div>
							<p className="text-xs text-gray-500 mt-1">
								Aguardando atendimento
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Agendamentos Concluídos</CardTitle>
							<Check className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.completed}</div>
							<p className="text-xs text-gray-500 mt-1">
								Serviços finalizados hoje
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								{canViewAllAppointments && viewMode === 'all' ? 'Total do Dia' : 'Meu Total do Dia'}
							</CardTitle>
							<DollarSign className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								R$ {stats.totalValue.toFixed(2)}
							</div>
							<p className="text-xs text-gray-500 mt-1">
								{stats.completed} serviços finalizados
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Modal para edição de comanda - Apenas renderizado se o usuário pode gerenciar agendamentos */}
			{canManageAppointments && (
				<OrderEditModal
					isOpen={orderModalOpen}
					onClose={() => {
						setOrderModalOpen(false);
						setSelectedAppointment(null);
					}}
					appointment={selectedAppointment}
					onSave={handleSaveOrder}
				/>
			)}

			{/* Modal para criação de agendamento - Apenas renderizado se o usuário pode gerenciar agendamentos */}
			{canCreateAppointments && (
				<AppointmentCreateModal
					isOpen={createModalOpen}
					onClose={() => setCreateModalOpen(false)}
					onSuccess={fetchAppointments}
					initialDate={selectedDate}
					clientViewMode={clientViewMode}
					userViewMode={userViewMode}
				/>
			)}

			{/* Cancel Appointment Dialog - Apenas renderizado se o usuário pode gerenciar agendamentos */}
			{canManageAppointments && (
				<Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirmar Cancelamento</DialogTitle>
							<DialogDescription>
								Tem certeza que deseja cancelar o agendamento para "{selectedAppointmentToCancel?.client.name}"?
								Esta ação não pode ser desfeita.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCancelDialogOpen(false)}
								className="font-medium"
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								onClick={handleCancelAppointment}
								className="font-medium"
							>
								{isDeleting !== null ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelando...
									</>
								) : 'Cancelar Agendamento'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

		</AdminLayout>
	);
};

export default AdminAppointments;