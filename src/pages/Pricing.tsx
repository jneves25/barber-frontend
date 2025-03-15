
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const plans = [
    {
      name: 'Básico',
      monthlyPrice: 99,
      yearlyPrice: 79,
      description: 'Para barbearias iniciantes',
      featured: false,
      features: [
        'Agendamento online',
        'Até 2 barbeiros',
        'Dashboard administrativo',
        'Histórico de clientes',
        'Relatórios básicos',
        'Controle de caixa simples',
        'Suporte por email'
      ]
    },
    {
      name: 'Profissional',
      monthlyPrice: 199,
      yearlyPrice: 159,
      description: 'Para barbearias em crescimento',
      featured: true,
      features: [
        'Tudo do plano Básico',
        'Até 5 barbeiros',
        'Gestão de comissões',
        'Relatórios avançados',
        'Notificações SMS',
        'Controle de estoque',
        'Fidelização de clientes',
        'Suporte prioritário'
      ]
    },
    {
      name: 'Premium',
      monthlyPrice: 349,
      yearlyPrice: 279,
      description: 'Para redes de barbearias',
      featured: false,
      features: [
        'Tudo do plano Profissional',
        'Barbeiros ilimitados',
        'Múltiplas unidades',
        'API para integrações',
        'Aplicativo personalizado',
        'Gestão financeira completa',
        'Relatórios personalizados',
        'Consultor de negócios dedicado'
      ]
    }
  ];
  
  return (
    <ClientLayout>
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Planos e preços</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para a sua barbearia e transforme sua gestão.
            </p>
            
            <div className="mt-8 inline-flex items-center bg-gray-100 p-1 rounded-lg">
              <Tabs defaultValue="monthly" className="w-full max-w-xs mx-auto" onValueChange={setBillingCycle}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Mensal</TabsTrigger>
                  <TabsTrigger value="yearly">Anual (20% off)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative ${plan.featured ? 'border-2 border-barber-400 shadow-lg' : 'border border-gray-200 hover:border-barber-200 transition-all'}`}
              >
                {plan.featured && (
                  <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                    <div className="bg-barber-400 text-white text-sm font-medium px-4 py-1 rounded-full inline-block">
                      Mais popular
                    </div>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold mb-1">
                      R${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      <span className="text-base font-normal text-gray-500">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium mb-2">
                        Economize R${(plan.monthlyPrice - plan.yearlyPrice) * 12}/ano
                      </div>
                    )}
                    <p className="text-gray-500">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.featured ? 'bg-barber-400 hover:bg-barber-500' : ''}`}
                  >
                    {plan.name === 'Premium' ? 'Falar com vendas' : 'Começar agora'}
                  </Button>
                  
                  {billingCycle === 'monthly' ? (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      Sem contratos longos, cancele quando quiser
                    </p>
                  ) : (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      Faturado anualmente, economize 20%
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Perguntas frequentes</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-semibold mb-2">Preciso de cartão de crédito para testar?</h3>
                <p className="text-gray-600">Não, oferecemos um período de teste gratuito de 14 dias em todos os planos sem necessidade de cartão de crédito.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Posso mudar de plano depois?</h3>
                <p className="text-gray-600">Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento, com ajuste proporcional no valor.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Existe suporte técnico?</h3>
                <p className="text-gray-600">Sim, todos os planos incluem suporte técnico, com níveis diferentes de prioridade conforme o plano contratado.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Como funciona a cobrança?</h3>
                <p className="text-gray-600">Trabalhamos com cobrança recorrente via cartão de crédito ou boleto bancário, com opções de pagamento mensal ou anual.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">E se eu tiver múltiplas unidades?</h3>
                <p className="text-gray-600">O plano Premium é ideal para redes com múltiplas unidades, permitindo gestão centralizada de todas as lojas.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">Sim, não exigimos contratos de fidelidade. Você pode cancelar sua assinatura a qualquer momento.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center bg-barber-50 py-10 px-4 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h2>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano para sua barbearia.
            </p>
            <Link to="/contact">
              <Button variant="outline" className="border-barber-400 text-barber-500">
                Fale com nossa equipe
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default PricingPage;
