
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Phone, Mail, User } from 'lucide-react';

const AdminClients = () => {
  // Dados de exemplo para clientes
  const clients = [
    { id: 1, name: 'João Silva', phone: '(11) 98765-4321', email: 'joao@email.com', visits: 5, lastVisit: '10/09/2023' },
    { id: 2, name: 'Pedro Oliveira', phone: '(11) 91234-5678', email: 'pedro@email.com', visits: 3, lastVisit: '05/09/2023' },
    { id: 3, name: 'Lucas Santos', phone: '(11) 99876-5432', email: 'lucas@email.com', visits: 8, lastVisit: '15/09/2023' },
    { id: 4, name: 'Marcos Pereira', phone: '(11) 94567-8901', email: 'marcos@email.com', visits: 2, lastVisit: '01/09/2023' },
    { id: 5, name: 'Roberto Almeida', phone: '(11) 92345-6789', email: 'roberto@email.com', visits: 6, lastVisit: '12/09/2023' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <button className="bg-barber-500 text-white px-4 py-2 rounded-md">
            Novo Cliente
          </button>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Buscar cliente..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-barber-500"
            />
          </div>
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm">
            Buscar
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gerencie todos os clientes da barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Nome</th>
                    <th className="p-3 border-b">Telefone</th>
                    <th className="p-3 border-b">Email</th>
                    <th className="p-3 border-b">Visitas</th>
                    <th className="p-3 border-b">Última Visita</th>
                    <th className="p-3 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{client.name}</td>
                      <td className="p-3 border-b">{client.phone}</td>
                      <td className="p-3 border-b">{client.email}</td>
                      <td className="p-3 border-b">{client.visits}</td>
                      <td className="p-3 border-b">{client.lastVisit}</td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-500 hover:text-blue-700" title="Editar">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-500 hover:text-green-700" title="WhatsApp">
                            <Phone className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700" title="Ver perfil">
                            <User className="h-4 w-4" />
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">250</div>
              <p className="text-xs text-muted-foreground">
                +12 novos este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Frequentes</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-muted-foreground">
                Visitam mais de 1x por mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                +2% comparado ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
