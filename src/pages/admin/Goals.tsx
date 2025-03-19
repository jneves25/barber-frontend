
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, DollarSign, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';

// Dados de metas de exemplo
const goalsData = [
  { 
    id: 1, 
    barber: 'Carlos Silva', 
    month: 'Outubro', 
    year: '2023', 
    target: 15000, 
    current: 12500, 
    percentage: 83, 
    status: 'em_andamento' 
  },
  { 
    id: 2, 
    barber: 'Ricardo Gomes', 
    month: 'Outubro', 
    year: '2023', 
    target: 14000, 
    current: 13200, 
    percentage: 94, 
    status: 'em_andamento' 
  },
  { 
    id: 3, 
    barber: 'Carlos Silva', 
    month: 'Setembro', 
    year: '2023', 
    target: 14000, 
    current: 14350, 
    percentage: 102, 
    status: 'concluido' 
  },
  { 
    id: 4, 
    barber: 'Ricardo Gomes', 
    month: 'Setembro', 
    year: '2023', 
    target: 13000, 
    current: 12100, 
    percentage: 93, 
    status: 'concluido' 
  },
  { 
    id: 5, 
    barber: 'Carlos Silva', 
    month: 'Novembro', 
    year: '2023', 
    target: 16000, 
    current: 4500, 
    percentage: 28, 
    status: 'em_andamento' 
  },
  { 
    id: 6, 
    barber: 'Ricardo Gomes', 
    month: 'Novembro', 
    year: '2023', 
    target: 15000, 
    current: 3800, 
    percentage: 25, 
    status: 'em_andamento' 
  }
];

