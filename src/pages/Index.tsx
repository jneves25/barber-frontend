
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, Scissors, Users } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <ClientLayout>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')",
            filter: "brightness(0.4)"
          }}
        />
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Experiência premium em barbearia</h1>
            <p className="text-xl md:text-2xl mb-8">Cuide do seu estilo com os melhores profissionais da cidade.</p>
            <Link to="/services">
              <Button size="lg" className="bg-barber-400 hover:bg-barber-500 text-white">
                Agendar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="service-card">
              <div className="mb-4 h-40 overflow-hidden rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Corte de Cabelo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Corte de Cabelo</h3>
              <p className="text-gray-600 mt-1 text-sm">Corte moderno realizado com tesoura e máquina.</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center text-barber-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">30 min</span>
                </div>
                <span className="font-bold text-barber-500">R$ 50,00</span>
              </div>
            </div>
            
            <div className="service-card">
              <div className="mb-4 h-40 overflow-hidden rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Barba" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Barba</h3>
              <p className="text-gray-600 mt-1 text-sm">Modelagem, contorno e hidratação da barba.</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center text-barber-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">20 min</span>
                </div>
                <span className="font-bold text-barber-500">R$ 35,00</span>
              </div>
            </div>
            
            <div className="service-card">
              <div className="mb-4 h-40 overflow-hidden rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Combo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Combo Completo</h3>
              <p className="text-gray-600 mt-1 text-sm">Corte de cabelo + barba + sobrancelha.</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center text-barber-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">60 min</span>
                </div>
                <span className="font-bold text-barber-500">R$ 80,00</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="outline" className="border-barber-400 text-barber-500 hover:bg-barber-50">
                Ver todos os serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que nos escolher</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <Scissors className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profissionais Qualificados</h3>
              <p className="text-gray-600">Equipe experiente e treinada nas últimas tendências.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <CalendarCheck className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Agendamento Fácil</h3>
              <p className="text-gray-600">Marque seu horário online sem complicações.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pontualidade</h3>
              <p className="text-gray-600">Respeitamos seu tempo com atendimento no horário marcado.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ambiente Exclusivo</h3>
              <p className="text-gray-600">Local confortável e moderno para sua melhor experiência.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 bg-barber-400 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para renovar seu visual?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Faça seu agendamento agora mesmo e tenha a melhor experiência em barbearia da cidade.</p>
          <Link to="/services">
            <Button size="lg" className="bg-white text-barber-500 hover:bg-gray-100">
              Agendar horário
            </Button>
          </Link>
        </div>
      </section>
    </ClientLayout>
  );
};

export default Index;
