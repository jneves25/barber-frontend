
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, Scissors, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Dados de exemplo para metas
const goalsData = [
  { id: 1, name: 'Faturamento', current: 12450, target: 15000, unit: 'R$', percentage: 83 },
  { id: 2, name: 'Novos Clientes', current: 32, target: 50, unit: 'clientes', percentage: 64 },
  { id: 3, name: 'Serviços Realizados', current: 245, target: 300, unit: 'serviços', percentage: 82 },
  { id: 4, name: 'Ticket Médio', current: 62, target: 70, unit: 'R$', percentage: 89 }
];

// Dados de exemplo para metas de barbeiros (com mais detalhes)
const barberGoals = [
  { 
    id: 1, 
    barber: 'Carlos Silva', 
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    current: 3200, 
    target: 4000, 
    percentage: 80,
    services: 42,
    targetServices: 50,
    commission: 40,
    serviceBreakdown: {
      cortes: 28,
      barbas: 10,
      combos: 4
    }
  },
  { 
    id: 2, 
    barber: 'Ricardo Gomes', 
    photo: 'https://randomuser.me/api/portraits/men/44.jpg',
    current: 2800, 
    target: 3500, 
    percentage: 80,
    services: 38,
    targetServices: 45,
    commission: 40,
    serviceBreakdown: {
      cortes: 20,
      barbas: 15,
      combos: 3
    }
  },
  { 
    id: 3, 
    barber: 'André Santos', 
    photo: 'https://randomuser.me/api/portraits/men/22.jpg',
    current: 3500, 
    target: 4200, 
    percentage: 83,
    services: 46,
    targetServices: 55,
    commission: 45,
    serviceBreakdown: {
      cortes: 30,
      barbas: 8,
      combos: 8
    }
  },
  { 
    id: 4, 
    barber: 'Felipe Costa', 
    photo: 'https://randomuser.me/api/portraits/men/36.jpg',
    current: 2950, 
    target: 3300, 
    percentage: 89,
    services: 35,
    targetServices: 40,
    commission: 40,
    serviceBreakdown: {
      cortes: 22,
      barbas: 10,
      combos: 3
    }
  }
];

const AdminGoals = () => {
  const [period, setPeriod] = useState('month');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingBarberGoal, setIsEditingBarberGoal] = useState(false);
  const [editedBarber, setEditedBarber] = useState<number | null>(null);

  const handleSaveGoals = () => {
    // Simular salvamento de metas
    setIsEditingGoal(false);
    toast.success('Metas salvas com sucesso!');
  };

  const handleEditBarberGoal = (barberId: number) => {
    setEditedBarber(barberId);
    setIsEditingBarberGoal(true);
  };

  const handleSaveBarberGoal = () => {
    setIsEditingBarberGoal(false);
    setEditedBarber(null);
    toast.success('Meta do barbeiro atualizada!');
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold">Metas</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-md ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1 rounded-md ${period === 'quarter' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Trimestre
            </button>
            <button 
              onClick={() => setPeriod('year')}
              className={`px-3 py-1 rounded-md ${period === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
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
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle>Metas por Barbeiro</CardTitle>
              <CardDescription>
                {period === 'month' && 'Faturamento do mês atual'}
                {period === 'quarter' && 'Faturamento do trimestre atual'}
                {period === 'year' && 'Faturamento do ano atual'}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-0" 
              onClick={() => setIsEditingBarberGoal(!isEditingBarberGoal)}
            >
              <Edit className="h-4 w-4 mr-1" /> Editar Metas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {barberGoals.map(barber => (
                <div key={barber.id} className="space-y-3 p-3 rounded-lg border">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={barber.photo} 
                        alt={barber.barber} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium">{barber.barber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{barber.commission}% comissão</span>
                      <span>{barber.percentage}%</span>
                      {isEditingBarberGoal && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditBarberGoal(barber.id)}
                          className="h-7 px-2"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${barber.percentage >= 90 ? 'bg-green-500' : barber.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${barber.percentage}%` }}
                    ></div>
                  </div>
                  
                  {editedBarber === barber.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Meta de Faturamento</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">R$</span>
                          <input type="number" className="flex-1 rounded-r-md border border-gray-300 px-3 py-1 text-sm" defaultValue={barber.target} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Meta de Serviços</label>
                        <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm" defaultValue={barber.targetServices} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Porcentagem de Comissão</label>
                        <div className="flex">
                          <input type="number" className="flex-1 rounded-l-md border border-gray-300 px-3 py-1 text-sm" defaultValue={barber.commission} />
                          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">%</span>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleSaveBarberGoal}
                          className="mt-2"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="space-y-1">
                        <div>Faturamento: <span className="font-medium">R$ {barber.current}</span> / Meta: R$ {barber.target}</div>
                        <div>Serviços: <span className="font-medium">{barber.services}</span> / Meta: {barber.targetServices}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div>Cortes: {barber.serviceBreakdown.cortes}</div>
                        <div>Barbas: {barber.serviceBreakdown.barbas}</div>
                        <div>Combos: {barber.serviceBreakdown.combos}</div>
                      </div>
                    </div>
                  )}
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
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveGoals(); }}>
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
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Salvar Metas
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminGoals;
