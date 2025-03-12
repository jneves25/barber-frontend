
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/layout/ClientLayout';
import ServiceCard, { ServiceProps } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';

// Dados de exemplo para serviços
const SERVICES: ServiceProps[] = [
  {
    id: '1',
    name: 'Corte de Cabelo',
    description: 'Corte moderno realizado com tesoura e máquina, inclui lavagem.',
    price: 50,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Modelagem, contorno e hidratação da barba.',
    price: 35,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    name: 'Combo Completo',
    description: 'Corte de cabelo + barba + sobrancelha.',
    price: 80,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    name: 'Corte Degradê',
    description: 'Corte com técnica de degradê, navalhado nas laterais.',
    price: 60,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    name: 'Sobrancelha',
    description: 'Modelagem e alinhamento da sobrancelha com linha ou navalha.',
    price: 20,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1594516243133-ab71dbceb035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '6',
    name: 'Tratamento Capilar',
    description: 'Tratamento para fortalecimento e hidratação dos fios.',
    price: 70,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1582004498512-9e0bf9b561a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

const Services = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const navigate = useNavigate();

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {SERVICES.map((service) => (
            <ServiceCard 
              key={service.id} 
              {...service} 
              onClick={() => handleServiceClick(service.id)}
              selected={selectedService === service.id}
            />
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!selectedService}
            className="bg-barber-400 hover:bg-barber-500 text-white"
          >
            Continuar
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Services;
