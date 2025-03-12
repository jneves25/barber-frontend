
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Scissors, BarChart } from 'lucide-react';

// Dados de exemplo para comissões dos barbeiros
const initialCommissions = [
  { id: 1, barber: 'Carlos Silva', services: 42, revenue: 2100, commission: 840, percentage: 40 },
  { id: 2, barber: 'Ricardo Gomes', services: 38, revenue: 1900, commission: 760, percentage: 40 },
  { id: 3, barber: 'André Santos', services: 45, revenue: 2250, commission: 900, percentage: 40 },
  { id: 4, barber: 'Felipe Costa', services: 36, revenue: 1800, commission: 720, percentage: 40 }
];

const AdminCommissions = () => {
  const [dateFilter, setDateFilter] = useState('month');
  const [commissions, setCommissions] = useState(initialCommissions);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Comissões</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1 rounded-md ${dateFilter === 'week' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-md ${dateFilter === 'month' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setDateFilter('year')}
              className={`px-3 py-1 rounded-md ${dateFilter === 'year' ? 'bg-barber-500 text-white' : 'bg-gray-100'}`}
            >
              Ano
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.050,00</div>
              <p className="text-xs text-muted-foreground">
                +12% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 3.220,00</div>
              <p className="text-xs text-muted-foreground">
                40% do faturamento total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">161</div>
              <p className="text-xs text-muted-foreground">
                +8% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">% Média Comissão</CardTitle>
              <BarChart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40%</div>
              <p className="text-xs text-muted-foreground">
                Mesmo percentual para todos
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comissões por Barbeiro</CardTitle>
            <CardDescription>
              {dateFilter === 'week' && 'Dados da semana atual'}
              {dateFilter === 'month' && 'Dados do mês atual'}
              {dateFilter === 'year' && 'Dados do ano atual'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Barbeiro</th>
                    <th className="p-3 border-b">Serviços</th>
                    <th className="p-3 border-b">Faturamento</th>
                    <th className="p-3 border-b">Comissão</th>
                    <th className="p-3 border-b">%</th>
                    <th className="p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{commission.barber}</td>
                      <td className="p-3 border-b">{commission.services}</td>
                      <td className="p-3 border-b">R$ {commission.revenue.toFixed(2)}</td>
                      <td className="p-3 border-b">R$ {commission.commission.toFixed(2)}</td>
                      <td className="p-3 border-b">{commission.percentage}%</td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700">Detalhes</button>
                          <button className="text-green-500 hover:text-green-700">Pagar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-3 border-b">Total</td>
                    <td className="p-3 border-b">161</td>
                    <td className="p-3 border-b">R$ 8.050,00</td>
                    <td className="p-3 border-b">R$ 3.220,00</td>
                    <td className="p-3 border-b">40%</td>
                    <td className="p-3 border-b"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCommissions;
