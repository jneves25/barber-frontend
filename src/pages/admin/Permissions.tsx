import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { User, Shield, Edit, Trash2, Plus, Save, X, AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import UserService, { RoleEnum, UserPermissions, User as UserType } from '@/services/api/UserService';
import { allPermissions, DEFAULT_PERMISSIONS } from '@/utils/permissions';

// Componente principal
const Permissions = () => {
	const { companySelected } = useAuth();
	const [users, setUsers] = useState<UserType[]>([]);
	const [isDeleting, setIsDeleting] = useState<number | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<UserType | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const { user: currentUser } = useAuth();
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [newUser, setNewUser] = useState({
		name: '',
		email: '',
		password: '',
		role: RoleEnum.USER,
		companyId: companySelected.id
	});
	const [selectedPermissions, setSelectedPermissions] = useState<UserPermissions>();
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<{
		name?: string;
		email?: string;
		password?: string;
	}>({});

	useEffect(() => {
		fetchUsersData();
	}, [companySelected]);

	const fetchUsersData = async () => {
		try {
			setIsLoading(true);
			const response = await UserService.getUsersByCompany(companySelected.id);

			if (response.success && response.data) {
				setUsers(response.data);
			}
		} catch (error) {
			toast.error('Erro ao carregar dados das comissões');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUserPermission = async (userId: number) => {
		try {
			setIsLoading(true);
			const response = await UserService.getPermissions(userId);

			if (response.success && response.data) {
				const permissions: UserPermissions = {
					userId,
					...response.data, // assume que o response.data contém apenas os campos booleanos
				};

				setSelectedPermissions(permissions);
			}
		} catch (error) {
			toast.error('Erro ao carregar permissões do usuário');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSavePermissions = async () => {
		if (!selectedPermissions) return;

		try {
			const response = await UserService.updatePermissions(selectedPermissions.userId, selectedPermissions);
			const responseUser = await UserService.update(selectedUser.id, selectedUser);

			if (response.success && responseUser.success) {
				setSelectedPermissions(null)
				setSelectedUser(null);

				await fetchUsersData();
				toast.success('Permissões salvas com sucesso!');
			}
		} catch (error) {
			toast.error('Erro inesperado ao salvar permissões.');
		}
	};

	// Edição de usuário
	const handleEditUser = (user: UserType) => {
		setSelectedUser(user);
		fetchUserPermission(user.id)
	};

	const handleDeleteUser = async (userId: number) => {
		setIsDeleting(userId);
		try {
			const response = await UserService.delete(userId);

			if (response.success) {
				toast.success('Serviço excluído com sucesso');
				fetchUsersData();
				setIsDeleteDialogOpen(null);
				setSelectedUser(null);
			}
		} catch (error) {
			toast.error('Erro ao conectar com o servidor');
			console.error(error);
		} finally {
			setIsDeleteDialogOpen(null)
			setIsDeleting(null);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewUser(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	const handleRoleChange = (value: string) => {
		setNewUser(prev => ({
			...prev,
			role: value === 'MANAGER' ? RoleEnum.MANAGER : RoleEnum.USER
		}));
	};

	const handleToggle = (id: keyof UserPermissions) => {
		if (!selectedPermissions) return;

		setSelectedPermissions((prev) => ({
			...prev!,
			[id]: !prev![id],
		}));
	};

	const handleCreateUser = async () => {
		setIsLoading(true);
		setErrors({}); // Limpa erros anteriores

		try {
			const response = await UserService.create({
				...newUser,
				permissions: DEFAULT_PERMISSIONS
			});

			if (response.success && response.data) {
				toast.success(`${newUser.name} adicionado à equipe com sucesso`);
				setIsUserModalOpen(false);
				setNewUser({
					name: '',
					email: '',
					password: '',
					role: RoleEnum.USER,
					companyId: companySelected.id
				});
				await fetchUsersData();
			} else {
				// Trata a resposta de erro
				if (typeof response.error === 'string') {
					// Se for apenas uma mensagem de erro, tenta determinar qual campo está com erro
					const errorMessage = response.error.toLowerCase();

					if (errorMessage.includes('nome')) {
						setErrors({ name: response.error });
					} else if (errorMessage.includes('email')) {
						setErrors({ email: response.error });
					} else if (errorMessage.includes('senha')) {
						setErrors({ password: response.error });
					} else {
						toast.error(response.error);
					}
				} else if (typeof response.error === 'object') {
					// Se for um objeto com erros por campo
					setErrors(response.error);
				}
			}
		} catch (error) {
			toast.error("Erro ao conectar com o servidor");
		} finally {
			setIsLoading(false);
		}
	};

	const closeDialog = () => {
		setIsUserModalOpen(false)
		setNewUser({
			name: '',
			email: '',
			password: '',
			role: RoleEnum.USER,
			companyId: companySelected.id
		})
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
					<div className="flex items-center gap-2">
						<div className="relative flex-1 flex gap-4">
							<Input
								placeholder="Buscar usuários..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
							<Button onClick={() => setIsUserModalOpen(true)} className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium">
								<UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
							</Button>
						</div>
						<Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Adicionar Novo Membro</DialogTitle>
									<DialogDescription>
										Preencha os dados para cadastrar um novo membro à equipe.
									</DialogDescription>
								</DialogHeader>

								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="name" className={`text-right ${errors.name ? 'text-red-500' : ''}`}>
											Nome <span className="text-red-500">*</span>
										</Label>
										<div className="col-span-3">
											<Input
												id="name"
												name="name"
												value={newUser.name}
												onChange={handleInputChange}
												className={`w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
											/>
											{errors.name && (
												<p className="text-red-500 text-sm mt-1">{errors.name}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="email" className={`text-right ${errors.email ? 'text-red-500' : ''}`}>
											Email <span className="text-red-500">*</span>
										</Label>
										<div className="col-span-3">
											<Input
												id="email"
												name="email"
												type="email"
												value={newUser.email}
												onChange={handleInputChange}
												className={`w-full ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
											/>
											{errors.email && (
												<p className="text-red-500 text-sm mt-1">{errors.email}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="password" className={`text-right ${errors.password ? 'text-red-500' : ''}`}>
											Senha <span className="text-red-500">*</span>
										</Label>
										<div className="col-span-3">
											<Input
												id="password"
												name="password"
												type="password"
												value={newUser.password}
												onChange={handleInputChange}
												className={`w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
											/>
											{errors.password && (
												<p className="text-red-500 text-sm mt-1">{errors.password}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="role" className="text-right">
											Função <span className="text-red-500">*</span>
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
									<Button
										variant="outline"
										onClick={() => closeDialog()}
										className="font-medium"
									>
										Cancelar
									</Button>
									<Button
										onClick={handleCreateUser}
										disabled={isLoading}
										className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
									>
										{isLoading ? 'Cadastrando...' : 'Cadastrar'}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Usuários e Permissões</CardTitle>
						<CardDescription>
							Gerencie os usuários e suas permissões de acesso ao sistema.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Usuário</th>
										<th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Email</th>
										<th className="py-3 px-2 text-left font-medium text-xs uppercase tracking-wider">Função</th>
										<th className="py-3 px-2 text-right font-medium text-xs uppercase tracking-wider">Ações</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
											<td className="py-3 px-2">
												<div className="flex items-center space-x-3">
													<div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
														<img
															src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
															alt={user.name}
															className="h-full w-full object-cover"
														/>
													</div>
													<span className="font-medium">{user.name}</span>
												</div>
											</td>
											<td className="py-3 px-2 text-gray-600">{user.email}</td>
											<td className="py-3 px-2">
												<Badge
													className={
														user.role === RoleEnum.ADMIN
															? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
															: user.role === RoleEnum.USER
																? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
																: 'bg-green-100 text-green-800 hover:bg-green-200'
													}
												>
													{user.role === RoleEnum.ADMIN
														? 'Administrador'
														: user.role === RoleEnum.USER
															? 'Funcionário'
															: 'Recepcionista'}
												</Badge>
											</td>
											<td className="py-3 px-2 text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="sm"
														className="h-8 px-2"
														onClick={() => handleEditUser(user)}
													>
														<Edit className="h-4 w-4" />
														<span className="sr-only sm:not-sr-only sm:ml-2">Editar</span>
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="h-8 px-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
														onClick={() => {
															setIsDeleteDialogOpen(user)
														}}
														disabled={user.id === currentUser?.id}
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only sm:not-sr-only sm:ml-2">Excluir</span>
													</Button>
												</div>
											</td>
										</tr>
									))}
									{users.length === 0 && (
										<tr>
											<td colSpan={4} className="py-8 text-center text-gray-500">
												<User className="h-8 w-8 mx-auto text-gray-300 mb-2" />
												Nenhum usuário encontrado
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Dialog para editar permissões */}
				{selectedUser && (
					<Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
						<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<span>Editar Permissões</span>
									<Badge
										className={
											selectedUser.role === RoleEnum.ADMIN
												? 'bg-purple-100 text-purple-800 ml-2'
												: selectedUser.role === RoleEnum.USER
													? 'bg-blue-100 text-blue-800 ml-2'
													: 'bg-green-100 text-green-800 ml-2'
										}
									>
										{selectedUser.role === RoleEnum.ADMIN
											? 'Administrador'
											: selectedUser.role === RoleEnum.USER
												? 'Funcionário'
												: 'Recepcionista'}
									</Badge>
								</DialogTitle>
								<DialogDescription>
									<div className="flex items-center space-x-3 mt-2">
										<div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
											<img
												src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}`}
												alt={selectedUser.name}
												className="h-full w-full object-cover"
											/>
										</div>
										<div>
											<p className="font-medium">{selectedUser.name}</p>
											<p className="text-sm text-gray-500">{selectedUser.email}</p>
										</div>
									</div>
								</DialogDescription>
							</DialogHeader>

							<div className="py-4">
								<div className="mb-4">
									<Label htmlFor="role">Função</Label>
									<Select
										value={selectedUser.role}
										onValueChange={(value: string) =>
											setSelectedUser({ ...selectedUser, role: value as RoleEnum })
										}
									>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="Selecione uma função" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={RoleEnum.ADMIN}>Administrador</SelectItem>
											<SelectItem value={RoleEnum.MANAGER}>Recepcionista</SelectItem>
											<SelectItem value={RoleEnum.USER}>Funcionário</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="mt-6">
									<h3 className="font-medium text-lg mb-4">Permissões disponíveis</h3>
									<div className="mt-2 space-y-4">
										{allPermissions.map((permission) => (
											<div key={permission.id} className="flex items-start space-x-3 py-2">
												<Checkbox
													id={`perm-${permission.id}`}
													disabled={selectedUser.role === RoleEnum.ADMIN}
													checked={
														selectedUser.role === RoleEnum.ADMIN || selectedPermissions?.[permission.id] === true
													}
													onCheckedChange={() => handleToggle(permission.id as keyof UserPermissions)}
												/>
												<div className="space-y-1">
													<Label
														htmlFor={`perm-${permission.id}`}
														className="font-medium"
													>
														{permission.name}
													</Label>
													<p className="text-sm text-gray-500">{permission.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setSelectedUser(null)}
									className="font-medium"
								>
									Cancelar
								</Button>
								<Button
									onClick={() => handleSavePermissions()}
									disabled={isLoading}
									className="bg-[#1776D2] hover:bg-[#1776D2]/90 text-white font-medium"
								>
									{isLoading ? 'Salvando...' : 'Salvar Alterações'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}

				{/* Delete Service Dialog */}
				<Dialog open={!!isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirmar Exclusão</DialogTitle>
							<DialogDescription>
								Tem certeza que deseja excluir o serviço "{isDeleteDialogOpen?.name}"?
								Esta ação não pode ser desfeita.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteDialogOpen(null)}
								className="font-medium"
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								onClick={() => isDeleteDialogOpen?.id && handleDeleteUser(isDeleteDialogOpen.id)}
								className="font-medium"
							>
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

			</div>
		</AdminLayout>
	);
};

export default Permissions;