// Dados das metas de atendimentos
const serviceGoals = [
  { 
    id: 1, 
    barber: 'Carlos Silva', 
    service: 'Corte de Cabelo', 
    month: 'Outubro', 
    year: '2023', 
    target: 120, 
    current: 98, 
    percentage: 82, 
    status: 'em_andamento' 
  },
  { 
    id: 2, 
    barber: 'Carlos Silva', 
    service: 'Barba', 
    month: 'Outubro', 
    year: '2023', 
    target: 80, 
    current: 72, 
    percentage: 90, 
    status: 'em_andamento' 
  },
  { 
    id: 3, 
    barber: 'Ricardo Gomes', 
    service: 'Corte de Cabelo', 
    month: 'Outubro', 
    year: '2023', 
    target: 110, 
    current: 95, 
    percentage: 86, 
    status: 'em_andamento' 
  },
  { 
    id: 4, 
    barber: 'Ricardo Gomes', 
    service: 'Barba', 
    month: 'Outubro', 
    year: '2023', 
    target: 90, 
    current: 78, 
    percentage: 87, 
    status: 'em_andamento' 
  }
];

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2)}`;
};

const AdminGoals = () => {
  const [period, setPeriod] = useState<'current' | 'past' | 'future'>('current');
  const { user } = useAuth();

  // Filtrar metas para o barbeiro atual se for um barbeiro
  const filteredGoals = user?.role === 'barber' 
    ? goalsData.filter(goal => goal.barber === user.name) 
    : goalsData;

  // Filtrar metas de serviços para o barbeiro atual se for um barbeiro
  const filteredServiceGoals = user?.role === 'barber' 
    ? serviceGoals.filter(goal => goal.barber === user.name) 
    : serviceGoals;

  // Filtrar por período selecionado
  const filterByPeriod = (data: typeof goalsData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();
    
    return data.filter(goal => {
      if (period === 'current') {
        return goal.month.toLowerCase() === currentMonth.toLowerCase() && goal.year === currentYear;
      } else if (period === 'past') {
        if (goal.year < currentYear) return true;
        return goal.year === currentYear && goal.month.toLowerCase() !== currentMonth.toLowerCase() && goal.status === 'concluido';
      } else { // future
        if (goal.year > currentYear) return true;
        return goal.year === currentYear && goal.month.toLowerCase() !== currentMonth.toLowerCase() && goal.status === 'em_andamento';
      }
    });
  };

  const periodFilteredGoals = filterByPeriod(filteredGoals);
  const periodFilteredServiceGoals = filterByPeriod(filteredServiceGoals);

  // Calcular estatísticas para o período atual
  const getStats = () => {
    const currentPeriodGoals = filterByPeriod(filteredGoals).filter(g => g.status === 'em_andamento');
    
    if (currentPeriodGoals.length === 0) {
      return { averageProgress: 0, totalTarget: 0, totalCurrent: 0 };
    }
    
    const totalTarget = currentPeriodGoals.reduce((sum, goal) => sum + goal.target, 0);
    const totalCurrent = currentPeriodGoals.reduce((sum, goal) => sum + goal.current, 0);
    const averageProgress = Math.round((totalCurrent / totalTarget) * 100);
    
    return { averageProgress, totalTarget, totalCurrent };
  };

  const stats = getStats();

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {user?.role === 'barber' ? 'Minhas Metas' : 'Metas'}
          </h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPeriod('past')}
              className={`px-3 py-1 rounded-md ${period === 'past' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Anteriores
            </button>
            <button 
              onClick={() => setPeriod('current')}
              className={`px-3 py-1 rounded-md ${period === 'current' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Atuais
            </button>
            <button 
              onClick={() => setPeriod('future')}
              className={`px-3 py-1 rounded-md ${period === 'future' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Futuras
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <Target className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <Progress value={stats.averageProgress} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.totalCurrent)} de {formatCurrency(stats.totalTarget)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'barber' ? 'Minhas Metas Ativas' : 'Metas Ativas'}
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filterByPeriod(filteredGoals).filter(g => g.status === 'em_andamento').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Metas em andamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'barber' ? 'Minha Meta Mensal' : 'Meta Mensal'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalTarget)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Meta de faturamento para o período
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === 'barber' ? 'Minhas Metas Financeiras' : 'Metas Financeiras'}
            </CardTitle>
            <CardDescription>
              {period === 'current' && 'Metas financeiras do período atual'}
              {period === 'past' && 'Metas financeiras de períodos anteriores'}
              {period === 'future' && 'Metas financeiras para períodos futuros'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {periodFilteredGoals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {user?.role !== 'barber' && <TableHead>Barbeiro</TableHead>}
                      <TableHead>Período</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>Atual</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodFilteredGoals.map(goal => (
                      <TableRow key={goal.id} className="hover:bg-gray-50">
                        {user?.role !== 'barber' && <TableCell>{goal.barber}</TableCell>}
                        <TableCell>{goal.month}/{goal.year}</TableCell>
                        <TableCell>{formatCurrency(goal.target)}</TableCell>
                        <TableCell>{formatCurrency(goal.current)}</TableCell>
                        <TableCell className="w-1/4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={goal.percentage > 100 ? 100 : goal.percentage} 
                              className="h-2" 
                            />
                            <span className="text-sm">{goal.percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {goal.status === 'concluido' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Concluído
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Em andamento
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-gray-500 text-lg font-medium">Nenhuma meta encontrada</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Não há metas definidas para este período.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === 'barber' ? 'Minhas Metas por Serviço' : 'Metas por Serviço'}
            </CardTitle>
            <CardDescription>
              Metas específicas por tipo de serviço para o período atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {periodFilteredServiceGoals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {user?.role !== 'barber' && <TableHead>Barbeiro</TableHead>}
                      <TableHead>Serviço</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>Atual</TableHead>
                      <TableHead>Progresso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodFilteredServiceGoals.map(goal => (
                      <TableRow key={goal.id} className="hover:bg-gray-50">
                        {user?.role !== 'barber' && <TableCell>{goal.barber}</TableCell>}
                        <TableCell>{goal.service}</TableCell>
                        <TableCell>{goal.month}/{goal.year}</TableCell>
                        <TableCell>{goal.target} atendimentos</TableCell>
                        <TableCell>{goal.current} atendimentos</TableCell>
                        <TableCell className="w-1/4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={goal.percentage > 100 ? 100 : goal.percentage} 
                              className="h-2" 
                            />
                            <span className="text-sm">{goal.percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-gray-500 text-lg font-medium">Nenhuma meta de serviço encontrada</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Não há metas por serviço definidas para este período.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminGoals;
