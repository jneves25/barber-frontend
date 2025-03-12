
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar } from 'react-day-picker';
import { format, addDays, isWeekend, isAfter, isBefore, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientLayout from '@/components/layout/ClientLayout';
import BarberCard, { BarberProps } from '@/components/BarberCard';
import ServiceCard, { ServiceProps } from '@/components/ServiceCard';
import TimeSlot from '@/components/TimeSlot';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';

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

// Gerar horários disponíveis
const generateTimeSlots = (date: Date) => {
  const slots = [];
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const startHour = isToday ? new Date().getHours() + 1 : 9; // Se for hoje, começar a partir da próxima hora
  
  for (let hour = startHour; hour <= 19; hour++) {
    // Gere slots a cada 30 minutos
    for (let minute of [0, 30]) {
      // Pular slots passados para o dia atual
      if (isToday && hour === startHour && minute < new Date().getMinutes()) {
        continue;
      }
      
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Simular alguns horários ocupados aleatoriamente
      const available = Math.random() > 0.3; // 30% de chance de estar ocupado
      
      slots.push({ time, available });
    }
  }
  
  return slots;
};

const Schedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<BarberProps | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceProps | null>(null);

  useEffect(() => {
    // Obter o serviço e barbeiro selecionados a partir da URL
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('serviceId');
    const barberId = params.get('barberId');
    
    if (serviceId && barberId) {
      const service = SERVICES.find(s => s.id === serviceId);
      const barber = BARBERS.find(b => b.id === barberId);
      
      if (service && barber) {
        setSelectedService(service);
        setSelectedBarber(barber);
      } else {
        // Redirecionar se o serviço ou barbeiro não for encontrado
        navigate('/services');
      }
    } else {
      // Redirecionar se não tiver todos os parâmetros
      navigate('/services');
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Gerar horários disponíveis quando a data for selecionada
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedService && selectedBarber && selectedDate && selectedTime) {
      // Normalmente, aqui iremos para a confirmação ou login
      navigate('/contact-info', { 
        state: { 
          service: selectedService,
          barber: selectedBarber,
          date: selectedDate,
          time: selectedTime
        } 
      });
    }
  };

  // Função para desabilitar datas no calendário
  const disabledDays = (date: Date) => {
    const today = startOfToday();
    return (
      isWeekend(date) || // Desabilitar finais de semana
      isBefore(date, today) || // Desabilitar dias passados
      isAfter(date, addDays(today, 30)) // Permitir agendamento até 30 dias no futuro
    );
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Escolha a data e horário</h1>
        <p className="text-gray-600 mb-8">Selecione quando deseja agendar seu serviço</p>
        
        {/* Resumo do agendamento */}
        {selectedService && selectedBarber && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-3">Resumo do agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Serviço:</p>
                <p className="font-medium">{selectedService.name} - R$ {selectedService.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">Duração:</p>
                <p className="font-medium">{selectedService.duration} minutos</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barbeiro:</p>
                <p className="font-medium">{selectedBarber.name}</p>
                <p className="text-sm text-gray-500 mt-2">Especialidade:</p>
                <p className="font-medium">{selectedBarber.specialty}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calendário */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <CalendarIcon className="mr-2 h-5 w-5 text-barber-500" />
              <h3 className="text-lg font-semibold">Selecione a data</h3>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </div>
          
          {/* Horários */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <TimeSlot
                    key={slot.time}
                    time={slot.time}
                    available={slot.available}
                    selected={selectedTime === slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum horário disponível para esta data.</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-10">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="border-barber-300 text-barber-500 hover:bg-barber-50"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedTime}
            className="bg-barber-400 hover:bg-barber-500 text-white"
          >
            Continuar
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Schedule;
