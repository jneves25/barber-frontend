
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContactInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obter os detalhes do agendamento do estado de navegação
  const { service, barber, date, time } = location.state || {};

  // Verificar se temos todos os dados necessários
  if (!service || !barber || !date || !time) {
    navigate('/services');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    if (name.trim() === '' || phone.trim() === '') {
      toast.error('Por favor, preencha seu nome e telefone.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular API request com delay
    setTimeout(() => {
      // Em um app real, aqui faríamos o POST para a API
      
      toast.success('Agendamento realizado com sucesso!');
      
      // Redirecionar para confirmação
      navigate('/confirmation', { 
        state: { 
          name,
          phone,
          email,
          service, 
          barber, 
          date, 
          time 
        } 
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove caracteres não numéricos
    const phoneNumber = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (phoneNumber.length <= 2) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    } else {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
        2,
        7
      )}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Seus dados de contato</h1>
        <p className="text-gray-600 mb-8">Preencha suas informações para finalizar o agendamento</p>
        
        {/* Resumo do agendamento */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4">Detalhes do agendamento</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Serviço:</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor:</span>
              <span className="font-medium">R$ {service.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Barbeiro:</span>
              <span className="font-medium">{barber.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium">
                {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Horário:</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duração:</span>
              <span className="font-medium">{service.duration} minutos</span>
            </div>
          </div>
        </div>
        
        {/* Formulário de contato */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Digite seu nome completo"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  required 
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail (opcional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Digite seu e-mail"
                />
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                * Campos obrigatórios
              </p>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-barber-300 text-barber-500 hover:bg-barber-50"
              >
                Voltar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-barber-400 hover:bg-barber-500 text-white"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar agendamento'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ContactInfo;
