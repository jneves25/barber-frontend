
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User } from 'lucide-react';

const AdminAppointments = () => {
  // Dados de exemplo para agendamentos
  const appointments = [
    { id: 1, clientName: 'João Silva', service: 'Corte de Cabelo', barber: 'Carlos Silva', date: '2023-10-10', time: '14:00' },
    { id: 2, clientName: 'Pedro Oliveira', service: 'Barba', barber: 'Ricardo Gomes', date: '2023-10-10', time: '15:30' },
    { id: 3, clientName: 'Lucas Santos', service: 'Combo Completo', barber: 'André Santos', date: '2023-10-11', time: '10:00' },
    { id: 4, clientName: 'Marcos Pereira', service: 'Corte Degradê', barber: 'Felipe Costa', date: '2023-10-11', time: '16:00' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <button className="bg-barber-500 text-white px-4 py-2 rounded-md">
            Novo Agendamento
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Visualize e gerencie todos os agendamentos da barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Cliente</th>
                    <th className="p-3 border-b">Serviço</th>
                    <th className="p-3 border-b">Barbeiro</th>
                    <th className="p-3 border-b">Data</th>
                    <th className="p-3 border-b">Horário</th>
                    <th className="p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{appointment.clientName}</td>
                      <td className="p-3 border-b">{appointment.service}</td>
                      <td className="p-3 border-b">{appointment.barber}</td>
                      <td className="p-3 border-b">{appointment.date}</td>
                      <td className="p-3 border-b">{appointment.time}</td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700">Editar</button>
                          <button className="text-red-500 hover:text-red-700">Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
