
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Edit, Trash2, Check, DollarSign, Loader2, Plus } from 'lucide-react';
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

const AdminAppointments = () => {
	// Estado para data selecionada
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
	const { user, companySelected } = useAuth();

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

	// Fetch appointments on component mount or when selected date changes
	useEffect(() => {
		fetchAppointments();
	}, [selectedDate]);

	const fetchAppointments = async () => {
		setIsLoading(true);
		try {
			const response = await AppointmentService.getAll(companySelected.id);

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

	// Filtrar agendamentos pelo barbeiro atual se for um barbeiro
	const userAppointments = user?.role === 'USER'
		? appointments.filter(app => app.userId === Number(user.id))
		: appointments;

	// Filtrar agendamentos pela data selecionada
	const filteredAppointments = selectedDate
		? userAppointments.filter(app => {
			// Extract date part from createdAt
			const appDate = app.scheduledTime ? new Date(app.scheduledTime).toISOString().split('T')[0] : '';
			const filterDate = format(selectedDate, 'yyyy-MM-dd');
			return appDate === filterDate;
		})
		: userAppointments;

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

	// Handler para abrir um agendamento pendente
	const handleOpenService = (id: number) => {
		const appointment = appointments.find(app => app.id === Number(id));
		if (appointment) {
			handleOpenOrderModal(appointment);
		}
	};

	// Handler para excluir um agendamento
	const handleDeleteAppointment = async (id: number) => {
		setIsDeleting(id);
		try {
			const response = AppointmentService.updateStatus(id, AppointmentStatusEnum.CANCELED);

			if (response) {
				setAppointments(prev => prev.filter(app => app.id !== id));
				toast.success('Agendamento removido com sucesso!');
			} else {
				toast.error('Erro ao cancelar agendamento');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsDeleting(null);
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

		const todayApps = user?.role === 'USER'
			? appointments.filter(app => {
				const appDate = app.scheduledTime ? new Date(app.scheduledTime).toISOString().split('T')[0] : '';
				return appDate === filterDate && app.userId === user.id;
			})
			: appointments.filter(app => {
				const appDate = app.scheduledTime ? new Date(app.scheduledTime).toISOString().split('T')[0] : '';
				return appDate === filterDate;
			});

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

	const stats = getDayStats();

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl font-bold">
						{user?.role === 'USER' ? 'Minha Agenda' : 'Agenda'}
					</h1>
					<div className="flex flex-col sm:flex-row gap-2">
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
						<Button 
							className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
							onClick={() => setCreateModalOpen(true)}
						>
							<Plus className="h-4 w-4 mr-2" />
							Novo Agendamento
						</Button>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>
							{user?.role === 'USER' ? 'Meus Agendamentos' : 'Agendamentos'}
						</CardTitle>
						<CardDescription>
							{selectedDate
								? `Visualizando agendamentos para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
								: user?.role === 'USER'
									? "Visualize e gerencie seus agendamentos."
									: "Visualize e gerencie todos os agendamentos da barbearia."}
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
													{user?.role !== 'USER' && (
														<th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
													)}
													<th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
													<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{filteredAppointments.map(appointment => {
													const isCompleted = appointment.status === AppointmentStatusEnum.COMPLETED;
													const isCanceled = appointment.status === AppointmentStatusEnum.CANCELED;
													const isPending = appointment.status === AppointmentStatusEnum.PENDING;

													return (
														<tr key={appointment.id} className="hover:bg-gray-50">
															<td className="px-3 py-3 whitespace-nowrap">
																<div className="text-sm font-medium text-gray-900">{appointment.client.name}</div>
															</td>
															<td className="px-3 py-3 whitespace-nowrap">
																<div className="text-sm text-gray-900">
																	{appointment.services && appointment.services.length > 0
																		? appointment.services.map(service => service.service.name).join(' + ')
																		: 'Nenhum serviço'
																	}
																</div>
															</td>
															{user?.role !== 'USER' && (
																<td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
																	<div className="text-sm text-gray-900">{appointment.user.name}</div>
																</td>
															)}
															<td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
																<div className="text-sm text-gray-900">
																	{appointment.scheduledTime ? format(new Date(appointment.scheduledTime), 'dd/MM/yyyy HH:mm') : '-'}
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
															<td className="px-3 py-3 whitespace-nowrap">
																<div className="flex space-x-2">
																	{isPending && (
																		<button
																			onClick={() => handleOpenService(appointment.id!)}
																			className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																			title="Abrir comanda"
																		>
																			<Clock className="h-4 w-4" />
																		</button>
																	)}

																	<button
																		onClick={() => handleOpenOrderModal(appointment)}
																		className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																		title="Editar comanda"
																	>
																		<Edit className="h-4 w-4" />
																	</button>

																	{!isCanceled && !isCompleted && (
																		<>
																			<button
																				onClick={() => handleCompleteService(appointment.id!)}
																				className="p-1 text-green-500 hover:text-green-700 transition-colors"
																				title="Finalizar serviço"
																			>
																				<Check className="h-4 w-4" />
																			</button>

																			<button
																				onClick={() => {
																					if (appointment.status)
																						handleOpenCancelDialog(appointment);
																				}}
																				className="p-1 text-red-500 hover:text-red-700 transition-colors"
																				title="Cancelar"
																				disabled={isDeleting === appointment.id}
																			>
																				{isDeleting === appointment.id ? (
																					<Loader2 className="h-4 w-4 animate-spin" />
																				) : (
																					<Trash2 className="h-4 w-4" />
																				)}
																			</button>
																		</>
																	)}

																	{isCanceled && (
																		<button
																			onClick={() => handleReactivateAppointment(appointment)}
																			className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																			title="Reativar comanda"
																		>
																			<Clock className="h-4 w-4" />
																		</button>
																	)}
																</div>
															</td>
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
								{user?.role === 'USER' ? 'Meus Agendamentos Hoje' : 'Agendamentos Hoje'}
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
								{user?.role === 'USER' ? 'Meu Total do Dia' : 'Total do Dia'}
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

			{/* Modal para edição de comanda */}
			<OrderEditModal
				isOpen={orderModalOpen}
				onClose={() => {
					setOrderModalOpen(false);
					setSelectedAppointment(null);
				}}
				appointment={selectedAppointment}
				onSave={handleSaveOrder}
			/>

			{/* Modal para criação de agendamento */}
			<AppointmentCreateModal
				isOpen={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSuccess={fetchAppointments}
			/>

			{/* Cancel Appointment Dialog */}
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
						<Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isDeleting !== null}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleCancelAppointment} disabled={isDeleting !== null}>
							{isDeleting !== null ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cancelando...
								</>
							) : 'Cancelar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

		</AdminLayout>
	);
};

export default AdminAppointments;
