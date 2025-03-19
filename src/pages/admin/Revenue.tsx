import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart as BarChartIcon, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText, 
  FileSpreadsheet,
  Download,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Dados de faturamento individuais para cada barbeiro
const barberIndividualData = {
  'Carlos Silva': [
    { name: 'Jan', total: 1200 },
    { name: 'Fev', total: 1350 },
    { name: 'Mar', total: 1280 },
    { name: 'Abr', total: 1450 },
    { name: 'Mai', total: 1520 },
    { name: 'Jun', total: 1580 },
    { name: 'Jul', total: 1620 },
    { name: 'Ago', total: 1680 },
    { name: 'Set', total: 1750 },
    { name: 'Out', total: 1600 },
    { name: 'Nov', total: 0 },
    { name: 'Dez', total: 0 },
  ],
  'Ricardo Gomes': [
    { name: 'Jan', total: 980 },
    { name: 'Fev', total: 1100 },
    { name: 'Mar', total: 950 },
    { name: 'Abr', total: 1200 },
    { name: 'Mai', total: 1250 },
    { name: 'Jun', total: 1350 },
    { name: 'Jul', total: 1400 },
    { name: 'Ago', total: 1450 },
    { name: 'Set', total: 1500 },
    { name: 'Out', total: 1450 },
    { name: 'Nov', total: 0 },
    { name: 'Dez', total: 0 },
  ]
};

// Dados de faturamento por serviço para cada barbeiro
const barberServiceData = {
  'Carlos Silva': [
    { id: 1, service: 'Corte de Cabelo', quantity: 45, revenue: 2250, percentage: 40 },
    { id: 2, service: 'Barba', quantity: 30, revenue: 1050, percentage: 19 },
    { id: 3, service: 'Combo Completo', quantity: 20, revenue: 1600, percentage: 29 },
    { id: 4, service: 'Corte Degradê', quantity: 12, revenue: 720, percentage: 12 },
  ],
  'Ricardo Gomes': [
    { id: 1, service: 'Corte de Cabelo', quantity: 42, revenue: 2100, percentage: 38 },
    { id: 2, service: 'Barba', quantity: 28, revenue: 980, percentage: 18 },
    { id: 3, service: 'Combo Completo', quantity: 25, revenue: 2000, percentage: 36 },
    { id: 4, service: 'Corte Degradê', quantity: 8, revenue: 480, percentage: 8 },
  ]
};

// Dados de faturamento por serviço
const serviceRevenueData = [
  { id: 1, service: 'Corte de Cabelo', quantity: 145, revenue: 7250, percentage: 35 },
  { id: 2, service: 'Barba', quantity: 98, revenue: 3430, percentage: 16 },
  { id: 3, service: 'Combo Completo', quantity: 78, revenue: 6240, percentage: 30 },
  { id: 4, service: 'Corte Degradê', quantity: 56, revenue: 3360, percentage: 16 },
  { id: 5, service: 'Sobrancelha', quantity: 35, revenue: 700, percentage: 3 }
];

// Dados de faturamento por barbeiro
const barberRevenueData = [
  { id: 1, name: 'Carlos Silva', revenue: 5280, percentage: 25, color: '#8B4513' },
  { id: 2, name: 'Ricardo Gomes', revenue: 4830, percentage: 23, color: '#A0522D' },
  { id: 3, name: 'André Santos', revenue: 6350, percentage: 30, color: '#CD853F' },
  { id: 4, name: 'Felipe Costa', revenue: 4520, percentage: 22, color: '#DEB887' }
];

// Dados de faturamento mensal por barbeiro
const barberMonthlyData = [
  { name: 'Jan', Carlos: 1200, Ricardo: 980, André: 1450, Felipe: 950 },
  { name: 'Fev', Carlos: 1350, Ricardo: 1100, André: 1520, Felipe: 1030 },
  { name: 'Mar', Carlos: 1280, Ricardo: 950, André: 1380, Felipe: 980 },
  { name: 'Abr', Carlos: 1450, Ricardo: 1200, André: 1600, Felipe: 1150 },
  { name: 'Mai', Carlos: 1520, Ricardo: 1250, André: 1650, Felipe: 1180 },
  { name: 'Jun', Carlos: 1580, Ricardo: 1350, André: 1700, Felipe: 1270 },
  { name: 'Jul', Carlos: 1620, Ricardo: 1400, André: 1750, Felipe: 1330 },
  { name: 'Ago', Carlos: 1680, Ricardo: 1450, André: 1800, Felipe: 1370 },
  { name: 'Set', Carlos: 1750, Ricardo: 1500, André: 1850, Felipe: 1400 },
  { name: 'Out', Carlos: 1600, Ricardo: 1450, André: 1820, Felipe: 1380 },
];

