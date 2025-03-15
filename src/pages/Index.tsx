
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Clock, LineChart, Scissors, ShieldCheck, Star, Users, Play } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ServiceCard from '@/components/ServiceCard';

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Transforme sua barbearia com nossa plataforma</h1>
            <p className="text-xl md:text-2xl mb-8">Gerencie agendamentos, clientes e finanças em um único lugar.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/pricing">
                <Button size="lg" className="bg-barber-400 hover:bg-barber-500 text-white">
                  Ver planos
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Falar com um consultor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Veja nossa plataforma em ação</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Confira como a BarberShop pode transformar a gestão da sua barbearia em minutos.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="relative aspect-video bg-gray-100">
              {/* Placeholder for the video */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10">
                <div className="bg-barber-400 rounded-full p-4 cursor-pointer transition-transform hover:scale-110">
                  <Play className="h-10 w-10 text-white" />
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-barber-50 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-barber-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Otimize seu tempo</h3>
              <p className="text-gray-600">Reduza o tempo gasto com tarefas administrativas e agendamentos.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-barber-50 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-barber-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fidelize clientes</h3>
              <p className="text-gray-600">Aumente o retorno de clientes com um sistema de agendamento eficiente.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-barber-50 flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-barber-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Acompanhe resultados</h3>
              <p className="text-gray-600">Visualize métricas e relatórios para otimizar seu negócio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tudo o que sua barbearia precisa</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida especialmente para barbearias, oferecendo todas as ferramentas necessárias para o seu sucesso.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-barber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <CalendarCheck className="h-8 w-8 text-barber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Agendamentos online</h3>
                <p className="text-gray-600">
                  Permita que seus clientes agendem serviços 24/7 diretamente pelo seu site ou aplicativo.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="bg-barber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-barber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de clientes</h3>
                <p className="text-gray-600">
                  Mantenha um histórico completo de cada cliente, incluindo serviços preferidos e histórico de visitas.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="bg-barber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <LineChart className="h-8 w-8 text-barber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Relatórios avançados</h3>
                <p className="text-gray-600">
                  Acompanhe vendas, comissões e desempenho com relatórios detalhados e gráficos intuitivos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos para cada necessidade</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano que melhor se adapta ao tamanho da sua barbearia e necessidades específicas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-transparent hover:border-barber-200 transition-all">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Básico</h3>
                  <div className="text-4xl font-bold mb-1">R$99<span className="text-base font-normal text-gray-500">/mês</span></div>
                  <p className="text-gray-500">Para barbearias iniciantes</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Agendamento online</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Até 2 barbeiros</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Histórico de clientes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Relatórios básicos</span>
                  </li>
                </ul>
                
                <Button className="w-full">Começar grátis</Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-barber-400 relative">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                <div className="bg-barber-400 text-white text-sm font-medium px-4 py-1 rounded-full inline-block">
                  Mais popular
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Profissional</h3>
                  <div className="text-4xl font-bold mb-1">R$199<span className="text-base font-normal text-gray-500">/mês</span></div>
                  <p className="text-gray-500">Para barbearias em crescimento</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Tudo do plano Básico</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Até 5 barbeiros</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Gestão de comissões</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Notificações SMS</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-barber-400 hover:bg-barber-500">Assinar agora</Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-transparent hover:border-barber-200 transition-all">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="text-4xl font-bold mb-1">R$349<span className="text-base font-normal text-gray-500">/mês</span></div>
                  <p className="text-gray-500">Para redes de barbearias</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Tudo do plano Profissional</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Barbeiros ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Múltiplas unidades</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>API para integrações</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                
                <Button className="w-full">Falar com vendas</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Barbearias de todo o Brasil já transformaram seus negócios com nossa plataforma.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  "Depois que implementamos o sistema, nossa organização melhorou 100%. Antes perdíamos clientes por falhas no agendamento, agora tudo flui perfeitamente."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Cliente" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Ricardo Gomes</h4>
                    <p className="text-sm text-gray-500">Barbearia Vintage, SP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  "Os relatórios financeiros são excelentes! Consigo acompanhar com precisão as comissões dos barbeiros e o desempenho geral da barbearia."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/men/15.jpg" 
                      alt="Cliente" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">André Santos</h4>
                    <p className="text-sm text-gray-500">Barber Club, RJ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  "O sistema de agendamento online reduziu drasticamente as ligações telefônicas e nos permitiu focar no atendimento aos clientes presentes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Cliente" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Carla Oliveira</h4>
                    <p className="text-sm text-gray-500">Studio Hair, MG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher nossa plataforma</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvida especificamente para o setor de barbearias, nossa plataforma traz benefícios reais para o seu negócio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <Scissors className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Especializado para barbearias</h3>
              <p className="text-gray-600">
                Sistema desenvolvido exclusivamente para atender as necessidades específicas de barbearias.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Economize tempo</h3>
              <p className="text-gray-600">
                Automatize tarefas administrativas e foque no que realmente importa: seus clientes.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <LineChart className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aumente os lucros</h3>
              <p className="text-gray-600">
                Reduza cancelamentos, melhore a gestão e aumente a receita da sua barbearia.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-barber-50 p-4 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8 text-barber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Suporte completo</h3>
              <p className="text-gray-600">
                Nossa equipe está sempre disponível para ajudar com qualquer dúvida ou problema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-barber-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar sua barbearia?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de barbearias que já estão aproveitando todos os benefícios da nossa plataforma.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-barber-500 hover:bg-gray-100">
                Ver planos
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Falar com um consultor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
};

export default Index;
