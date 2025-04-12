
import React from 'react';
import { Goal } from '@/services/api/GoalService';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Target, Trophy } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

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
  // Function to determine the progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Function to determine if a goal is for a future month
  const isFutureGoal = (month: number, year: number) => {
    const goalDate = new Date(year, month - 1); // Month is 0-indexed in Date
    const currentDate = new Date();
    currentDate.setDate(1); // First day of current month for accurate comparison
    
    return isAfter(goalDate, currentDate);
  };

  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal) => {
          // Calculate progress percentage if available
          const currentValue = currentProgress[goal.id || 0] || 0;
          const progressPercentage = goal.target > 0 
            ? Math.min(100, (currentValue / goal.target) * 100) 
            : 0;
          
          const isCompleted = progressPercentage >= 100;
          const isFuture = isFutureGoal(goal.month, goal.year);

          return (
            <div 
              key={goal.id} 
              className={`p-4 border rounded-lg ${isCompleted ? 'border-green-500 bg-green-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg flex items-center">
                    {goal.user?.name || 'Profissional'}
                    {isCompleted && <Trophy className="h-5 w-5 ml-2 text-yellow-500" />}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(goal.year, goal.month - 1), 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(goal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(goal)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-1 text-blue-500" />
                  <span className="font-semibold">R$ {goal.target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {!isFuture && (
                  <div className="text-sm">
                    <span className="text-gray-500">Atual: </span>
                    <span className="font-medium">R$ {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {!isFuture && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progresso</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={getProgressColor(progressPercentage)}
                  />
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-gray-500 text-lg font-medium">Nenhuma meta encontrada</h3>
          <p className="text-gray-400 text-sm mt-1">
            Não há metas definidas para este período.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalsList;
