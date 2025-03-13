
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Edit, Trash2 } from 'lucide-react';

const AdminAppointments = () => {
  // Dados de exemplo para agendamentos
  const appointments = [
    { id: 1, clientName: 'João Silva', service: 'Corte de Cabelo', barber: 'Carlos Silva', date: '10/10/2023', time: '14:00' },
    { id: 2, clientName: 'Pedro Oliveira', service: 'Barba', barber: 'Ricardo Gomes', date: '10/10/2023', time: '15:30' },
    { id: 3, clientName: 'Lucas Santos', service: 'Combo Completo', barber: 'André Santos', date: '11/10/2023', time: '10:00' },
    { id: 4, clientName: 'Marcos Pereira', service: 'Corte Degradê', barber: 'Felipe Costa', date: '11/10/2023', time: '16:00' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <button className="bg-barber-500 text-white px-4 py-2 rounded-md w-full sm:w-auto">
            Novo Agendamento
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Visualize e gerencie todos os agendamentos da barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                      <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
                      <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map(appointment => (
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
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.time}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-500 hover:text-blue-700 transition-colors" title="Editar">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Cancelar">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 em relação a ontem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximo Horário</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14:30</div>
              <p className="text-xs text-muted-foreground">
                João Silva - Corte de Cabelo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Novos</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                +2 em relação a semana passada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
