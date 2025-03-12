
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientLayout from '@/components/layout/ClientLayout';
import BarberCard, { BarberProps } from '@/components/BarberCard';
import { Button } from '@/components/ui/button';
import ServiceCard, { ServiceProps } from '@/components/ServiceCard';

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

// Dados de exemplo para barbeiros
const BARBERS: BarberProps[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    specialty: 'Especialista em degradê',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Ricardo Gomes',
    specialty: 'Barba e penteados clássicos',
    rating: 4.6,
    image: 'https://randomuser.me/api/portraits/men/33.jpg'
  },
  {
    id: '3',
    name: 'André Santos',
    specialty: 'Cortes modernos e tratamentos',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  {
    id: '4',
    name: 'Felipe Costa',
    specialty: 'Degradê e barba tradicional',
    rating: 4.7,
    image: 'https://randomuser.me/api/portraits/men/35.jpg'
  }
];

const Barbers = () => {
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceProps | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Obter o serviço selecionado a partir da URL
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('serviceId');
    
    if (serviceId) {
      const service = SERVICES.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      } else {
        // Redirecionar para a página de serviços se o serviço não for encontrado
        navigate('/services');
      }
    } else {
      // Redirecionar para a página de serviços se nenhum serviço for selecionado
      navigate('/services');
    }
  }, [location.search, navigate]);

  const handleBarberClick = (barberId: string) => {
    setSelectedBarber(barberId);
  };

  const handleContinue = () => {
    if (selectedBarber && selectedService) {
      navigate(`/schedule?serviceId=${selectedService.id}&barberId=${selectedBarber}`);
    }
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Escolha seu barbeiro</h1>
            <p className="text-gray-600">Selecione o profissional para realizar o serviço</p>
          </div>
          {selectedService && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="mr-4">
                <p className="text-sm text-gray-500">Serviço selecionado:</p>
                <p className="font-medium">{selectedService.name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/services')}
                className="text-barber-500 border-barber-300 hover:bg-barber-50"
              >
                Alterar
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {BARBERS.map((barber) => (
            <BarberCard 
              key={barber.id} 
              {...barber} 
              onClick={() => handleBarberClick(barber.id)}
              selected={selectedBarber === barber.id}
            />
          ))}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/services')}
            className="border-barber-300 text-barber-500 hover:bg-barber-50"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedBarber}
            className="bg-barber-400 hover:bg-barber-500 text-white"
          >
            Continuar
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Barbers;
