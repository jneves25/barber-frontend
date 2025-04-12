import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Edit, Percent, Plus, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import goalService, { Goal } from '@/services/api/GoalService';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

// Metas de exemplo
const MOCK_GOALS = [
	{ id: 1, barber: 'Carlos Silva', month: '03', year: '2023', target: 3000, current: 2750, percentage: 91.6, status: 'Em andamento' },
	{ id: 2, barber: 'Ricardo Gomes', month: '03', year: '2023', target: 3500, current: 3200, percentage: 91.4, status: 'Em andamento' },
	{ id: 3, barber: 'André Santos', month: '03', year: '2023', target: 4000, current: 4100, percentage: 102.5, status: 'Concluída' },
	{ id: 4, barber: 'Felipe Costa', month: '03', year: '2023', target: 3200, current: 1800, percentage: 56.2, status: 'Em andamento' },
	{ id: 5, barber: 'Carlos Silva', month: '02', year: '2023', target: 3000, current: 3100, percentage: 103.3, status: 'Concluída' },
	{ id: 6, barber: 'Ricardo Gomes', month: '02', year: '2023', target: 3500, current: 3050, percentage: 87.1, status: 'Concluída' },
];

// Metas por serviço (para demonstração)
const MOCK_SERVICE_GOALS = [
	{ id: 101, barber: 'Carlos Silva', month: '03', year: '2023', serviceName: 'Corte de Cabelo', target: 80, current: 65, percentage: 81.25 },
	{ id: 102, barber: 'Carlos Silva', month: '03', year: '2023', serviceName: 'Barba', target: 50, current: 48, percentage: 96 },
	{ id: 103, barber: 'Ricardo Gomes', month: '03', year: '2023', serviceName: 'Corte de Cabelo', target: 70, current: 72, percentage: 102.85 },
	{ id: 104, barber: 'Ricardo Gomes', month: '03', year: '2023', serviceName: 'Barba', target: 60, current: 42, percentage: 70 },
];

