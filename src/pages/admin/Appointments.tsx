import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, Edit, Trash2, Check, DollarSign, Filter } from 'lucide-react';
import { format, isBefore, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

// Tipo para agendamentos
interface Appointment {
  id: number;
  clientName: string;
  service: string;
  price: number;
  barber: string;
  date: string; // ISO string
  time: string;
  status: 'pending' | 'completed' | 'open';
}

const AdminAppointments = () => {
  // Estado para data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Estado para agendamentos (expandido com mais informações)
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, clientName: 'João Silva', service: 'Corte de Cabelo', price: 50, barber: 'Carlos Silva', date: '2023-10-10', time: '14:00', status: 'completed' },
    { id: 2, clientName: 'Pedro Oliveira', service: 'Barba', price: 35, barber: 'Ricardo Gomes', date: '2023-10-10', time: '15:30', status: 'completed' },
    { id: 3, clientName: 'Lucas Santos', service: 'Combo Completo', price: 80, barber: 'André Santos', date: new Date().toISOString().split('T')[0], time: '10:00', status: 'pending' },
    { id: 4, clientName: 'Marcos Pereira', service: 'Corte Degradê', price: 60, barber: 'Felipe Costa', date: new Date().toISOString().split('T')[0], time: '16:00', status: 'open' },
    { id: 5, clientName: 'Rafael Dias', service: 'Corte e Barba', price: 70, barber: 'Carlos Silva', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '09:00', status: 'pending' },
    { id: 6, clientName: 'Fernando Lima', service: 'Hidratação', price: 45, barber: 'Ricardo Gomes', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '11:30', status: 'pending' },
  ]);

  // Filtrar agendamentos pela data selecionada
  const filteredAppointments = selectedDate 
    ? appointments.filter(app => app.date === format(selectedDate, 'yyyy-MM-dd'))
    : appointments;

  // Handler para completar um agendamento aberto
  const handleCompleteService = (id: number) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'completed' } : app
      )
    );
    toast.success('Serviço finalizado com sucesso!');
  };

  // Handler para abrir um agendamento pendente
  const handleOpenService = (id: number) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'open' } : app
      )
    );
    toast.success('Serviço aberto como comanda!');
  };

  // Handler para excluir um agendamento
  const handleDeleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
    toast.success('Agendamento removido com sucesso!');
  };

  // Função para calcular estatísticas do dia
  const getDayStats = () => {
    const todayApps = appointments.filter(app => app.date === format(new Date(), 'yyyy-MM-dd'));
    const pendingApps = todayApps.filter(app => app.status === 'pending').length;
    const completedApps = todayApps.filter(app => app.status === 'completed').length;
    const openApps = todayApps.filter(app => app.status === 'open').length;
    
    // Calcular o próximo horário
    const futureApps = todayApps
      .filter(app => {
        const [hours, minutes] = app.time.split(':').map(Number);
        const appTime = new Date();
        appTime.setHours(hours, minutes);
        return appTime > new Date();
      })
      .sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      });

    const nextApp = futureApps.length > 0 ? futureApps[0] : null;
    
    return {
      total: todayApps.length,
      pending: pendingApps,
      completed: completedApps,
      open: openApps,
      nextApp
    };
  };

  const stats = getDayStats();

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto flex items-center justify-between gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto">
              Novo Agendamento
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Visualizando agendamentos para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                : "Visualize e gerencie todos os agendamentos da barbearia."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {filteredAppointments.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                        <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
                        <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map(appointment => {
                        const isPast = isBefore(parseISO(`${appointment.date}T${appointment.time}`), new Date());
                        const isToday = format(parseISO(appointment.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        
                        return (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{appointment.clientName}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.service}</div>
                            </td>
                            <td className="hidden md:table-cell px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.barber}</div>
                            </td>
                            <td className="hidden sm:table-cell px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {format(parseISO(appointment.date), 'dd/MM/yyyy')}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.time}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">R$ {appointment.price.toFixed(2)}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div>
                                {appointment.status === 'pending' && (
                                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>
                                )}
                                {appointment.status === 'completed' && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Finalizado</Badge>
                                )}
                                {appointment.status === 'open' && (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Comanda Aberta</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {appointment.status === 'pending' && isPast && (
                                  <button 
                                    onClick={() => handleOpenService(appointment.id)}
                                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors" 
                                    title="Abrir comanda"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                )}
                                
                                {appointment.status === 'open' && (
                                  <button 
                                    onClick={() => handleCompleteService(appointment.id)}
                                    className="p-1 text-green-500 hover:text-green-700 transition-colors" 
                                    title="Finalizar serviço"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                
                                <button 
                                  className="p-1 text-blue-500 hover:text-blue-700 transition-colors" 
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors" 
                                  title="Cancelar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-gray-400">
                      Não há agendamentos para esta data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <CalendarIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-500">{stats.pending} pendentes</span> • <span className="text-green-500">{stats.completed} finalizados</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximo Horário</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {stats.nextApp ? (
                <>
                  <div className="text-2xl font-bold">{stats.nextApp.time}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.nextApp.clientName} - {stats.nextApp.service}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">--:--</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nenhum agendamento pendente hoje
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comandas Abertas</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
              <p className="text-xs text-gray-500 mt-1">
                Serviços aguardando finalização
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total do Dia</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {appointments
                  .filter(app => app.date === format(new Date(), 'yyyy-MM-dd') && app.status === 'completed')
                  .reduce((sum, app) => sum + app.price, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {appointments.filter(app => app.date === format(new Date(), 'yyyy-MM-dd') && app.status === 'completed').length} serviços finalizados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
