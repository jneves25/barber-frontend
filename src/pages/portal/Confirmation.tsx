
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Check } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter os detalhes do agendamento do estado de navegação
  const { name, phone, email, service, barber, date, time } = location.state || {};

  // Verificar se temos todos os dados necessários
  if (!service || !barber || !date || !time || !name || !phone) {
    navigate('/services');
    return null;
  }

  const formattedDate = format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <ClientLayout hideHeader>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamento confirmado!</h1>
            <p className="text-gray-600 mt-2">
              Olá {name}, seu horário foi agendado com sucesso.
            </p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <div className="grid gap-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-barber-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Data e Horário</p>
                  <p className="text-gray-600">{formattedDate} às {time}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-barber-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Serviço</p>
                  <p className="text-gray-600">{service.name}</p>
                  <p className="text-gray-600">Duração: {service.duration} minutos</p>
                  <p className="text-gray-600">Valor: R$ {service.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-5 w-5 bg-barber-500 rounded-full mt-0.5 mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{barber.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Barbeiro</p>
                  <p className="text-gray-600">{barber.name}</p>
                  <p className="text-gray-600">{barber.specialty}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-barber-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Local</p>
                  <p className="text-gray-600">BarberShop</p>
                  <p className="text-gray-600">Rua da Barbearia, 123 - São Paulo, SP</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-gray-700 text-sm mb-6">
            <p className="mb-2">
              <span className="font-semibold">Importante:</span> Caso precise cancelar ou reagendar, entre em contato com pelo menos 2 horas de antecedência.
            </p>
            <p>
              Um lembrete será enviado para seu telefone ({phone})
              {email && ` e e-mail (${email})`} algumas horas antes do seu agendamento.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-barber-300 text-barber-500 hover:bg-barber-50"
            >
              Voltar para a página inicial
            </Button>
            
            <Button 
              onClick={() => {
                // Simular adicionar ao calendário
                alert('Esta funcionalidade seria integrada com o Google Calendar ou Apple Calendar em uma implementação real.');
              }}
              className="bg-barber-400 hover:bg-barber-500 text-white"
            >
              Adicionar ao calendário
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Confirmation;
