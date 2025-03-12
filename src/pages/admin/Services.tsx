
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Clock, DollarSign } from 'lucide-react';

const AdminServices = () => {
  // Dados de exemplo para serviços
  const services = [
    { id: 1, name: 'Corte de Cabelo', price: 50, duration: 30, description: 'Corte moderno realizado com tesoura e máquina, inclui lavagem.' },
    { id: 2, name: 'Barba', price: 35, duration: 20, description: 'Modelagem, contorno e hidratação da barba.' },
    { id: 3, name: 'Combo Completo', price: 80, duration: 60, description: 'Corte de cabelo + barba + sobrancelha.' },
    { id: 4, name: 'Corte Degradê', price: 60, duration: 40, description: 'Corte com técnica de degradê, navalhado nas laterais.' },
    { id: 5, name: 'Sobrancelha', price: 20, duration: 15, description: 'Modelagem e alinhamento da sobrancelha com linha ou navalha.' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Serviços</h1>
          <button className="bg-barber-500 text-white px-4 py-2 rounded-md">
            Novo Serviço
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Serviços</CardTitle>
            <CardDescription>Gerencie os serviços oferecidos pela barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Nome</th>
                    <th className="p-3 border-b">Preço (R$)</th>
                    <th className="p-3 border-b">Duração (min)</th>
                    <th className="p-3 border-b">Descrição</th>
                    <th className="p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{service.name}</td>
                      <td className="p-3 border-b">{service.price.toFixed(2)}</td>
                      <td className="p-3 border-b">{service.duration}</td>
                      <td className="p-3 border-b">{service.description}</td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700">Editar</button>
                          <button className="text-red-500 hover:text-red-700">Excluir</button>
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
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 novos serviços este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35 min</div>
              <p className="text-xs text-muted-foreground">
                Por atendimento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 55,00</div>
              <p className="text-xs text-muted-foreground">
                +5% comparado ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
