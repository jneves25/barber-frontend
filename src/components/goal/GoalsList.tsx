import React from 'react';
import { Goal } from '@/services/api/GoalService';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Target, Trophy, TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface GoalsListProps {
	goals: Goal[];
	currentProgress?: Record<number, number>;
	onEdit: (goal: Goal) => void;
	onDelete: (goal: Goal) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({
	goals,
	currentProgress = {},
	onEdit,
	onDelete,
}) => {
	const { hasPermission } = useAuth();
	const canManageGoals = hasPermission('manageGoals');

	// Function to determine the progress color based on percentage
	const getProgressColor = (percentage: number) => {
		if (percentage >= 100) return 'bg-green-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	// Function to determine text color based on percentage
	const getTextColor = (percentage: number) => {
		if (percentage >= 100) return 'text-green-600';
		if (percentage >= 70) return 'text-yellow-600';
		return 'text-red-600';
	};

	// Function to determine if a goal is for a future month
	const isFutureGoal = (month: number, year: number) => {
		const goalDate = new Date(year, month - 1); // Month is 0-indexed in Date
		const currentDate = new Date();
		currentDate.setDate(1); // First day of current month for accurate comparison

		return isAfter(goalDate, currentDate);
	};

	// Debug function to log goal IDs and progress data
	const debugInfo = (goal: Goal) => {
		if (!goal.id) return;
		console.log(`Goal ID: ${goal.id}, Type: ${typeof goal.id}`);
		console.log(`Progress value: ${currentProgress[goal.id]}`);
		console.log(`All Progress keys: ${Object.keys(currentProgress)}`);
	};

	return (
		<div className="space-y-6">
			{goals.length > 0 ? (
				goals.map((goal) => {
					if (goal.id) debugInfo(goal);

					// Ensure the goal.id is properly cast to number for lookup
					const goalId = goal.id ? Number(goal.id) : 0;
					// Check if this goalId exists as a string key in currentProgress
					const stringKey = goalId.toString();

					// Calculate progress percentage if available
					// Try both number and string keys to access the progress
					const currentValue = (currentProgress[goalId] !== undefined)
						? currentProgress[goalId]
						: (currentProgress[stringKey as any] !== undefined)
							? currentProgress[stringKey as any]
							: 0;

					// Handle the progress percentage calculation
					// If target is 0 and there's progress, show as 100% complete
					const progressPercentage = goal.target === 0 && currentValue > 0
						? 100 // If target is 0 but there's progress, consider it 100% complete
						: goal.target > 0
							? Math.min(100, (currentValue / goal.target) * 100)
							: 0;

					const isCompleted = progressPercentage >= 100;
					const isFuture = isFutureGoal(goal.month, goal.year);
					const progressTextColor = getTextColor(progressPercentage);

					return (
						<Card
							key={goal.id}
							className={`overflow-hidden shadow-sm hover:shadow-md transition-all ${isCompleted ? 'border-green-500' : 'border-gray-200'}`}
						>
							<CardContent className="p-0">
								{/* Cabeçalho com nome e mês */}
								<div className={`p-4 border-b ${isCompleted ? 'bg-green-50' : 'bg-gradient-to-r from-blue-50 to-white'}`}>
									<div className="flex justify-between items-center">
										<div>
											<p className="font-semibold text-lg flex items-center">
												{goal.user?.name || 'Profissional'}
												{isCompleted && <Trophy className="h-5 w-5 ml-2 text-yellow-500" />}
											</p>
											<div className="flex items-center text-sm text-gray-500 mt-1">
												<Calendar className="h-4 w-4 mr-1" />
												{format(new Date(goal.year, goal.month - 1), 'MMMM yyyy', { locale: ptBR })}
												{isFuture && (
													<Badge variant="outline" className="ml-2 text-xs">Meta Futura</Badge>
												)}
											</div>
										</div>
										{canManageGoals && (
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="icon"
													onClick={() => onEdit(goal)}
													className="h-8 w-8"
												>
													<Edit className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="outline"
													size="icon"
													onClick={() => onDelete(goal)}
													className="h-8 w-8"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										)}
									</div>
								</div>

								{/* Conteúdo da meta */}
								<div className="p-4">
									{/* Valores de meta e atual */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div className="bg-blue-50 p-3 rounded-lg">
											<div className="text-xs text-gray-500 mb-1 flex items-center">
												<Target className="h-3.5 w-3.5 mr-1 text-blue-600" />
												META DEFINIDA
											</div>
											<div className="text-xl font-bold text-blue-700">
												R$ {goal.target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
											</div>
										</div>

										{!isFuture && (
											<div className="bg-gray-50 p-3 rounded-lg">
												<div className="text-xs text-gray-500 mb-1 flex items-center">
													<TrendingUp className="h-3.5 w-3.5 mr-1 text-gray-600" />
													FATURADO ATÉ AGORA
												</div>
												<div className="text-xl font-bold text-gray-700">
													R$ {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
												</div>
											</div>
										)}
									</div>

									{/* Barra de progresso */}
									{!isFuture && (
										<div className="mt-3">
											<div className="flex justify-between text-sm mb-1">
												<span className="text-gray-600 font-medium">Progresso da Meta</span>
												<span className={`font-semibold ${progressTextColor}`}>
													{progressPercentage.toFixed(1)}%
												</span>
											</div>
											<div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
												<Progress
													value={progressPercentage}
													className={`h-full ${getProgressColor(progressPercentage)}`}
												/>
											</div>

											<div className="flex justify-between mt-2">
												<span className="text-xs text-gray-500">R$ 0</span>
												<span className="text-xs text-gray-500">
													Meta: R$ {goal.target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
												</span>
											</div>

											{/* Status da meta */}
											<div className="mt-3 text-center">
												{isCompleted ? (
													<Badge className="bg-green-100 text-green-800 py-1 px-3">
														<Trophy className="h-3.5 w-3.5 mr-1.5" /> Meta Alcançada!
													</Badge>
												) : (
													<div className="text-sm text-gray-600">
														{progressPercentage > 0 ? (
															<span>
																Faltam <span className="font-semibold text-blue-600">R$ {(goal.target - currentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> para atingir a meta
															</span>
														) : (
															<span className="text-gray-500 italic">Ainda não há progresso para esta meta</span>
														)}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})
			) : (
				<div className="text-center py-12 border rounded-lg bg-gray-50">
					<Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
					<h3 className="text-gray-600 text-lg font-medium">Nenhuma meta encontrada</h3>
					<p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
						Não há metas definidas para este período. Crie novas metas para acompanhar o desempenho.
					</p>
				</div>
			)}
		</div>
	);
};

export default GoalsList;