// Dados de faturamento por dia da semana
const weekdayRevenueData = [
  { name: 'Segunda', total: 1200 },
  { name: 'Terça', total: 1450 },
  { name: 'Quarta', total: 1680 },
  { name: 'Quinta', total: 1950 },
  { name: 'Sexta', total: 2350 },
  { name: 'Sábado', total: 2840 },
  { name: 'Domingo', total: 860 }
];

// Dados de faturamento por horário
const hourlyRevenueData = [
  { hour: '08:00', total: 350 },
  { hour: '09:00', total: 580 },
  { hour: '10:00', total: 780 },
  { hour: '11:00', total: 920 },
  { hour: '12:00', total: 650 },
  { hour: '13:00', total: 720 },
  { hour: '14:00', total: 850 },
  { hour: '15:00', total: 930 },
  { hour: '16:00', total: 870 },
  { hour: '17:00', total: 750 },
  { hour: '18:00', total: 680 },
  { hour: '19:00', total: 450 },
  { hour: '20:00', total: 280 }
];

// Dados de faturamento por forma de pagamento
const paymentMethodData = [
  { name: 'Cartão de Crédito', value: 12500, percentage: 42, color: '#8B4513' },
  { name: 'Cartão de Débito', value: 9800, percentage: 33, color: '#A0522D' },
  { name: 'Dinheiro', value: 4200, percentage: 14, color: '#CD853F' },
  { name: 'Pix', value: 3300, percentage: 11, color: '#DEB887' }
];

// Dados de ticket médio por barbeiro
const avgTicketData = [
  { id: 1, name: 'Carlos Silva', avgTicket: 68.50, maxTicket: 150, minTicket: 35 },
  { id: 2, name: 'Ricardo Gomes', avgTicket: 72.40, maxTicket: 165, minTicket: 40 },
  { id: 3, name: 'André Santos', avgTicket: 81.20, maxTicket: 180, minTicket: 45 },
  { id: 4, name: 'Felipe Costa', avgTicket: 65.30, maxTicket: 140, minTicket: 30 }
];

// Dados de comparação ano a ano
const yearComparisonData = [
  { name: 'Jan', "2022": 7200, "2023": 8500 },
  { name: 'Fev', "2022": 7800, "2023": 9200 },
  { name: 'Mar', "2022": 7400, "2023": 8700 },
  { name: 'Abr', "2022": 8300, "2023": 9800 },
  { name: 'Mai', "2022": 8600, "2023": 10200 },
  { name: 'Jun', "2022": 9800, "2023": 11500 },
  { name: 'Jul', "2022": 10400, "2023": 12000 },
  { name: 'Ago', "2022": 10800, "2023": 12500 },
  { name: 'Set', "2022": 11500, "2023": 13200 },
  { name: 'Out', "2022": 10950, "2023": 12450 },
  { name: 'Nov', "2022": 12200, "2023": 0 },
  { name: 'Dez', "2022": 13600, "2023": 0 }
];

const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'];

