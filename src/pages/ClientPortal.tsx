
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Calendar, Clock, Star, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Example data for services
const SERVICES = [
  {
    id: '1',
    name: 'Corte de Cabelo',
    price: 35,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    name: 'Barba',
    price: 25,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    name: 'Combo (Cabelo + Barba)',
    price: 55,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    name: 'Sobrancelha',
    price: 15,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1594516243133-ab71dbceb035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

// Example data for barbers
const BARBERS = [
  { id: '1', name: 'Carlos', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Fernando', image: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { id: '3', name: 'Ricardo', image: 'https://randomuser.me/api/portraits/men/33.jpg' }
];

// Example data for time slots
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const ClientPortal = () => {
  const navigate = useNavigate();
  const form = useForm();
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedBarber, setSelectedBarber] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');

  const handleSubmit = (data: any) => {
    console.log("Booking submitted:", {
      service: selectedService,
      barber: selectedBarber,
      date: selectedDate,
      time: selectedTime,
      ...data
    });
    // Here you would typically submit the booking data to your backend
    alert("Agendamento realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-barber-500" />
            <span className="font-bold text-xl text-barber-500">Cousens Barbershop</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:+5511999999999" className="hidden md:flex items-center text-gray-700">
              <Phone className="h-4 w-4 mr-2" />
              (11) 99999-9999
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Shop Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                <Scissors className="h-8 w-8 text-barber-500" />
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-gray-900">Cousens Barbershop</h1>
                <div className="flex items-center text-yellow-500 mt-1">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-2 text-gray-700 text-sm">5.0 (48 avaliações)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Rua da Barbearia, 123</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Seg-Sáb: 9h às 19h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Agende seu horário</h2>
              <p className="text-gray-600 text-sm mt-1">Escolha o serviço, profissional e horário</p>
            </div>

            <Tabs defaultValue="service" className="w-full">
              <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
                <TabsTrigger value="service">Serviço</TabsTrigger>
                <TabsTrigger value="barber">Profissional</TabsTrigger>
                <TabsTrigger value="date">Data</TabsTrigger>
                <TabsTrigger value="confirm">Confirmar</TabsTrigger>
              </TabsList>

              <TabsContent value="service" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICES.map((service) => (
                    <div 
                      key={service.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedService === service.id ? 'ring-2 ring-barber-500' : 'hover:border-barber-300'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{service.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">{service.duration} min</span>
                          </div>
                          <span className="font-bold">R$ {service.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    disabled={!selectedService} 
                    onClick={() => document.querySelector('[data-value="barber"]')?.click()}
                    className="bg-barber-500 hover:bg-barber-600"
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="barber" className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BARBERS.map((barber) => (
                    <div 
                      key={barber.id}
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                        selectedBarber === barber.id ? 'ring-2 ring-barber-500' : 'hover:border-barber-300'
                      }`}
                      onClick={() => setSelectedBarber(barber.id)}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                        <img 
                          src={barber.image} 
                          alt={barber.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-center">{barber.name}</h3>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => document.querySelector('[data-value="service"]')?.click()}
                  >
                    Voltar
                  </Button>
                  <Button 
                    disabled={!selectedBarber} 
                    onClick={() => document.querySelector('[data-value="date"]')?.click()}
                    className="bg-barber-500 hover:bg-barber-600"
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="date" className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Escolha a data</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {['Hoje', 'Amanhã', '05/08', '06/08', '07/08'].map((date, index) => (
                        <div 
                          key={index}
                          className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                            selectedDate === date ? 'bg-barber-500 text-white' : 'hover:border-barber-300'
                          }`}
                          onClick={() => setSelectedDate(date)}
                        >
                          {date}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Escolha o horário</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map((time, index) => (
                        <div 
                          key={index}
                          className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                            selectedTime === time ? 'bg-barber-500 text-white' : 'hover:border-barber-300'
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => document.querySelector('[data-value="barber"]')?.click()}
                  >
                    Voltar
                  </Button>
                  <Button 
                    disabled={!selectedDate || !selectedTime} 
                    onClick={() => document.querySelector('[data-value="confirm"]')?.click()}
                    className="bg-barber-500 hover:bg-barber-600"
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="confirm" className="p-6">
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold mb-3">Resumo do agendamento</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Serviço:</p>
                        <p className="font-medium">
                          {SERVICES.find(s => s.id === selectedService)?.name || 'Não selecionado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Profissional:</p>
                        <p className="font-medium">
                          {BARBERS.find(b => b.id === selectedBarber)?.name || 'Não selecionado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data:</p>
                        <p className="font-medium">{selectedDate || 'Não selecionada'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Horário:</p>
                        <p className="font-medium">{selectedTime || 'Não selecionado'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome completo</label>
                        <Input {...form.register('name')} placeholder="Seu nome" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Telefone</label>
                        <Input {...form.register('phone')} placeholder="(99) 99999-9999" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">E-mail</label>
                      <Input {...form.register('email')} type="email" placeholder="seu@email.com" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                      <Input {...form.register('notes')} placeholder="Alguma observação para o atendimento?" />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => document.querySelector('[data-value="date"]')?.click()}
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-barber-500 hover:bg-barber-600"
                    >
                      Confirmar agendamento
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Scissors className="h-5 w-5 text-barber-500" />
              <span className="font-semibold text-barber-500">Cousens Barbershop</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Cousens Barbershop - Todos os direitos reservados
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;
