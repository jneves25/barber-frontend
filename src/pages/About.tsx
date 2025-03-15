
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Users } from 'lucide-react';
import ClientLayout from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <ClientLayout>
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Sobre a BarberShop</h1>
            <p className="text-xl text-gray-600 mb-8">
              Desenvolvemos a melhor plataforma de gestão para barbearias do Brasil, 
              ajudando proprietários a transformar seus negócios e alcançar novos patamares de crescimento.
            </p>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Equipe BarberShop" 
                className="rounded-lg w-full max-w-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
              <p className="text-gray-600 mb-4">
                A BarberShop surgiu em 2018 com uma missão clara: transformar a forma como as barbearias são gerenciadas 
                no Brasil. Fundada por um grupo de empreendedores apaixonados pelo setor, nossa empresa nasceu da 
                identificação de um problema real.
              </p>
              <p className="text-gray-600 mb-4">
                Percebemos que muitas barbearias de qualidade estavam limitadas em seu crescimento devido à falta de 
                ferramentas adequadas para gestão. Os sistemas existentes não atendiam às necessidades específicas 
                do setor, e isso impactava diretamente na qualidade do serviço e na rentabilidade.
              </p>
              <p className="text-gray-600">
                Hoje, atendemos mais de 500 barbearias em todo o Brasil, desde pequenos negócios até grandes redes, 
                ajudando-os a otimizar processos, aumentar receitas e melhorar a experiência de seus clientes.
              </p>
            </div>
            <div className="order-first md:order-last">
              <img 
                src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Nossa história" 
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Missão, Visão e Valores</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nossa empresa é guiada por princípios sólidos que orientam todas as nossas decisões.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Missão</h3>
                  <p className="text-gray-600">
                    Transformar a gestão de barbearias através de tecnologia acessível e adaptada às necessidades reais do setor.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Visão</h3>
                  <p className="text-gray-600">
                    Ser reconhecida como a principal plataforma de gestão para barbearias na América Latina até 2025.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Valores</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Simplicidade e facilidade de uso</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Inovação constante</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Foco no cliente</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Transparência</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nossa Equipe</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conheça algumas das pessoas por trás da plataforma que está transformando barbearias em todo o Brasil.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Carlos Silva",
                  position: "CEO & Fundador",
                  image: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                  name: "Marina Santos",
                  position: "CTO",
                  image: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                {
                  name: "Ricardo Gomes",
                  position: "Head de Produto",
                  image: "https://randomuser.me/api/portraits/men/62.jpg"
                },
                {
                  name: "Juliana Costa",
                  position: "Head de Customer Success",
                  image: "https://randomuser.me/api/portraits/women/68.jpg"
                }
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 overflow-hidden rounded-full">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-gray-600">{member.position}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-barber-400 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg">Barbearias atendidas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50.000+</div>
              <div className="text-lg">Agendamentos/mês</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg">Satisfação dos clientes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-lg">Profissionais na equipe</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Faça parte dessa revolução</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Junte-se a centenas de barbearias que já estão utilizando nossa plataforma para crescer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="bg-barber-400 hover:bg-barber-500">
                Ver planos
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-barber-400 text-barber-500">
                Falar com um consultor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
};

export default About;
