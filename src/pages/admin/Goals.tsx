
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import GoalForm from '@/components/goal/GoalForm';
import GoalsList from '@/components/goal/GoalsList';

const AdminGoals = () => {
	const { user, companySelected } = useAuth();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedTab, setSelectedTab] = useState<'financeiras' | 'servicos'>('financeiras');
	const [goals, setGoals] = useState<Goal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
	const [currentProgress, setCurrentProgress] = useState<Record<number, number>>({});

	const currentMonth = parseInt(format(currentDate, 'MM'));
	const currentYear = parseInt(format(currentDate, 'yyyy'));

	// Função para navegar entre os meses
	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
	};

	// Filter goals by current month and year
	const filteredGoals = goals.filter(goal => {
		const monthMatch = goal.month === currentMonth && goal.year === currentYear;
		if (user?.role === 'barber') {
			return monthMatch && goal.userId === user.id;
		}
		return monthMatch;
	});

	// Function to determine the color of the progress based on percentage
	const getProgressColor = (percentage: number) => {
		if (percentage >= 100) return 'bg-green-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	useEffect(() => {
		loadGoals();
	}, [companySelected?.id, currentMonth, currentYear]);

	const loadGoals = async () => {
		if (!companySelected?.id) return;

		setIsLoading(true);
		try {
			let response;
			if (user?.role === 'barber') {
				response = await goalService.getUserGoals();
			} else {
				response = await goalService.getAllByCompany(companySelected.id);
			}
			
			if (response.success && response.data) {
				setGoals(response.data);
				
				// Here you would normally fetch the current progress for each goal
				// For now, let's set some random progress values for demonstration
				const progressData: Record<number, number> = {};
				response.data.forEach(goal => {
					if (goal.id) {
						// Some random progress between 0 and 120% of target
						const randomProgress = Math.random() * 1.2 * goal.target;
						progressData[goal.id] = randomProgress;
					}
				});
				setCurrentProgress(progressData);
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
				userId: data.userId || 0,
			} as Goal);

			if (response.success && response.data) {
				setGoals([...goals, response.data]);
				setIsFormOpen(false);
				toast({
					title: "Sucesso",
					description: "Meta criada com sucesso!",
				});
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
				toast({
					title: "Sucesso",
					description: "Meta atualizada com sucesso!",
				});
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

	if (isLoading && goals.length === 0) {
		return (
			<AdminLayout>
				<div className="flex justify-center items-center h-64">
					<div className="animate-pulse text-center">
						<Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500">Carregando metas...</p>
					</div>
				</div>
			</AdminLayout>
		);
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
							<GoalsList
								goals={filteredGoals}
								currentProgress={currentProgress}
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
								<h3 className="text-gray-500 text-lg font-medium">Metas por serviço</h3>
								<p className="text-gray-400 text-sm mt-1">
									Funcionalidade em desenvolvimento
								</p>
							</div>
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
