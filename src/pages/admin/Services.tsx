
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
          <Button className="bg-barber-500 hover:bg-barber-600">
            Novo Serviço
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-gray-800">Catálogo de Serviços</CardTitle>
            <CardDescription>Gerencie os serviços oferecidos pela barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Nome</th>
                    <th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Preço (R$)</th>
                    <th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Duração (min)</th>
                    <th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Descrição</th>
                    <th className="p-3 border-b border-gray-100 text-gray-600 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id} className="hover:bg-blue-50/50">
                      <td className="p-3 border-b border-gray-100">{service.name}</td>
                      <td className="p-3 border-b border-gray-100">{service.price.toFixed(2)}</td>
                      <td className="p-3 border-b border-gray-100">{service.duration}</td>
                      <td className="p-3 border-b border-gray-100">{service.description}</td>
                      <td className="p-3 border-b border-gray-100">
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-500 hover:text-blue-700 transition-colors" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </button>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Total de Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-barber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">12</div>
              <p className="text-xs text-gray-500">
                +2 novos serviços este mês
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Duração Média</CardTitle>
              <Clock className="h-4 w-4 text-barber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">35 min</div>
              <p className="text-xs text-gray-500">
                Por atendimento
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-barber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">R$ 55,00</div>
              <p className="text-xs text-gray-500">
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