const AdminGoals = () => {
	const { user, companySelected } = useAuth();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedTab, setSelectedTab] = useState<'financeiras' | 'servicos'>('financeiras');
	const [goals, setGoals] = useState<Goal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

	const currentMonth = format(currentDate, 'MM');
	const currentYear = format(currentDate, 'yyyy');

	// Função para navegar entre os meses
	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
	};

	// Filtrar metas pelo barbeiro atual (se for um barbeiro) e pelo mês/ano selecionado
	const filteredGoals = MOCK_GOALS.filter(goal => {
		const monthMatch = goal.month === currentMonth && goal.year === currentYear;
		if (user?.role === 'barber') {
			return monthMatch && goal.barber === user.name;
		}
		return monthMatch;
	});

	// Filtrar metas de serviço pelo barbeiro atual (se for um barbeiro) e pelo mês/ano selecionado
	const filteredServiceGoals = MOCK_SERVICE_GOALS.filter(goal => {
		const monthMatch = goal.month === currentMonth && goal.year === currentYear;
		if (user?.role === 'barber') {
			return monthMatch && goal.barber === user.name;
		}
		return monthMatch;
	});

	// Função para determinar a cor do progresso baseado na porcentagem
	const getProgressColor = (percentage: number) => {
		if (percentage >= 100) return 'bg-green-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	useEffect(() => {
		loadGoals();
	}, [companySelected?.id]);

	const loadGoals = async () => {
		if (!companySelected?.id) return;

		try {
			const response = await goalService.getAllByCompany(companySelected.id);
			if (response.success && response.data) {
				setGoals(response.data);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível carregar as metas.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateGoal = async (data: Partial<Goal>) => {
		if (!companySelected?.id) return;

		try {
			const response = await goalService.create({
				...data,
				companyId: companySelected.id,
				userId: 0, // será preenchido pelo backend
			} as Goal);

			if (response.success && response.data) {
				setGoals([...goals, response.data]);
				setIsFormOpen(false);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível criar a meta.",
				variant: "destructive",
			});
		}
	};

	const handleUpdateGoal = async (data: Partial<Goal>) => {
		if (!selectedGoal?.id) return;

		try {
			const response = await goalService.update(selectedGoal.id, data);
			if (response.success && response.data) {
				setGoals(goals.map(goal =>
					goal.id === selectedGoal.id ? response.data : goal
				));
				setIsFormOpen(false);
				setSelectedGoal(null);
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível atualizar a meta.",
				variant: "destructive",
			});
		}
	};

	const handleDeleteGoal = async () => {
		if (!selectedGoal?.id) return;

		try {
			const response = await goalService.delete(selectedGoal.id);
			if (response.success) {
				setGoals(goals.filter(goal => goal.id !== selectedGoal.id));
				toast({
					title: "Sucesso",
					description: "Meta excluída com sucesso!",
				});
			}
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível excluir a meta.",
				variant: "destructive",
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setSelectedGoal(null);
		}
	};

	if (isLoading) {
		return <div>Carregando...</div>;
	}

	return (
		<AdminLayout>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">
						{user?.role === 'barber' ? 'Minhas Metas' : 'Metas'}
					</h1>
					{user?.role !== 'barber' && (
						<Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsFormOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Nova Meta
						</Button>
					)}
				</div>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle>
							{user?.role === 'barber' ? 'Suas Metas do Mês' : 'Metas do Mês'}
						</CardTitle>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => navigateMonth('prev')}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="min-w-[120px] text-center">
								{format(currentDate, 'MMMM yyyy', { locale: ptBR })}
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() => navigateMonth('next')}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex border-b mb-4">
							<button
								className={`px-4 py-2 text-sm font-medium ${selectedTab === 'financeiras'
									? 'text-blue-600 border-b-2 border-blue-600'
									: 'text-gray-500 hover:text-gray-700'
									}`}
								onClick={() => setSelectedTab('financeiras')}
							>
								Metas Financeiras
							</button>
							<button
								className={`px-4 py-2 text-sm font-medium ${selectedTab === 'servicos'
									? 'text-blue-600 border-b-2 border-blue-600'
									: 'text-gray-500 hover:text-gray-700'
									}`}
								onClick={() => setSelectedTab('servicos')}
							>
								Metas por Serviço
							</button>
						</div>

						{selectedTab === 'financeiras' ? (
							// Metas Financeiras
							filteredGoals.length > 0 ? (
								<GoalsList
									goals={goals}
									onEdit={(goal) => {
										setSelectedGoal(goal);
										setIsFormOpen(true);
									}}
									onDelete={(goal) => {
										setSelectedGoal(goal);
										setIsDeleteDialogOpen(true);
									}}
								/>
							) : (
								<div className="text-center py-12 border rounded-lg">
									<Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
									<h3 className="text-gray-500 text-lg font-medium">Nenhuma meta encontrada</h3>
									<p className="text-gray-400 text-sm mt-1">
										Não há metas financeiras definidas para este período.
									</p>
								</div>
							)
						) : (
							// Metas por Serviço
							filteredServiceGoals.length > 0 ? (
								<GoalsList
									goals={goals}
									onEdit={(goal) => {
										setSelectedGoal(goal);
										setIsFormOpen(true);
									}}
									onDelete={(goal) => {
										setSelectedGoal(goal);
										setIsDeleteDialogOpen(true);
									}}
								/>
							) : (
								<div className="text-center py-12 border rounded-lg">
									<Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
									<h3 className="text-gray-500 text-lg font-medium">Nenhuma meta de serviço encontrada</h3>
									<p className="text-gray-400 text-sm mt-1">
										Não há metas por serviço definidas para este período.
									</p>
								</div>
							)
						)}
					</CardContent>
				</Card>
			</div>

			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedGoal ? "Editar Meta" : "Nova Meta"}
						</DialogTitle>
					</DialogHeader>
					<GoalForm
						initialData={selectedGoal || undefined}
						onSubmit={selectedGoal ? handleUpdateGoal : handleCreateGoal}
						onCancel={() => {
							setIsFormOpen(false);
							setSelectedGoal(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setSelectedGoal(null)}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteGoal}>
							Confirmar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</AdminLayout>
	);
};

export default AdminGoals;