const AdminRevenue = () => {
  const [period, setPeriod] = useState('year');
  const [reportTab, setReportTab] = useState('overview');
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const getUserData = () => {
    if (user?.role === 'barber') {
      return {
        revenueData: barberIndividualData[user.name] || [],
        serviceData: barberServiceData[user.name] || []
      };
    }
    return { revenueData, serviceData: serviceRevenueData };
  };

  const userData = getUserData();
  
  const totalUserRevenue = userData.serviceData.reduce((sum, item) => sum + item.revenue, 0);
  
  const totalBarberRevenue = barberRevenueData.reduce((sum, item) => sum + item.revenue, 0);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  const tooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
    }
    return [`R$ ${value}`, 'Faturamento'];
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold">
            {user?.role === 'barber' ? 'Meu Faturamento' : 'Faturamento'}
          </h1>
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
              <CardTitle className="text-sm font-medium">
                {user?.role === 'barber' ? 'Meu Faturamento Total' : 'Faturamento Total'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.role === 'barber' ? 'R$ 14.850,00' : 'R$ 20.980,00'}
              </div>
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
              <CardTitle className="text-sm font-medium">
                {user?.role === 'barber' ? 'Meu Ticket Médio' : 'Ticket Médio'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.role === 'barber' && user.name === 'Carlos Silva' ? 'R$ 68,50' : 'R$ 62,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% comparado ao período anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={reportTab} onValueChange={setReportTab} className="w-full">
          <TabsList className={`w-full mb-4 ${isMobile ? 'flex flex-wrap gap-1' : 'grid grid-cols-3'}`}>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            {user?.role !== 'barber' && <TabsTrigger value="barbers" className="text-xs sm:text-sm">Por Barbeiro</TabsTrigger>}
            <TabsTrigger value="services" className="text-xs sm:text-sm">Por Serviço</TabsTrigger>
            <TabsTrigger value="time" className="text-xs sm:text-sm">Por Período</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {user?.role === 'barber' ? 'Análise do Meu Faturamento' : 'Análise de Faturamento'}
                  </CardTitle>
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
                      data={userData.revenueData}
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
                      <Tooltip formatter={tooltipFormatter} />
                      <Legend />
                      <Bar dataKey="total" name="Faturamento (R$)" fill="#8B4513" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                  <CardDescription>Distribuição por método de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => {
                          if (typeof value === 'number') {
                            return [`R$ ${value.toFixed(2)}`, 'Valor'];
                          }
                          return [`R$ ${value}`, 'Valor'];
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Faturamento por Dia da Semana</CardTitle>
                  <CardDescription>Análise de receita por dia da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weekdayRevenueData}
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
                        <Tooltip formatter={tooltipFormatter} />
                        <Bar dataKey="total" name="Faturamento (R$)" fill="#A0522D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.role !== 'barber' && (
            <TabsContent value="barbers">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Faturamento por Barbeiro</CardTitle>
                      <CardDescription>Distribuição de receita por profissional</CardDescription>
                    </div>
                    <Users className="h-5 w-5 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={barberRevenueData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {barberRevenueData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => {
                            if (typeof value === 'number') {
                              return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
                            }
                            return [`R$ ${value}`, 'Faturamento'];
                          }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento por Barbeiro</CardTitle>
                    <CardDescription>Análise de receita por profissional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Barbeiro</TableHead>
                            <TableHead>Faturamento</TableHead>
                            <TableHead>% do Total</TableHead>
                            <TableHead>Distribuição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {barberRevenueData.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{formatCurrency(item.revenue)}</TableCell>
                              <TableCell>{item.percentage}%</TableCell>
                              <TableCell className="w-1/4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="h-2.5 rounded-full"
                                    style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#8B4513' }}
                                  ></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <tfoot className="bg-gray-50 font-semibold">
                          <tr>
                            <TableCell>Total</TableCell>
                            <TableCell>{formatCurrency(totalBarberRevenue)}</TableCell>
                            <TableCell>100%</TableCell>
                            <TableCell></TableCell>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Mensal por Barbeiro</CardTitle>
                    <CardDescription>Faturamento mensal de cada profissional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={barberMonthlyData}
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
                          <Tooltip formatter={tooltipFormatter} />
                          <Legend />
                          <Line type="monotone" dataKey="Carlos" stroke="#8B4513" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="Ricardo" stroke="#A0522D" />
                          <Line type="monotone" dataKey="André" stroke="#CD853F" />
                          <Line type="monotone" dataKey="Felipe" stroke="#DEB887" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Médio por Barbeiro</CardTitle>
                    <CardDescription>Valor médio por atendimento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Barbeiro</TableHead>
                            <TableHead>Ticket Médio</TableHead>
                            <TableHead>Ticket Máximo</TableHead>
                            <TableHead>Ticket Mínimo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {avgTicketData.map(item => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{formatCurrency(item.avgTicket)}</TableCell>
                              <TableCell>{formatCurrency(item.maxTicket)}</TableCell>
                              <TableCell>{formatCurrency(item.minTicket)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'barber' ? 'Meu Faturamento por Serviço' : 'Faturamento por Serviço'}
                </CardTitle>
                <CardDescription>Análise de receita por tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Faturamento</TableHead>
                        <TableHead>% do Total</TableHead>
                        <TableHead>Distribuição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.serviceData.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.service}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.revenue)}</TableCell>
                          <TableCell>{item.percentage}%</TableCell>
                          <TableCell className="w-1/4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full bg-barber-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <TableCell>Total</TableCell>
                        <TableCell>
                          {userData.serviceData.reduce((sum, item) => sum + item.quantity, 0)}
                        </TableCell>
                        <TableCell>{formatCurrency(totalUserRevenue)}</TableCell>
                        <TableCell>100%</TableCell>
                        <TableCell></TableCell>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user?.role === 'barber' ? 'Distribuição dos Meus Serviços' : 'Distribuição de Serviços'}
                  </CardTitle>
                  <CardDescription>Proporção de cada serviço no faturamento total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userData.serviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="service"
                          label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userData.serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => {
                          if (typeof value === 'number') {
                            return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
                          }
                          return [`R$ ${value}`, 'Faturamento'];
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento por Horário</CardTitle>
                  <CardDescription>Análise de receita por hora do dia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={hourlyRevenueData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip formatter={tooltipFormatter} />
                        <Area type="monotone" dataKey="total" stroke="#8B4513" fill="#CD853F" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Faturamento por Dia da Semana</CardTitle>
                  <CardDescription>Análise de receita por dia da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weekdayRevenueData}
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
                        <Tooltip formatter={tooltipFormatter} />
                        <Bar dataKey="total" name="Faturamento (R$)" fill="#A0522D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors text-xs sm:text-sm">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Exportar Excel</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors text-xs sm:text-sm">
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
