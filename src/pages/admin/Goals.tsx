
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, Scissors } from 'lucide-react';

// Dados de exemplo para metas
const goalsData = [
  { id: 1, name: 'Faturamento', current: 12450, target: 15000, unit: 'R$', percentage: 83 },
  { id: 2, name: 'Novos Clientes', current: 32, target: 50, unit: 'clientes', percentage: 64 },
  { id: 3, name: 'Serviços Realizados', current: 245, target: 300, unit: 'serviços', percentage: 82 },
  { id: 4, name: 'Ticket Médio', current: 62, target: 70, unit: 'R$', percentage: 89 }
];

// Dados de exemplo para metas de barbeiros
const barberGoals = [
  { id: 1, barber: 'Carlos Silva', current: 3200, target: 4000, percentage: 80 },
  { id: 2, barber: 'Ricardo Gomes', current: 2800, target: 3500, percentage: 80 },
  { id: 3, barber: 'André Santos', current: 3500, target: 4200, percentage: 83 },
  { id: 4, barber: 'Felipe Costa', current: 2950, target: 3300, percentage: 89 }
];

const AdminGoals = () => {
  const [period, setPeriod] = useState('month');

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Metas</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-md ${period === 'month' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1 rounded-md ${period === 'quarter' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Trimestre
            </button>
            <button 
              onClick={() => setPeriod('year')}
              className={`px-3 py-1 rounded-md ${period === 'year' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Ano
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goalsData.map(goal => (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                {goal.name === 'Faturamento' && <TrendingUp className="h-4 w-4 text-gray-500" />}
                {goal.name === 'Novos Clientes' && <Users className="h-4 w-4 text-gray-500" />}
                {goal.name === 'Serviços Realizados' && <Scissors className="h-4 w-4 text-gray-500" />}
                {goal.name === 'Ticket Médio' && <Target className="h-4 w-4 text-gray-500" />}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {goal.unit === 'R$' ? `R$ ${goal.current}` : goal.current} 
                    <span className="text-sm font-normal text-gray-500"> / {goal.unit === 'R$' ? `R$ ${goal.target}` : goal.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${goal.percentage >= 90 ? 'bg-green-500' : goal.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${goal.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{goal.percentage}% da meta</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Metas por Barbeiro</CardTitle>
            <CardDescription>
              {period === 'month' && 'Faturamento do mês atual'}
              {period === 'quarter' && 'Faturamento do trimestre atual'}
              {period === 'year' && 'Faturamento do ano atual'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {barberGoals.map(barber => (
                <div key={barber.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{barber.barber}</span>
                    <span>{barber.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${barber.percentage >= 90 ? 'bg-green-500' : barber.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${barber.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>R$ {barber.current}</span>
                    <span>Meta: R$ {barber.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Definir Novas Metas</CardTitle>
            <CardDescription>Configure as metas para o próximo período</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta de Faturamento</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">R$</span>
                    <input type="number" className="flex-1 rounded-r-md border border-gray-300 px-3 py-2" defaultValue="15000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta de Novos Clientes</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta de Serviços</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="300" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta de Ticket Médio</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">R$</span>
                    <input type="number" className="flex-1 rounded-r-md border border-gray-300 px-3 py-2" defaultValue="70" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-barber-500 text-white px-4 py-2 rounded-md">
                  Salvar Metas
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminGoals;
