
import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as BarChartIcon, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dados de exemplo para o gráfico de faturamento
const revenueData = [
  { name: 'Jan', total: 8500 },
  { name: 'Fev', total: 9200 },
  { name: 'Mar', total: 8700 },
  { name: 'Abr', total: 9800 },
  { name: 'Mai', total: 10200 },
  { name: 'Jun', total: 11500 },
  { name: 'Jul', total: 12000 },
  { name: 'Ago', total: 12500 },
  { name: 'Set', total: 13200 },
  { name: 'Out', total: 12450 },
  { name: 'Nov', total: 0 },
  { name: 'Dez', total: 0 },
];

// Dados de faturamento por serviço
const serviceRevenueData = [
  { id: 1, service: 'Corte de Cabelo', quantity: 145, revenue: 7250, percentage: 35 },
  { id: 2, service: 'Barba', quantity: 98, revenue: 3430, percentage: 16 },
  { id: 3, service: 'Combo Completo', quantity: 78, revenue: 6240, percentage: 30 },
  { id: 4, service: 'Corte Degradê', quantity: 56, revenue: 3360, percentage: 16 },
  { id: 5, service: 'Sobrancelha', quantity: 35, revenue: 700, percentage: 3 }
];

const AdminRevenue = () => {
  const [period, setPeriod] = useState('year');

  // Calcula o faturamento total
  const totalRevenue = serviceRevenueData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Faturamento</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 20.980,00</div>
              <p className="text-xs text-muted-foreground">
                +15% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15%</div>
              <p className="text-xs text-muted-foreground">
                Aumento em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 62,00</div>
              <p className="text-xs text-muted-foreground">
                +8% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Análise de Faturamento</CardTitle>
              <CardDescription>
                {period === 'month' && 'Faturamento do mês atual'}
                {period === 'quarter' && 'Faturamento do trimestre atual'}
                {period === 'year' && 'Faturamento do ano atual (2023)'}
              </CardDescription>
            </div>
            <BarChartIcon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                  <Legend />
                  <Bar dataKey="total" name="Faturamento (R$)" fill="#8B4513" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Serviço</CardTitle>
            <CardDescription>Análise de receita por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Serviço</th>
                    <th className="p-3 border-b">Quantidade</th>
                    <th className="p-3 border-b">Faturamento</th>
                    <th className="p-3 border-b">% do Total</th>
                    <th className="p-3 border-b">Distribuição</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRevenueData.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{item.service}</td>
                      <td className="p-3 border-b">{item.quantity}</td>
                      <td className="p-3 border-b">R$ {item.revenue.toFixed(2)}</td>
                      <td className="p-3 border-b">{item.percentage}%</td>
                      <td className="p-3 border-b w-1/4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-barber-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-3 border-b">Total</td>
                    <td className="p-3 border-b">412</td>
                    <td className="p-3 border-b">R$ {totalRevenue.toFixed(2)}</td>
                    <td className="p-3 border-b">100%</td>
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

export default AdminRevenue;
