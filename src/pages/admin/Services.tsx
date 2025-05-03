import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Clock, DollarSign, Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Service, ServiceService } from '@/services/api/ServiceService';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/currency';

interface ServiceForm {
	id?: number;
	name: string;
	description: string;
	price: number;
	duration: number;
	companyId: number;
}

const serviceService = new ServiceService()

const AdminServices = () => {
	const { companySelected } = useAuth()
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState<number | null>(null);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedService, setSelectedService] = useState<Service | null>(null);
	const [newService, setNewService] = useState<ServiceForm>({
		name: '',
		description: '',
		price: 0,
		duration: 30,
		companyId: companySelected.id
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<{
		name?: string;
		price?: string;
		duration?: string;
	}>({});

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		setIsLoading(true);
		try {
			const response = await serviceService.getAll(companySelected.id);

			if (response.success && response.data) {
				setServices(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar serviços');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		setIsDeleting(id);
		try {
			const response = await serviceService.delete(id);
			if (response.success) {
				toast.success('Serviço excluído com sucesso');
				fetchServices();
				setIsDeleteDialogOpen(false);
				setSelectedService(null);
			} else {
				toast.error(response.error || 'Erro ao excluir serviço');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsDeleteDialogOpen(false)
			setIsDeleting(null);
		}
	};

	const handleAddService = async () => {
		setIsSubmitting(true);
		// Reset errors
		setErrors({});

		// Validate form
		let hasErrors = false;
		const newErrors: {
			name?: string;
			price?: string;
			duration?: string;
		} = {};

		if (!newService.name.trim()) {
			newErrors.name = "O nome do serviço é obrigatório";
			hasErrors = true;
		}

		if (!newService.price || newService.price <= 0) {
			newErrors.price = "O preço deve ser maior que zero";
			hasErrors = true;
		}

		if (!newService.duration || newService.duration <= 0) {
			newErrors.duration = "A duração deve ser maior que zero";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await serviceService.create(newService);

			if (response.success && response.data) {
				setServices([...services, response.data]);
				setNewService({
					name: '',
					description: '',
					price: 0,
					duration: 30,
					companyId: companySelected.id
				});
				setIsAddDialogOpen(false);
				toast.success(`${response.data.name} foi adicionado com sucesso.`);
				fetchServices();
			} else {
				toast.error(response.error || 'Erro ao adicionar serviço');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditService = async () => {
		if (!selectedService || !selectedService.id) return;

		setIsSubmitting(true);
		// Reset errors
		setErrors({});

		// Validate form
		let hasErrors = false;
		const newErrors: {
			name?: string;
			price?: string;
			duration?: string;
		} = {};

		if (!selectedService.name.trim()) {
			newErrors.name = "O nome do serviço é obrigatório";
			hasErrors = true;
		}

		if (!selectedService.price || selectedService.price <= 0) {
			newErrors.price = "O preço deve ser maior que zero";
			hasErrors = true;
		}

		if (!selectedService.duration || selectedService.duration <= 0) {
			newErrors.duration = "A duração deve ser maior que zero";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await serviceService.update(selectedService.id, selectedService);

			if (response.success && response.data) {
				const updatedServices = services.map(s =>
					s.id === selectedService.id ? response.data! : s
				);
				setServices(updatedServices);
				setSelectedService(null);
				setIsEditDialogOpen(false);
				toast.success(`${response.data.name} foi atualizado com sucesso.`);
			} else {
				toast.error(response.error || 'Erro ao atualizar serviço');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const closeDialog = () => {
		setIsAddDialogOpen(false);
		setNewService({
			name: '',
			description: '',
			price: 0,
			duration: 30,
			companyId: companySelected.id
		});
	};

	const openEditDialog = (service: Service) => {
		setSelectedService(service);
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (service: Service) => {
		setSelectedService(service);
		setIsDeleteDialogOpen(true);
	};

	// Calculate statistics
	const averageDuration = services.length > 0
		? Math.round(services.reduce((sum, service) => sum + service.duration, 0) / services.length)
		: 0;

	const averagePrice = services.length > 0
		? services.reduce((sum, service) => sum + service.price, 0) / services.length
		: 0;

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
					<Button
						className="bg-barber-500 hover:bg-barber-600"
						onClick={() => setIsAddDialogOpen(true)}
					>
						<Plus className="mr-2 h-4 w-4" />
						Novo Serviço
					</Button>
				</div>

				<Card className="border-0 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl text-gray-800">Catálogo de Serviços</CardTitle>
						<CardDescription>Gerencie os serviços oferecidos pela barbearia.</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-gray-50 text-left">
											<th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Nome</th>
											<th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Preço (R$)</th>
											<th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Duração (min)</th>
											<th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Descrição</th>
											<th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Ações</th>
										</tr>
									</thead>
									<tbody>
										{services.length > 0 ? services.map(service => (
											<tr key={service.id} className="hover:bg-blue-50/50">
												<td className="p-3 border-b border-gray-100">{service.name}</td>
												<td className="p-3 border-b border-gray-100">{service.price.toFixed(2)}</td>
												<td className="p-3 border-b border-gray-100">{service.duration}</td>
												<td className="p-3 border-b border-gray-100">{service.description}</td>
												<td className="p-3 border-b border-gray-100">
													<div className="flex space-x-2">
														<button
															className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
															title="Editar"
															onClick={() => openEditDialog(service)}
														>
															<Edit className="h-4 w-4" />
														</button>
														<button
															className="p-1 text-red-500 hover:text-red-700 transition-colors"
															title="Excluir"
															onClick={() => openDeleteDialog(service)}
															disabled={isDeleting === service.id}
														>
															{isDeleting === service.id ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="h-4 w-4" />
															)}
														</button>
													</div>
												</td>
											</tr>
										)) : (
											<tr>
												<td colSpan={5} className="p-3 text-center text-gray-500">
													Nenhum serviço encontrado.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="border-0 shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-gray-800">Total de Serviços</CardTitle>
							<Scissors className="h-4 w-4 text-barber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-800">{services.length}</div>
							<p className="text-xs text-gray-500">
								Serviços cadastrados
							</p>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-gray-800">Duração Média</CardTitle>
							<Clock className="h-4 w-4 text-barber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-800">{averageDuration} min</div>
							<p className="text-xs text-gray-500">
								Por atendimento
							</p>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-gray-800">Ticket Médio</CardTitle>
							<DollarSign className="h-4 w-4 text-barber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-800">R$ {averagePrice.toFixed(2)}</div>
							<p className="text-xs text-gray-500">
								Valor médio dos serviços
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Add Service Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Novo Serviço</DialogTitle>
						<DialogDescription>
							Adicione um novo serviço ao seu catálogo.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								Nome <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={newService.name}
								onChange={(e) => {
									setNewService({ ...newService, name: e.target.value });
									if (errors.name) setErrors({ ...errors, name: undefined });
								}}
								className={errors.name ? "border-red-500" : ""}
							/>
							{errors.name && (
								<p className="text-sm text-red-500">{errors.name}</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								rows={3}
								value={newService.description}
								onChange={(e) => setNewService({ ...newService, description: e.target.value })}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="price">
									Preço (R$) <span className="text-red-500">*</span>
								</Label>
								<Input
									id="price"
									type="number"
									min="0"
									step="0.01"
									value={newService.price}
									onChange={(e) => {
										setNewService({ ...newService, price: parseFloat(e.target.value) });
										if (errors.price) setErrors({ ...errors, price: undefined });
									}}
									className={errors.price ? "border-red-500" : ""}
								/>
								{errors.price && (
									<p className="text-sm text-red-500">{errors.price}</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label htmlFor="duration">
									Duração (min) <span className="text-red-500">*</span>
								</Label>
								<Input
									id="duration"
									type="number"
									min="5"
									step="5"
									value={newService.duration}
									onChange={(e) => {
										setNewService({ ...newService, duration: parseInt(e.target.value) });
										if (errors.duration) setErrors({ ...errors, duration: undefined });
									}}
									className={errors.duration ? "border-red-500" : ""}
								/>
								{errors.duration && (
									<p className="text-sm text-red-500">{errors.duration}</p>
								)}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={closeDialog}>Cancelar</Button>
						<Button onClick={handleAddService} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adicionando...
								</>
							) : (
								<>Adicionar Serviço</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Service Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Serviço</DialogTitle>
						<DialogDescription>
							Modifique as informações do serviço.
						</DialogDescription>
					</DialogHeader>
					{selectedService && (
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-name">
									Nome <span className="text-red-500">*</span>
								</Label>
								<Input
									id="edit-name"
									value={selectedService.name}
									onChange={(e) => {
										setSelectedService({ ...selectedService, name: e.target.value });
										if (errors.name) setErrors({ ...errors, name: undefined });
									}}
									className={errors.name ? "border-red-500" : ""}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name}</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-description">Descrição</Label>
								<Textarea
									id="edit-description"
									rows={3}
									value={selectedService.description}
									onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="edit-price">
										Preço (R$) <span className="text-red-500">*</span>
									</Label>
									<Input
										id="edit-price"
										type="number"
										min="0"
										step="0.01"
										value={selectedService.price}
										onChange={(e) => {
											setSelectedService({ ...selectedService, price: parseFloat(e.target.value) });
											if (errors.price) setErrors({ ...errors, price: undefined });
										}}
										className={errors.price ? "border-red-500" : ""}
									/>
									{errors.price && (
										<p className="text-sm text-red-500">{errors.price}</p>
									)}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-duration">
										Duração (min) <span className="text-red-500">*</span>
									</Label>
									<Input
										id="edit-duration"
										type="number"
										min="5"
										step="5"
										value={selectedService.duration}
										onChange={(e) => {
											setSelectedService({ ...selectedService, duration: parseInt(e.target.value) });
											if (errors.duration) setErrors({ ...errors, duration: undefined });
										}}
										className={errors.duration ? "border-red-500" : ""}
									/>
									{errors.duration && (
										<p className="text-sm text-red-500">{errors.duration}</p>
									)}
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditDialogOpen(false);
								setSelectedService(null);
							}}
						>
							Cancelar
						</Button>
						<Button onClick={handleEditService} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Salvando...
								</>
							) : (
								<>Salvar Alterações</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Service Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar Exclusão</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja excluir o serviço "{selectedService?.name}"?
							Esta ação não pode ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting !== null}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={() => selectedService?.id && handleDelete(selectedService.id)} disabled={isDeleting !== null}>
							{isDeleting !== null ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Excluindo...
								</>
							) : 'Excluir'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

		</AdminLayout>
	);
};

export default AdminServices;
