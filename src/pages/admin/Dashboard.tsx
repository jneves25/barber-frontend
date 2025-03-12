
import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Scissors, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Componente de estatística
const StatCard = ({ title, value, description, icon, trend = null, trendValue = null }) => {
  const Icon = icon;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : '';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trend && (
            <>
              <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
              <span className={`text-xs ${trendColor}`}>{trendValue}</span>
            </>
          )}
          {description && (
            <span className="text-xs text-muted-foreground ml-auto">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="grid gap-4 md:gap-6 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div>
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este mês</option>
              <option>Este ano</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Faturamento"
          value="R$ 5.984,00"
          description="Esse mês"
          icon={DollarSign}
          trend="up"
          trendValue="12.5%"
        />
        <StatCard
          title="Novos Clientes"
          value="48"
          description="Esse mês"
          icon={Users}
          trend="up"
          trendValue="8.2%"
        />
        <StatCard
          title="Agendamentos"
          value="187"
          description="Esse mês"
          icon={Calendar}
          trend="down"
          trendValue="3.1%"
        />
        <StatCard
          title="Serviços realizados"
          value="165"
          description="Esse mês"
          icon={Scissors}
          trend="up"
          trendValue="5.4%"
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
              <BarChart3 className="h-10 w-10 text-gray-400" />
              <p className="text-gray-500 ml-2">Gráfico de faturamento</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Serviços mais procurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
              <TrendingUp className="h-10 w-10 text-gray-400" />
              <p className="text-gray-500 ml-2">Gráfico de serviços</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Metas e Barbeiros */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comissões por barbeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Carlos Silva', value: 'R$ 1.675,00', percentage: 75 },
                { name: 'Ricardo Gomes', value: 'R$ 1.234,00', percentage: 65 },
                { name: 'André Santos', value: 'R$ 1.890,00', percentage: 85 },
                { name: 'Felipe Costa', value: 'R$ 1.185,00', percentage: 55 }
              ].map((barber) => (
                <div key={barber.name} className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium">{barber.name}</span>
                    <span className="ml-auto">{barber.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-barber-500 h-2.5 rounded-full" 
                      style={{ width: `${barber.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Metas do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Faturamento', goal: 'R$ 8.000,00', current: 'R$ 5.984,00', percentage: 74 },
                { name: 'Clientes', goal: '80', current: '48', percentage: 60 },
                { name: 'Agendamentos', goal: '250', current: '187', percentage: 75 }
              ].map((goal) => (
                <div key={goal.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-gray-500">{goal.current} / {goal.goal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-barber-400 h-2.5 rounded-full" 
                      style={{ width: `${goal.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Próximos agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Cliente</th>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Serviço</th>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Barbeiro</th>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Data</th>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Horário</th>
                  <th className="py-3 px-4 text-left border-b font-medium text-gray-500">Valor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    client: 'João Silva', 
                    service: 'Corte de Cabelo', 
                    barber: 'Carlos Silva', 
                    date: '12/06/2023', 
                    time: '10:00', 
                    price: 'R$ 50,00' 
                  },
                  { 
                    client: 'Pedro Santos', 
                    service: 'Barba', 
                    barber: 'Ricardo Gomes', 
                    date: '12/06/2023', 
                    time: '11:00', 
                    price: 'R$ 35,00' 
                  },
                  { 
                    client: 'Lucas Mendes', 
                    service: 'Combo Completo', 
                    barber: 'André Santos', 
                    date: '12/06/2023', 
                    time: '14:00', 
                    price: 'R$ 80,00' 
                  },
                  { 
                    client: 'Gabriel Costa', 
                    service: 'Corte Degradê', 
                    barber: 'Felipe Costa', 
                    date: '12/06/2023', 
                    time: '15:30', 
                    price: 'R$ 60,00' 
                  },
                  { 
                    client: 'Thiago Oliveira', 
                    service: 'Barba', 
                    barber: 'Carlos Silva', 
                    date: '12/06/2023', 
                    time: '16:00', 
                    price: 'R$ 35,00' 
                  }
                ].map((appointment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.client}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.service}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.barber}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.date}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.time}</td>
                    <td className="py-3 px-4 border-b border-gray-200">{appointment.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
