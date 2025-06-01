import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, User, Edit, Loader2, Plus } from 'lucide-react';
import ClientService, { Client, ClientRegisterRequest } from '@/services/api/ClientService';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { handlePhoneInputChange, applyPhoneMask } from '@/utils/phone';
import { useNavigate } from 'react-router-dom';

const AdminClients = () => {
	const { companySelected, hasPermission } = useAuth();
	const navigate = useNavigate();
	const canManageClients = hasPermission('manageClients');
	const canViewAllClients = hasPermission('viewAllClients');
	const canViewOwnClients = hasPermission('viewOwnClients');
	const hasAccessToClients = canViewAllClients || canViewOwnClients;
	const [clients, setClients] = useState<Client[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	// Add state for client form and modal
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [newClient, setNewClient] = useState<ClientRegisterRequest>({
		name: '',
		email: '',
		phone: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [clientComments, setClientComments] = useState<Record<number, string>>({});
	const [currentComment, setCurrentComment] = useState('');

	// Adicione esta interface para gerenciar os erros
	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		phone?: string;
	}>({});

	useEffect(() => {
		fetchClients();
		// Load comments from localStorage
		const savedComments = localStorage.getItem('clientComments');
		if (savedComments) {
			setClientComments(JSON.parse(savedComments));
		}
	}, []);

	// Redirecionamento se não tiver nenhuma permissão
	useEffect(() => {
		if (!hasAccessToClients) {
			toast.error('Você não tem permissão para acessar a lista de clientes.');
			navigate('/admin');
		}
	}, [hasAccessToClients, navigate]);

	const fetchClients = async () => {
		if (!hasAccessToClients) return;

		setIsLoading(true);
		try {
			let response;
			if (canViewAllClients) {
				response = await ClientService.getAll(companySelected.id);
			} else {
				response = await ClientService.getByBarber();
			}

			if (response.success && response.data) {
				setClients(response.data);
			} else {
				toast.error(response.error || 'Erro ao carregar clientes');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Client-side filter - could be replaced with a server-side search in a real app
		if (!searchTerm) {
			fetchClients();
		}
	};

	// Function to create a new client
	const handleAddClient = async () => {
		setIsSubmitting(true);

		// Reset errors
		setErrors({});

		// Validate form
		let hasErrors = false;
		const newErrors: {
			name?: string;
			email?: string;
			phone?: string;
		} = {};

		if (!newClient.name.trim()) {
			newErrors.name = "Nome é obrigatório";
			hasErrors = true;
		}

		if (!newClient.email.trim()) {
			newErrors.email = "Email é obrigatório";
			hasErrors = true;
		} else if (!/^\S+@\S+\.\S+$/.test(newClient.email)) {
			newErrors.email = "Email inválido";
			hasErrors = true;
		}

		if (!newClient.phone.trim()) {
			newErrors.phone = "Telefone é obrigatório";
			hasErrors = true;
		} else if (newClient.phone.replace(/\D/g, '').length < 10) {
			newErrors.phone = "Telefone inválido";
			hasErrors = true;
		}

		if (hasErrors) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await ClientService.createClient(newClient, companySelected.id);

			if (response.success && response.data) {
				fetchClients();
				setNewClient({
					name: '',
					email: '',
					phone: '',
				});
				setIsAddDialogOpen(false);
				toast.success(`${response.data.name} foi adicionado com sucesso.`);
			} else {
				toast.error(response.error || 'Erro ao adicionar cliente');
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Function to save client comment
	const handleSaveComment = () => {
		if (!selectedClient || !selectedClient.id) return;

		setIsSubmitting(true);
		try {
			// Save comment to localStorage
			const updatedComments = {
				...clientComments,
				[selectedClient.id]: currentComment
			};

			localStorage.setItem('clientComments', JSON.stringify(updatedComments));
			setClientComments(updatedComments);

			setSelectedClient(null);
			setCurrentComment('');
			setIsEditDialogOpen(false);
			toast.success(`Comentário para ${selectedClient.name} foi salvo com sucesso.`);
		} catch (error) {
			toast.error('Erro ao salvar comentário');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openEditDialog = (client: Client) => {
		setSelectedClient(client);
		// Load any existing comments from localStorage
		setCurrentComment(clientComments[client.id || 0] || '');
		setIsEditDialogOpen(true);
	};

	const closeDialog = () => {
		setNewClient({
			name: '',
			email: '',
			phone: '',
		});
		setIsAddDialogOpen(false);
		setIsEditDialogOpen(false);
		setSelectedClient(null);
		setCurrentComment('');
		setErrors({});
	};

	const filteredClients = searchTerm
		? clients.filter(client =>
			client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.email.toLowerCase().includes(searchTerm.toLowerCase())
		)
		: clients;

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl font-bold">
						{canViewAllClients ? 'Todos os Clientes' : 'Meus Clientes'}
					</h1>
					{canManageClients && (
						<Button
							onClick={() => {
								setSelectedClient(null);
								setIsAddDialogOpen(true);
							}}
							className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
						>
							<Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
						</Button>
					)}
				</div>

				<form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
					<div className="relative w-full sm:max-w-md">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
						<input
							type="search"
							placeholder="Buscar cliente..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-barber-500"
						/>
					</div>
					<Button type="submit" variant="outline" className="w-full sm:w-auto">
						Buscar
					</Button>
				</form>

				<Card>
					<CardHeader>
						<CardTitle>Lista de Clientes</CardTitle>
						<CardDescription>
							{canViewAllClients
								? 'Gerencie todos os clientes da barbearia.'
								: 'Visualize seus clientes atendidos.'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex justify-center items-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-barber-500" />
							</div>
						) : (
							<div className="overflow-x-auto -mx-4 sm:mx-0">
								<div className="inline-block min-w-full align-middle">
									<table className="min-w-full divide-y divide-gray-200">
										<thead>
											<tr>
												<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
												<th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
												<th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
												<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{filteredClients.length > 0 ? (
												filteredClients.map(client => (
													<tr key={client.id} className="hover:bg-gray-50">
														<td className="px-3 py-3 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">{client.name}</div>
														</td>
														<td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
															<div className="text-sm text-gray-900">{applyPhoneMask(client.phone)}</div>
														</td>
														<td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
															<div className="text-sm text-gray-900">{client.email}</div>
														</td>
														<td className="px-3 py-3 whitespace-nowrap">
															<div className="flex space-x-2">
																{canManageClients && (
																	<button
																		className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
																		title="Editar"
																		onClick={() => openEditDialog(client)}
																	>
																		<Edit className="h-4 w-4" />
																	</button>
																)}
																<a
																	href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="p-1 text-green-500 hover:text-green-700"
																	title="WhatsApp"
																>
																	<Phone className="h-4 w-4" />
																</a>
																<a
																	href={`mailto:${client.email}`}
																	className="p-1 text-gray-500 hover:text-gray-700"
																	title="Email"
																>
																	<Mail className="h-4 w-4" />
																</a>
															</div>
														</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
														{searchTerm ? 'Nenhum cliente encontrado com este termo de busca.' : 'Nenhum cliente cadastrado.'}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
							<User className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{clients.length}</div>
							<p className="text-xs text-muted-foreground">
								Clientes cadastrados
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
							<User className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{clients.length}</div>
							<p className="text-xs text-muted-foreground">
								Clientes com cadastro ativo
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Retenção de Clientes</CardTitle>
							<User className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">5 em 10</div>
							<p className="text-xs text-muted-foreground">
								clientes voltam para outros serviços
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Add Client Dialog */}
			{canManageClients && (
				<>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Adicionar Novo Cliente</DialogTitle>
								<DialogDescription>
									Preencha os detalhes do cliente abaixo.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="name">
										Nome <span className="text-red-500">*</span>
									</Label>
									<Input
										id="name"
										value={newClient.name}
										onChange={(e) => {
											setNewClient({ ...newClient, name: e.target.value });
											if (errors.name) setErrors({ ...errors, name: undefined });
										}}
										className={errors.name ? "border-red-500" : ""}
									/>
									{errors.name && (
										<p className="text-sm text-red-500">{errors.name}</p>
									)}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">
										Email <span className="text-red-500">*</span>
									</Label>
									<Input
										id="email"
										type="email"
										value={newClient.email}
										onChange={(e) => {
											setNewClient({ ...newClient, email: e.target.value });
											if (errors.email) setErrors({ ...errors, email: undefined });
										}}
										className={errors.email ? "border-red-500" : ""}
									/>
									{errors.email && (
										<p className="text-sm text-red-500">{errors.email}</p>
									)}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="phone">
										Telefone <span className="text-red-500">*</span>
									</Label>
									<Input
										id="phone"
										value={applyPhoneMask(newClient.phone)}
										onChange={(e) => {
											handlePhoneInputChange(e, (value) => setNewClient({ ...newClient, phone: value }));
											if (errors.phone) setErrors({ ...errors, phone: undefined });
										}}
										placeholder="(00) 00000-0000"
										maxLength={15}
										className={errors.phone ? "border-red-500" : ""}
									/>
									{errors.phone && (
										<p className="text-sm text-red-500">{errors.phone}</p>
									)}
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										closeDialog()
									}}
									className="font-medium"
								>
									Cancelar
								</Button>
								<Button
									onClick={handleAddClient}
									disabled={isSubmitting}
									className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Adicionando...
										</>
									) : 'Adicionar Cliente'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Edit Client Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Adicionar Comentário</DialogTitle>
								<DialogDescription>
									Adicione notas sobre o cliente {selectedClient?.name}.
								</DialogDescription>
							</DialogHeader>
							{selectedClient && (
								<div className="grid gap-4 py-4">
									<div className="text-sm text-gray-600 mb-2">
										<div><strong>Telefone:</strong> {applyPhoneMask(selectedClient.phone)}</div>
										<div><strong>Email:</strong> {selectedClient.email}</div>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="edit-comments">Comentários</Label>
										<Textarea
											id="edit-comments"
											value={currentComment}
											onChange={(e) => setCurrentComment(e.target.value)}
											placeholder="Fale aqui sobre seu cliente para você poder consultar na próxima vez que ele te visitar e lembrar de informações dele"
											rows={6}
										/>
									</div>
								</div>
							)}
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										closeDialog()
									}}
									className="font-medium"
								>
									Cancelar
								</Button>
								<Button
									onClick={handleSaveComment}
									disabled={isSubmitting}
									className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Salvando...
										</>
									) : 'Salvar Comentário'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</>
			)}
		</AdminLayout>
	);
};

export default AdminClients;
