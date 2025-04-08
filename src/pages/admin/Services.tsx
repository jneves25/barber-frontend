
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Clock, DollarSign, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceProductService, { Service } from '@/services/api/ServiceProductService';
import { toast } from 'sonner';

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      // Assumindo que o usuário pertence à empresa 1
      // Em um cenário real, isso viria do contexto do usuário
      const companyId = 1;
      const response = await ServiceProductService.getAllServices(companyId);
      
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        toast.error(response.error || 'Erro ao carregar serviços');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setIsDeleting(id);
      try {
        const response = await ServiceProductService.deleteService(id);
        if (response.success) {
          toast.success('Serviço excluído com sucesso');
          fetchServices();
        } else {
          toast.error(response.error || 'Erro ao excluir serviço');
        }
      } catch (error) {
        toast.error('Erro ao conectar com o servidor');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Calculate statistics
  const averageDuration = services.length > 0 
    ? Math.round(services.reduce((sum, service) => sum + service.duration, 0) / services.length) 
    : 0;
    
  const averagePrice = services.length > 0
    ? services.reduce((sum, service) => sum + service.price, 0) / services.length
    : 0;

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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-barber-500" />
              </div>
            ) : (
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
                    {services.length > 0 ? services.map(service => (
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
                            <button 
                              className="p-1 text-red-500 hover:text-red-700 transition-colors" 
                              title="Excluir"
                              onClick={() => handleDelete(service.id!)}
                              disabled={isDeleting === service.id}
                            >
                              {isDeleting === service.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-gray-500">
                          Nenhum serviço encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Total de Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-barber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{services.length}</div>
              <p className="text-xs text-gray-500">
                Serviços cadastrados
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Duração Média</CardTitle>
              <Clock className="h-4 w-4 text-barber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{averageDuration} min</div>
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
              <div className="text-2xl font-bold text-gray-800">R$ {averagePrice.toFixed(2)}</div>
              <p className="text-xs text-gray-500">
                Valor médio dos serviços
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
