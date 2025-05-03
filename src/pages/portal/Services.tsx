
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/layout/ClientLayout';
import ServiceCard, { ServiceProps } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ServiceProductService, { Service } from '@/services/api/ServiceProductService';
import { toast } from 'sonner';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      navigate(`/barbers?serviceId=${selectedService}`);
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Nossos Serviços</h1>
        <p className="text-gray-600 mb-8">Selecione o serviço que deseja agendar</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-barber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <ServiceCard 
                key={service.id}
                id={String(service.id)}
                name={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                image="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" // Placeholder image
                onClick={() => handleServiceClick(String(service.id))}
                selected={selectedService === String(service.id)}
              />
            ))}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!selectedService || isLoading}
            className="bg-barber-400 hover:bg-barber-500 text-white"
          >
            Continuar
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ServicesPage;
